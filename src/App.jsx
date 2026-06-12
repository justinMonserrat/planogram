import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
} from '@dnd-kit/core'

import Catalog from './components/Catalog.jsx'
import InstructionsModal from './components/InstructionsModal.jsx'
import RackCanvas from './components/RackCanvas.jsx'
import Toolbar from './components/Toolbar.jsx'
import CandyImage from './components/CandyImage.jsx'
import { ImagesProvider } from './context/ImagesContext.jsx'
import { CandyProvider } from './context/CandyContext.jsx'
import { useHistory } from './hooks/useHistory.js'

import { storage } from './storage/storage.js'
import { candies as builtinCandies } from './data/candies.js'
import { getDefaultRack } from './lib/defaultLayout.js'
import { exportJSON, exportPNG, exportBayPNGs, readJSONFile } from './lib/exporters.js'
import {
  uid,
  makeRack,
  normalizeRack,
  addBay,
  removeBay,
  renameBay,
  addRow,
  removeRow,
  addCol,
  removeCol,
  placeInSlot,
  addToBox,
  removePlacement,
  removeCandyFromRack,
  reorderBox,
  movePlacement,
  locatePlacement,
  countPlacements,
} from './lib/rack.js'

export default function App() {
  const {
    value: rack,
    set: setRack,
    reset: resetRack,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory(null)

  const [ready, setReady] = useState(false)
  const [savedLayouts, setSavedLayouts] = useState([])
  const [selectedLayoutId, setSelectedLayoutId] = useState('')
  const [status, setStatus] = useState(null)
  const [activeDrag, setActiveDrag] = useState(null)
  const [imageOverrides, setImageOverrides] = useState({})
  const [customCandies, setCustomCandies] = useState([])
  const [preview, setPreview] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  const rackNodeRef = useRef(null)
  const bayRefs = useRef({})
  const statusTimer = useRef(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const flash = useCallback((msg, type = 'info') => {
    setStatus({ msg, type })
    if (statusTimer.current) clearTimeout(statusTimer.current)
    statusTimer.current = setTimeout(() => setStatus(null), 2600)
  }, [])

  const refreshLayouts = useCallback(async () => {
    setSavedLayouts(await storage.listLayouts())
  }, [])

  // Restore work-in-progress + overrides + custom candies on first load.
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const [wip, overrides, custom] = await Promise.all([
        storage.getWip(),
        storage.getImageOverrides(),
        storage.getCustomCandies(),
      ])
      if (!mounted) return
      resetRack(wip ? normalizeRack(wip) : getDefaultRack())
      setImageOverrides(overrides || {})
      setCustomCandies(custom || [])
      await refreshLayouts()
      if (!localStorage.getItem('planogram:instructions-seen')) {
        setShowInstructions(true)
        localStorage.setItem('planogram:instructions-seen', '1')
      }
      setReady(true)
    })()
    return () => {
      mounted = false
    }
  }, [refreshLayouts, resetRack])

  // Auto-save WIP whenever the rack changes (debounced).
  useEffect(() => {
    if (!ready || !rack) return
    const t = setTimeout(() => storage.setWip(rack), 400)
    return () => clearTimeout(t)
  }, [rack, ready])

  // ---- Candy catalog (built-in + custom) ----
  const candies = useMemo(() => [...builtinCandies, ...customCandies], [customCandies])
  const candyById = useMemo(() => Object.fromEntries(candies.map((c) => [c.id, c])), [candies])
  const getCandy = useCallback((id) => candyById[id], [candyById])
  const builtinIds = useMemo(() => new Set(builtinCandies.map((c) => c.id)), [])
  const isBuiltin = useCallback((id) => builtinIds.has(id), [builtinIds])

  const addCandy = useCallback(
    (data) => {
      const candy = { id: uid('candy'), image: '', ...data }
      setCustomCandies((prev) => [...prev, candy])
      storage.saveCustomCandy(candy)
      flash(`Added “${candy.name}”`, 'success')
      return candy
    },
    [flash],
  )

  const deleteCandy = useCallback(
    (id) => {
      if (builtinIds.has(id)) return
      const candy = candyById[id]
      if (!window.confirm(`Delete “${candy?.name}”? It will be removed from the catalog and any racks.`)) {
        return
      }
      setCustomCandies((prev) => prev.filter((c) => c.id !== id))
      storage.deleteCustomCandy(id)
      setRack((r) => removeCandyFromRack(r, id))
      flash('Candy deleted')
    },
    [builtinIds, candyById, setRack, flash],
  )

  const candyValue = useMemo(
    () => ({ candies, getCandy, isBuiltin, addCandy, deleteCandy }),
    [candies, getCandy, isBuiltin, addCandy, deleteCandy],
  )

  // ---- Image resolution / editing ----
  const imageFor = useCallback(
    (candyId) => imageOverrides[candyId] ?? candyById[candyId]?.image ?? '',
    [imageOverrides, candyById],
  )

  const onEditImage = useCallback(
    (candyId) => {
      const candy = candyById[candyId]
      const current = imageOverrides[candyId] ?? candy?.image ?? ''
      const next = window.prompt(
        `Product image URL for “${candy?.name}”.\nPaste a direct image link (leave blank to clear):`,
        current,
      )
      if (next === null) return
      const url = next.trim()
      setImageOverrides((prev) => {
        const out = { ...prev }
        if (url) out[candyId] = url
        else delete out[candyId]
        return out
      })
      storage.setImageOverride(candyId, url)
      flash(url ? 'Image updated' : 'Image cleared', 'success')
    },
    [imageOverrides, candyById, flash],
  )

  const imagesValue = useMemo(() => ({ imageFor, onEditImage }), [imageFor, onEditImage])

  // ---- Rack edit handlers ----
  const onRenameRack = (name) => setRack((r) => ({ ...r, name }), { coalesce: 'rename-rack' })
  const onAddBay = () => setRack((r) => addBay(r))
  const onRemoveBay = (bayId) => setRack((r) => removeBay(r, bayId))
  const onRenameBay = (bayId, label) =>
    setRack((r) => renameBay(r, bayId, label), { coalesce: `rename-bay:${bayId}` })
  const onAddRow = (bayId, pos) => setRack((r) => addRow(r, bayId, pos))
  const onRemoveRow = (bayId, tierId) => setRack((r) => removeRow(r, bayId, tierId))
  const onAddCol = (bayId, pos) => setRack((r) => addCol(r, bayId, pos))
  const onRemoveCol = (bayId, col) => setRack((r) => removeCol(r, bayId, col))
  const onRemovePlacement = (placementId) => setRack((r) => removePlacement(r, placementId))

  // ---- Undo / redo keyboard shortcuts ----
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      const editable =
        t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable
      if (editable) return
      if (!(e.ctrlKey || e.metaKey)) return
      const key = e.key.toLowerCase()
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  // ---- Drag and drop ----
  const handleDragStart = (event) => {
    const data = event.active.data.current
    if (data?.type === 'catalog') {
      setActiveDrag(getCandy(data.candyId))
    } else if (data?.type === 'placement') {
      const loc = locatePlacement(rack, data.placementId)
      let candy = null
      if (loc) {
        const bay = rack.bays.find((b) => b.id === loc.bayId)
        const p =
          loc.kind === 'box'
            ? bay.boxShelf[loc.index]
            : bay.pegTiers.find((t) => t.id === loc.tierId)?.slots[loc.col]
        candy = p ? getCandy(p.candyId) : null
      }
      setActiveDrag(candy)
    }
  }

  const resolveDest = (overData) => {
    if (!overData) return null
    if (overData.kind === 'slot') {
      return { kind: 'slot', bayId: overData.bayId, tierId: overData.tierId, col: overData.col }
    }
    if (overData.kind === 'box') {
      return { kind: 'box', bayId: overData.bayId }
    }
    if (overData.type === 'placement') {
      const loc = locatePlacement(rack, overData.placementId)
      if (loc?.kind === 'box') return { kind: 'box', bayId: loc.bayId, index: loc.index }
      if (loc?.kind === 'slot') return { kind: 'slot', bayId: loc.bayId, tierId: loc.tierId, col: loc.col }
    }
    return null
  }

  const handleDragEnd = (event) => {
    setActiveDrag(null)
    const { active, over } = event
    if (!over) return
    const activeData = active.data.current

    if (over.data.current?.kind === 'catalog-cancel' && activeData?.type === 'catalog') {
      return
    }

    const dest = resolveDest(over.data.current)
    if (!dest) return

    if (activeData?.type === 'catalog') {
      if (dest.kind === 'slot') {
        setRack((r) => placeInSlot(r, dest.bayId, dest.tierId, dest.col, activeData.candyId))
      } else {
        setRack((r) => addToBox(r, dest.bayId, activeData.candyId, dest.index))
      }
      return
    }

    if (activeData?.type === 'placement') {
      const placementId = activeData.placementId
      setRack((r) => {
        const from = locatePlacement(r, placementId)
        if (!from) return r
        if (dest.kind === 'box' && from.kind === 'box' && from.bayId === dest.bayId) {
          const bay = r.bays.find((b) => b.id === dest.bayId)
          const to = dest.index == null ? bay.boxShelf.length - 1 : dest.index
          return reorderBox(r, dest.bayId, from.index, to)
        }
        return movePlacement(r, placementId, dest)
      })
    }
  }

  // ---- Toolbar actions ----
  const onNew = () => {
    if (countPlacements(rack) > 0 && !window.confirm('Start a new rack? Unsaved placements will be cleared.')) {
      return
    }
    resetRack(makeRack())
    setSelectedLayoutId('')
    flash('Started a new rack')
  }

  const onSave = async () => {
    const saved = await storage.saveLayout(rack)
    await refreshLayouts()
    setSelectedLayoutId(saved.id)
    flash(`Saved “${rack.name}”`, 'success')
  }

  const onLoad = async (layoutId = selectedLayoutId) => {
    if (!layoutId) return
    const loaded = await storage.getLayout(layoutId)
    if (loaded) {
      resetRack(normalizeRack(loaded))
      flash(`Loaded “${loaded.name}”`, 'success')
    } else {
      flash('Could not find that layout', 'error')
    }
  }

  const onDelete = async () => {
    if (!selectedLayoutId) return
    const target = savedLayouts.find((l) => l.id === selectedLayoutId)
    if (!window.confirm(`Delete saved layout “${target?.name ?? ''}”?`)) return
    await storage.deleteLayout(selectedLayoutId)
    await refreshLayouts()
    setSelectedLayoutId('')
    flash('Layout deleted')
  }

  const onExportJSON = () => {
    exportJSON(rack)
    flash('Exported JSON')
  }

  const onExportPNG = async () => {
    // Capture the clean "presentation" rendering regardless of edit/preview state.
    setExporting(true)
    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      await waitForImages(rackNodeRef.current)
      await exportPNG(rackNodeRef.current, rack)
      flash('Exported PNG', 'success')
    } catch (err) {
      console.error(err)
      flash('PNG export failed (image host may block cross-origin use)', 'error')
    } finally {
      setExporting(false)
    }
  }

  const onExportBayPNGs = async () => {
    if (rack.bays.length < 2) return
    setExporting(true)
    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      for (const bay of rack.bays) {
        await waitForImages(bayRefs.current[bay.id])
      }
      await exportBayPNGs(rack, bayRefs.current)
      flash(`Exported ${rack.bays.length} bay PNGs`, 'success')
    } catch (err) {
      console.error(err)
      flash('Bay PNG export failed', 'error')
    } finally {
      setExporting(false)
    }
  }

  const onLoadDefault = () => {
    if (
      countPlacements(rack) > 0 &&
      !window.confirm('Replace the current rack with the default layout? Unsaved changes will be lost.')
    ) {
      return
    }
    resetRack(getDefaultRack())
    setSelectedLayoutId('')
    setShowInstructions(false)
    flash('Loaded default layout', 'success')
  }

  const onImportJSON = async (file) => {
    try {
      const imported = await readJSONFile(file)
      resetRack(normalizeRack(imported))
      setSelectedLayoutId('')
      flash('Imported layout', 'success')
    } catch (err) {
      console.error(err)
      flash(`Import failed: ${err.message}`, 'error')
    }
  }

  const showPreview = preview || exporting

  if (!ready || !rack) {
    return <div className="app-loading">Loading Planogram Maker…</div>
  }

  return (
    <CandyProvider value={candyValue}>
      <ImagesProvider value={imagesValue}>
        <div className="app">
          <header className="app-header">
            <div className="app-header__brand">
              <h1 className="app-header__title">Planogram Maker</h1>
              <p className="app-header__subtitle">Candy planogram builder for concession racks</p>
            </div>
            <button
              className="btn btn--small app-header__help"
              onClick={() => setShowInstructions(true)}
            >
              How it works
            </button>
          </header>

          <Toolbar
            savedLayouts={savedLayouts}
            selectedLayoutId={selectedLayoutId}
            onSelectLayout={setSelectedLayoutId}
            onNew={onNew}
            onSave={onSave}
            onLoad={onLoad}
            onLoadDefault={onLoadDefault}
            onDelete={onDelete}
            onExportPNG={onExportPNG}
            onExportBayPNGs={onExportBayPNGs}
            bayCount={rack.bays.length}
            onExportJSON={onExportJSON}
            onImportJSON={onImportJSON}
            preview={preview}
            onTogglePreview={() => setPreview((p) => !p)}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={(args) => {
              const pointerHits = pointerWithin(args)
              if (pointerHits.length > 0) {
                if (args.active?.data?.current?.type === 'catalog') {
                  const catalogHit = pointerHits.find((h) => h.id === 'catalog-panel')
                  if (catalogHit) return [catalogHit]
                }
                return pointerHits
              }
              return closestCenter(args)
            }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveDrag(null)}
          >
            <div className="app-body">
              <Catalog />
              <main className="workspace">
                <RackCanvas
                  ref={rackNodeRef}
                  bayRefs={bayRefs}
                  rack={rack}
                  preview={showPreview}
                  onRenameRack={onRenameRack}
                  onRenameBay={onRenameBay}
                  onRemoveBay={onRemoveBay}
                  onAddBay={onAddBay}
                  onAddRow={onAddRow}
                  onRemoveRow={onRemoveRow}
                  onAddCol={onAddCol}
                  onRemoveCol={onRemoveCol}
                  onRemovePlacement={onRemovePlacement}
                />
              </main>
            </div>

            <DragOverlay dropAnimation={null}>
              {activeDrag ? (
                <div className="drag-overlay">
                  <CandyImage candy={activeDrag} url={imageFor(activeDrag.id)} showNameFallback={false} />
                  <span className="drag-overlay__name">{activeDrag.name}</span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {showInstructions && (
            <InstructionsModal onClose={() => setShowInstructions(false)} />
          )}

          {status && <div className={`toast toast--${status.type}`}>{status.msg}</div>}
        </div>
      </ImagesProvider>
    </CandyProvider>
  )
}

async function waitForImages(node) {
  if (!node) return
  const imgs = [...node.querySelectorAll('img')]
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((res) => {
            img.onload = res
            img.onerror = res
          }),
    ),
  )
}
