import { forwardRef } from 'react'
import PegSlot from './PegSlot.jsx'
import BoxShelf from './BoxShelf.jsx'

const Bay = forwardRef(function Bay({
  bay,
  canRemove,
  preview,
  onRenameBay,
  onRemoveBay,
  onAddRow,
  onRemoveRow,
  onAddCol,
  onRemoveCol,
  onRemovePlacement,
}, ref) {
  const cols = bay.cols
  const colIndexes = Array.from({ length: cols }, (_, i) => i)
  const canRemoveRow = bay.pegTiers.length > 1
  const canRemoveCol = cols > 1

  return (
    <section className="bay" ref={ref}>
      <header className="bay__header">
        {preview ? (
          <div className="bay__label bay__label--static">{bay.label}</div>
        ) : (
          <input
            className="bay__label"
            value={bay.label}
            onChange={(e) => onRenameBay(bay.id, e.target.value)}
            aria-label="Bay label"
          />
        )}
        {!preview && (
          <button
            className="btn btn--small btn--ghost-danger"
            onClick={() => onRemoveBay(bay.id)}
            disabled={!canRemove}
            title={canRemove ? 'Remove this bay' : 'A rack needs at least one bay'}
          >
            Remove bay
          </button>
        )}
      </header>

      <div className="peg-shelf">
        <div className="bay-section__label">Peg Candies</div>

        {!preview && (
          <button className="add-ctl add-ctl--row" onClick={() => onAddRow(bay.id, 'top')}>
            <span className="add-ctl__plus">+</span> Row
          </button>
        )}

        <div className="peg-area">
        {!preview && (
          <button
            className="add-ctl add-ctl--col"
            onClick={() => onAddCol(bay.id, 'left')}
            title="Add a column on the left"
            aria-label="Add column on the left"
          >
            <span className="add-ctl__plus">+</span>
          </button>
        )}

        <div className="peg-stack" style={{ '--cols': cols }}>
          {!preview && (
            <div className="colhead">
              {colIndexes.map((col) => (
                <div key={col} className="colhead__cell">
                  <button
                    className="mini-remove"
                    onClick={() => onRemoveCol(bay.id, col)}
                    disabled={!canRemoveCol}
                    title="Remove this column"
                    aria-label={`Remove column ${col + 1}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="colhead__spacer" />
            </div>
          )}

          {bay.pegTiers.map((tier) => (
            <div key={tier.id} className="peg-row">
              {colIndexes.map((col) => (
                <PegSlot
                  key={`${tier.id}:${col}`}
                  bayId={bay.id}
                  tierId={tier.id}
                  col={col}
                  slot={tier.slots[col] ?? null}
                  preview={preview}
                  onRemovePlacement={onRemovePlacement}
                />
              ))}
              {!preview && (
                <button
                  className="mini-remove mini-remove--row"
                  onClick={() => onRemoveRow(bay.id, tier.id)}
                  disabled={!canRemoveRow}
                  title="Remove this row"
                  aria-label="Remove row"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {!preview && (
          <button
            className="add-ctl add-ctl--col"
            onClick={() => onAddCol(bay.id, 'right')}
            title="Add a column on the right"
            aria-label="Add column on the right"
          >
            <span className="add-ctl__plus">+</span>
          </button>
        )}
      </div>

        {!preview && (
          <button className="add-ctl add-ctl--row" onClick={() => onAddRow(bay.id, 'bottom')}>
            <span className="add-ctl__plus">+</span> Row
          </button>
        )}
      </div>

      <BoxShelf
        bayId={bay.id}
        placements={bay.boxShelf}
        preview={preview}
        onRemovePlacement={onRemovePlacement}
      />
    </section>
  )
})

export default Bay
