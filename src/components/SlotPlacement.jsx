import { useDraggable } from '@dnd-kit/core'
import PlacementContent from './PlacementContent.jsx'

// A placement sitting in a peg-grid slot. The whole card is draggable.
export default function SlotPlacement({ candy, placement, mismatch, preview, onRemove }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: placement.id,
    data: { type: 'placement', placementId: placement.id },
    disabled: preview,
  })

  return (
    <div ref={setNodeRef} className={`slot-placement${isDragging ? ' is-dragging' : ''}`}>
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
