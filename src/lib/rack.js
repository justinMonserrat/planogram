// Pure helpers for building and transforming the Rack data model.
//
//   Rack:      { id, name, bays: Bay[] }
//   Bay:       { id, label, cols, pegTiers: PegTier[], boxShelf: Placement[] }
//   PegTier:   { id, slots: (Placement | null)[] }   // length === bay.cols
//   Placement: { id, candyId }
//
// The peg area is a 2D grid: pegTiers are rows, each row has `cols` slots.
// Each slot holds at most one Placement. The box bin is a flowing list.

const DEFAULT_ROWS = 3
const DEFAULT_COLS = 4

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`
}

const clone = (obj) =>
  typeof structuredClone === 'function'
    ? structuredClone(obj)
    : JSON.parse(JSON.stringify(obj))

export function makePlacement(candyId) {
  return { id: uid('pl'), candyId }
}

export function makePegTier(cols = DEFAULT_COLS) {
  return { id: uid('tier'), slots: Array.from({ length: cols }, () => null) }
}

export function makeBay(label = 'Bay', rows = DEFAULT_ROWS, cols = DEFAULT_COLS) {
  return {
    id: uid('bay'),
    label,
    cols,
    pegTiers: Array.from({ length: rows }, () => makePegTier(cols)),
    boxShelf: [],
  }
}

export function makeRack(name = 'Untitled Rack') {
  return { id: uid('rack'), name, bays: [makeBay('Bay 1')] }
}

// ---- Drop-target id encoding --------------------------------------------
// Peg slot: `${bayId}::slot::${tierId}::${col}`
// Box bin:  `${bayId}::box`
export const DROP = {
  slot: (bayId, tierId, col) => `${bayId}::slot::${tierId}::${col}`,
  box: (bayId) => `${bayId}::box`,
  parse(id) {
    const parts = id.split('::')
    if (parts[1] === 'box') return { kind: 'box', bayId: parts[0] }
    if (parts[1] === 'slot')
      return { kind: 'slot', bayId: parts[0], tierId: parts[2], col: Number(parts[3]) }
    return null
  },
}

// ---- Normalization (imports / older saves) ------------------------------
export function normalizeRack(rack) {
  if (!rack || !Array.isArray(rack.bays)) return makeRack()
  const out = clone(rack)
  if (!out.id) out.id = uid('rack')
  if (!out.name) out.name = 'Untitled Rack'
  out.bays = out.bays.map((bay) => normalizeBay(bay))
  return out
}

function normalizeBay(bay) {
  const b = { ...bay }
  b.id = b.id || uid('bay')
  b.label = b.label || 'Bay'
  b.boxShelf = Array.isArray(b.boxShelf) ? b.boxShelf.filter(Boolean) : []
  const tiers = Array.isArray(b.pegTiers) ? b.pegTiers : []
  // Determine column count: explicit cols, else widest legacy row, else default.
  let cols = Number(b.cols) || 0
  if (!cols) {
    for (const t of tiers) {
      const len = Array.isArray(t.slots)
        ? t.slots.length
        : Array.isArray(t.placements)
          ? t.placements.length
          : 0
      cols = Math.max(cols, len)
    }
    cols = Math.max(cols, DEFAULT_COLS)
  }
  b.cols = cols
  b.pegTiers = tiers.map((t) => {
    const tier = { id: t.id || uid('tier'), slots: [] }
    if (Array.isArray(t.slots)) {
      tier.slots = t.slots.map((s) => (s ? s : null))
    } else if (Array.isArray(t.placements)) {
      // Legacy flowing rows -> grid slots
      tier.slots = t.placements.slice()
    }
    // Pad / trim to cols.
    while (tier.slots.length < cols) tier.slots.push(null)
    if (tier.slots.length > cols) tier.slots = tier.slots.slice(0, cols)
    return tier
  })
  if (b.pegTiers.length === 0) b.pegTiers = [makePegTier(cols)]
  return b
}

// ---- Bay-level transforms -----------------------------------------------
function withBay(rack, bayId, fn) {
  const r = clone(rack)
  const bay = r.bays.find((b) => b.id === bayId)
  if (bay) fn(bay)
  return r
}

export function addBay(rack) {
  const r = clone(rack)
  r.bays.push(makeBay(`Bay ${r.bays.length + 1}`))
  return r
}

export function removeBay(rack, bayId) {
  if (rack.bays.length <= 1) return rack
  const r = clone(rack)
  r.bays = r.bays.filter((b) => b.id !== bayId)
  return r
}

export function renameBay(rack, bayId, label) {
  return withBay(rack, bayId, (b) => {
    b.label = label
  })
}

export function addRow(rack, bayId, position = 'bottom') {
  return withBay(rack, bayId, (b) => {
    const tier = makePegTier(b.cols)
    if (position === 'top') b.pegTiers.unshift(tier)
    else b.pegTiers.push(tier)
  })
}

export function removeRow(rack, bayId, tierId) {
  return withBay(rack, bayId, (b) => {
    if (b.pegTiers.length <= 1) return
    b.pegTiers = b.pegTiers.filter((t) => t.id !== tierId)
  })
}

export function addCol(rack, bayId, position = 'right') {
  return withBay(rack, bayId, (b) => {
    b.cols += 1
    for (const t of b.pegTiers) {
      if (position === 'left') t.slots.unshift(null)
      else t.slots.push(null)
    }
  })
}

export function removeCol(rack, bayId, col) {
  return withBay(rack, bayId, (b) => {
    if (b.cols <= 1) return
    b.cols -= 1
    for (const t of b.pegTiers) t.slots.splice(col, 1)
  })
}

// ---- Placement transforms -----------------------------------------------
export function placeInSlot(rack, bayId, tierId, col, candyId) {
  return withBay(rack, bayId, (b) => {
    const tier = b.pegTiers.find((t) => t.id === tierId)
    if (!tier) return
    tier.slots[col] = makePlacement(candyId)
  })
}

export function addToBox(rack, bayId, candyId, index = null) {
  return withBay(rack, bayId, (b) => {
    const placement = makePlacement(candyId)
    if (index == null || index >= b.boxShelf.length) b.boxShelf.push(placement)
    else b.boxShelf.splice(Math.max(0, index), 0, placement)
  })
}

export function removePlacement(rack, placementId) {
  const r = clone(rack)
  for (const bay of r.bays) {
    bay.boxShelf = bay.boxShelf.filter((p) => p.id !== placementId)
    for (const tier of bay.pegTiers) {
      tier.slots = tier.slots.map((s) => (s && s.id === placementId ? null : s))
    }
  }
  return r
}

// Remove every placement referencing a given candy (used when a custom candy is
// deleted from the catalog).
export function removeCandyFromRack(rack, candyId) {
  const r = clone(rack)
  for (const bay of r.bays) {
    bay.boxShelf = bay.boxShelf.filter((p) => p.candyId !== candyId)
    for (const tier of bay.pegTiers) {
      tier.slots = tier.slots.map((s) => (s && s.candyId === candyId ? null : s))
    }
  }
  return r
}

export function reorderBox(rack, bayId, fromIndex, toIndex) {
  return withBay(rack, bayId, (b) => {
    const [moved] = b.boxShelf.splice(fromIndex, 1)
    b.boxShelf.splice(toIndex, 0, moved)
  })
}

// Move an existing placement to a destination (slot or box). Slots swap when
// the destination is occupied.
export function movePlacement(rack, placementId, dest) {
  const r = clone(rack)
  const src = locateIn(r, placementId)
  if (!src) return rack
  const moving = takeFrom(r, src)

  if (dest.kind === 'slot') {
    const bay = r.bays.find((b) => b.id === dest.bayId)
    const tier = bay?.pegTiers.find((t) => t.id === dest.tierId)
    if (!tier) return rack
    const occupant = tier.slots[dest.col]
    tier.slots[dest.col] = moving
    if (occupant) putBack(r, src, occupant) // swap into the vacated source
    return r
  }

  // dest.kind === 'box'
  const bay = r.bays.find((b) => b.id === dest.bayId)
  if (!bay) return rack
  const at = dest.index == null ? bay.boxShelf.length : Math.max(0, Math.min(dest.index, bay.boxShelf.length))
  bay.boxShelf.splice(at, 0, moving)
  return r
}

// Internal: find a placement's location inside a (mutable) rack.
function locateIn(r, placementId) {
  for (const bay of r.bays) {
    const idx = bay.boxShelf.findIndex((p) => p.id === placementId)
    if (idx !== -1) return { kind: 'box', bayId: bay.id, index: idx }
    for (const tier of bay.pegTiers) {
      const col = tier.slots.findIndex((s) => s && s.id === placementId)
      if (col !== -1) return { kind: 'slot', bayId: bay.id, tierId: tier.id, col }
    }
  }
  return null
}

function takeFrom(r, loc) {
  const bay = r.bays.find((b) => b.id === loc.bayId)
  if (loc.kind === 'box') {
    const [p] = bay.boxShelf.splice(loc.index, 1)
    return p
  }
  const tier = bay.pegTiers.find((t) => t.id === loc.tierId)
  const p = tier.slots[loc.col]
  tier.slots[loc.col] = null
  return p
}

function putBack(r, loc, placement) {
  const bay = r.bays.find((b) => b.id === loc.bayId)
  if (loc.kind === 'box') {
    bay.boxShelf.splice(Math.min(loc.index, bay.boxShelf.length), 0, placement)
    return
  }
  const tier = bay.pegTiers.find((t) => t.id === loc.tierId)
  if (tier) tier.slots[loc.col] = placement
}

// Public locate (returns a stable description).
export function locatePlacement(rack, placementId) {
  return locateIn(rack, placementId)
}

export function countPlacements(rack) {
  let n = 0
  for (const bay of rack.bays) {
    n += bay.boxShelf.length
    for (const tier of bay.pegTiers) n += tier.slots.filter(Boolean).length
  }
  return n
}
