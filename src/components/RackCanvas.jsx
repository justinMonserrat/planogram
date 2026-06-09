import { forwardRef } from 'react'
import Bay from './Bay.jsx'

const RackCanvas = forwardRef(function RackCanvas(
  {
    rack,
    preview,
    onRenameBay,
    onRemoveBay,
    onAddBay,
    onAddRow,
    onRemoveRow,
    onAddCol,
    onRemoveCol,
    onRemovePlacement,
  },
  ref,
) {
  const canRemoveBay = rack.bays.length > 1

  return (
    <div className="rack-scroll">
      <div className={`rack${preview ? ' rack--preview' : ''}`} ref={ref}>
        <div className="rack__title-strip">{rack.name}</div>
        <div className="rack__bays">
          {rack.bays.map((bay) => (
            <Bay
              key={bay.id}
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
