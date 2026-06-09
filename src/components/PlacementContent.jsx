import CandyImage from './CandyImage.jsx'
import { useImages } from '../context/ImagesContext.jsx'

// Presentational placement card: just the product image + name. The entire card
// is the drag handle (handleProps), with a single delete button top-right.
export default function PlacementContent({ candy, placement, mismatch, preview, handleProps, onRemove }) {
  const { imageFor } = useImages()

  if (!candy) {
    return (
      <div className="placement placement--missing">
        {!preview && (
          <button
            className="placement__remove"
            onClick={() => onRemove(placement.id)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Remove unknown candy"
            title="Remove"
          >
            ✕
          </button>
        )}
        <span className="placement__missing-label">Unknown candy</span>
      </div>
    )
  }

  const dragProps = preview ? {} : handleProps

  return (
    <div
      className={`placement${preview ? '' : ' placement--draggable'}${mismatch && !preview ? ' placement--mismatch' : ''}`}
      {...dragProps}
    >
      {!preview && (
        <button
          className="placement__remove"
          onClick={() => onRemove(placement.id)}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`Remove ${candy.name}`}
          title="Remove"
        >
          ✕
        </button>
      )}

      <div className="placement__img">
        <CandyImage candy={candy} url={imageFor(candy.id)} />
      </div>

      <div className="placement__footer">
        <span className="placement__name" title={candy.name}>
          {candy.name}
        </span>
      </div>
    </div>
  )
}
