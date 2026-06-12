import { useRef, useState } from 'react'

const DEFAULT_LAYOUT_VALUE = '__default__'

export default function Toolbar({
  savedLayouts,
  onNew,
  onSave,
  onLoad,
  onLoadDefault,
  onDelete,
  onExportPNG,
  onExportBayPNGs,
  bayCount,
  onExportJSON,
  onImportJSON,
  selectedLayoutId,
  onSelectLayout,
  preview,
  onTogglePreview,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) {
  const fileInputRef = useRef(null)
  const [layoutPicker, setLayoutPicker] = useState('')

  const handleLayoutPick = (e) => {
    const value = e.target.value
    setLayoutPicker('')
    if (!value) return
    if (value === DEFAULT_LAYOUT_VALUE) {
      onLoadDefault()
      onSelectLayout('')
      return
    }
    onSelectLayout(value)
    onLoad(value)
  }

  return (
    <div className="toolbar">
      <div className="toolbar__group">
        <button className="btn btn--icon" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl/Cmd+Z)" aria-label="Undo">↶</button>
        <button className="btn btn--icon" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl/Cmd+Shift+Z)" aria-label="Redo">↷</button>
      </div>

      <div className="toolbar__group">
        <button className="btn" onClick={onNew}>New rack</button>
        <button className="btn btn--primary" onClick={onSave}>Save</button>
      </div>

      <div className="toolbar__group">
        <select
          className="toolbar__select"
          value={layoutPicker}
          onChange={handleLayoutPick}
          aria-label="Load a layout"
        >
          <option value="" disabled>Load a layout…</option>
          <option value={DEFAULT_LAYOUT_VALUE}>Default layout</option>
          {savedLayouts.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <button className="btn btn--danger" onClick={onDelete} disabled={!selectedLayoutId}>Delete</button>
      </div>

      <div className="toolbar__end">
        <div className="toolbar__group">
          <button
            className={`btn${preview ? ' btn--primary' : ''}`}
            onClick={onTogglePreview}
            title="Toggle a clean presentation view (what the PNG looks like)"
          >
            {preview ? 'Editing view' : 'Preview'}
          </button>
        </div>

        <div className="toolbar__group">
          <button className="btn" onClick={onExportPNG}>Export PNG</button>
          {bayCount > 1 && (
            <button
              className="btn"
              onClick={onExportBayPNGs}
              title="Download each bay as its own PNG file"
            >
              Export Bay PNGs
            </button>
          )}
        </div>

        <div className="toolbar__group">
          <button className="btn" onClick={onExportJSON}>Export JSON</button>
          <button className="btn" onClick={() => fileInputRef.current?.click()}>Import JSON</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onImportJSON(file)
              e.target.value = ''
            }}
          />
        </div>
      </div>
    </div>
  )
}
