import { useDraggable } from '@dnd-kit/core'
import { PACKAGE_TYPES, categoryColor } from '../data/candies.js'
import CandyImage from './CandyImage.jsx'
import { useImages } from '../context/ImagesContext.jsx'

export default function CatalogTile({ candy, onDelete }) {
  const { imageFor, onEditImage } = useImages()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `catalog::${candy.id}`,
    data: { type: 'catalog', candyId: candy.id },
  })

  const url = imageFor(candy.id)

  return (
    <div
      className={`catalog-tile${isDragging ? ' is-dragging' : ''}`}
      style={{ '--cat-color': categoryColor[candy.category] }}
    >
      <button
        ref={setNodeRef}
        className="catalog-tile__drag"
        {...listeners}
        {...attributes}
        title={`${candy.name} — drag onto the rack`}
      >
        <span className="catalog-tile__pkg">{PACKAGE_TYPES[candy.packageType].label}</span>
        <div className="catalog-tile__img">
          <CandyImage candy={candy} url={url} showNameFallback={false} />
        </div>
        <span className="catalog-tile__name">{candy.name}</span>
      </button>
      <div className="catalog-tile__tools">
        {onEditImage && (
          <button
            className="catalog-tile__tool"
            onClick={() => onEditImage(candy.id)}
            title={url ? 'Change product image URL' : 'Add a product image URL'}
            aria-label={`Set image for ${candy.name}`}
          >
            {url ? '✎' : '＋img'}
          </button>
        )}
        {onDelete && (
          <button
            className="catalog-tile__tool catalog-tile__tool--danger"
            onClick={onDelete}
            title="Delete this custom candy"
            aria-label={`Delete ${candy.name}`}
          >
            🗑
          </button>
        )}
      </div>
    </div>
  )
}
