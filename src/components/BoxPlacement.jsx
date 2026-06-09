import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PlacementContent from './PlacementContent.jsx'

// A placement in the box bin. The whole card is the drag handle (sortable).
export default function BoxPlacement({ candy, placement, mismatch, preview, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: placement.id,
    data: { type: 'placement', placementId: placement.id },
    disabled: preview,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`box-placement${isDragging ? ' is-dragging' : ''}`}
    >
      <PlacementContent
        candy={candy}
        placement={placement}
        mismatch={mismatch}
        preview={preview}
        handleProps={{ ...listeners, ...attributes }}
        onRemove={onRemove}
      />
    </div>
  )
}
