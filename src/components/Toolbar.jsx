import { useRef } from 'react'

export default function Toolbar({
  rackName,
  onRenameRack,
  savedLayouts,
  onNew,
  onSave,
  onLoad,
  onDelete,
  onExportPNG,
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

  return (
    <div className="toolbar">
      <div className="toolbar__group toolbar__group--name">
        <label className="toolbar__field">
          <span className="toolbar__field-label">Rack name</span>
          <input
            className="toolbar__name-input"
            value={rackName}
            onChange={(e) => onRenameRack(e.target.value)}
            placeholder="Untitled Rack"
          />
        </label>
      </div>

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
          value={selectedLayoutId}
          onChange={(e) => onSelectLayout(e.target.value)}
          aria-label="Saved layouts"
        >
          <option value="">Saved layouts…</option>
          {savedLayouts.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <button className="btn" onClick={onLoad} disabled={!selectedLayoutId}>Load</button>
        <button className="btn btn--danger" onClick={onDelete} disabled={!selectedLayoutId}>Delete</button>
      </div>

      <div className="toolbar__group toolbar__group--export">
        <button
          className={`btn${preview ? ' btn--primary' : ''}`}
          onClick={onTogglePreview}
          title="Toggle a clean presentation view (what the PNG looks like)"
        >
          {preview ? 'Editing view' : 'Preview'}
        </button>
        <button className="btn" onClick={onExportPNG}>Export PNG</button>
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
  )
}
