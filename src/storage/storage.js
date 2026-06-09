// Storage module — the ONLY place the app talks to persistence.
//
// v1 implementation uses localStorage. To add a backend later (e.g. Supabase),
// implement the same async interface in a new file (see storage.supabase.example.js)
// and swap the `storage` export below. The rest of the app never touches
// localStorage or any backend directly, so no component changes are required.
//
// Interface (all async so a network backend is a drop-in replacement):
//   getWip():            Promise<Rack | null>
//   setWip(rack):        Promise<void>
//   listLayouts():       Promise<{ id, name, updatedAt }[]>
//   getLayout(id):       Promise<Rack | null>
//   saveLayout(rack):    Promise<SavedLayout>   // upserts by rack.id
//   deleteLayout(id):    Promise<void>
//   getImageOverrides(): Promise<{ [candyId]: url }>
//   setImageOverride(candyId, url): Promise<void>
//   getCustomCandies(): Promise<Candy[]>
//   saveCustomCandy(candy): Promise<void>   // upserts by candy.id
//   deleteCustomCandy(id): Promise<void>

const KEYS = {
  wip: 'planogram:wip',
  layouts: 'planogram:layouts',
  images: 'planogram:images',
  candies: 'planogram:candies',
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('Storage write failed', err)
  }
}

const localStorageBackend = {
  async getWip() {
    return readJSON(KEYS.wip, null)
  },

  async setWip(rack) {
    writeJSON(KEYS.wip, rack)
  },

  async listLayouts() {
    const map = readJSON(KEYS.layouts, {})
    return Object.values(map)
      .map(({ rack, updatedAt }) => ({ id: rack.id, name: rack.name, updatedAt }))
      .sort((a, b) => b.updatedAt - a.updatedAt)
  },

  async getLayout(id) {
    const map = readJSON(KEYS.layouts, {})
    return map[id]?.rack ?? null
  },

  async saveLayout(rack) {
    const map = readJSON(KEYS.layouts, {})
    const updatedAt = Date.now()
    map[rack.id] = { rack, updatedAt }
    writeJSON(KEYS.layouts, map)
    return { id: rack.id, name: rack.name, updatedAt }
  },

  async deleteLayout(id) {
    const map = readJSON(KEYS.layouts, {})
    delete map[id]
    writeJSON(KEYS.layouts, map)
  },

  async getImageOverrides() {
    return readJSON(KEYS.images, {})
  },

  async setImageOverride(candyId, url) {
    const map = readJSON(KEYS.images, {})
    if (url) map[candyId] = url
    else delete map[candyId]
    writeJSON(KEYS.images, map)
  },

  async getCustomCandies() {
    const map = readJSON(KEYS.candies, {})
    return Object.values(map)
  },

  async saveCustomCandy(candy) {
    const map = readJSON(KEYS.candies, {})
    map[candy.id] = candy
    writeJSON(KEYS.candies, map)
  },

  async deleteCustomCandy(id) {
    const map = readJSON(KEYS.candies, {})
    delete map[id]
    writeJSON(KEYS.candies, map)
  },
}

// Swap this for a different backend implementation when you add Supabase.
export const storage = localStorageBackend
