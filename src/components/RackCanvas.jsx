import { forwardRef } from 'react'
import Bay from './Bay.jsx'

const RackCanvas = forwardRef(function RackCanvas(
  {
    rack,
    preview,
    onRenameRack,
    onRenameBay,
    onRemoveBay,
    onAddBay,
    onAddRow,
    onRemoveRow,
    onAddCol,
    onRemoveCol,
    onRemovePlacement,
    bayRefs,
  },
  ref,
) {
  const canRemoveBay = rack.bays.length > 1

  const setBayRef = (bayId) => (el) => {
    if (!bayRefs?.current) return
    if (el) bayRefs.current[bayId] = el
    else delete bayRefs.current[bayId]
  }

  return (
    <div className="rack-scroll">
      <div className={`rack${preview ? ' rack--preview' : ''}`} ref={ref}>
        {preview ? (
          <div className="rack__title-strip">{rack.name}</div>
        ) : (
          <input
            className="rack__title-strip rack__title-input"
            value={rack.name}
            onChange={(e) => onRenameRack(e.target.value)}
            aria-label="Rack name"
            placeholder="Untitled Rack"
          />
        )}
        <div className="rack__bays">
          {rack.bays.map((bay) => (
            <Bay
              key={bay.id}
              ref={setBayRef(bay.id)}
              bay={bay}
              canRemove={canRemoveBay}
              preview={preview}
              onRenameBay={onRenameBay}
              onRemoveBay={onRemoveBay}
              onAddRow={onAddRow}
              onRemoveRow={onRemoveRow}
              onAddCol={onAddCol}
              onRemoveCol={onRemoveCol}
              onRemovePlacement={onRemovePlacement}
            />
          ))}
        </div>
      </div>
      {!preview && (
        <button className="add-ctl add-ctl--bay" onClick={onAddBay} title="Add another bay">
          <span className="add-ctl__plus">+</span> Add bay
        </button>
      )}
    </div>
  )
})

export default RackCanvas
