import { useDroppable } from '@dnd-kit/core'
import SlotPlacement from './SlotPlacement.jsx'
import { DROP } from '../lib/rack.js'
import { useCandies } from '../context/CandyContext.jsx'

export default function PegSlot({ bayId, tierId, col, slot, preview, onRemovePlacement }) {
  const { getCandy } = useCandies()
  const id = DROP.slot(bayId, tierId, col)
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { kind: 'slot', bayId, tierId, col },
    disabled: preview,
  })

  const candy = slot ? getCandy(slot.candyId) : null

  return (
    <div
      ref={setNodeRef}
      className={`peg-slot${isOver ? ' is-over' : ''}${slot ? ' is-filled' : ' is-empty'}${preview ? ' is-preview' : ''}`}
    >
      {slot ? (
        <SlotPlacement
          candy={candy}
          placement={slot}
          mismatch={candy && candy.packageType !== 'peg'}
          preview={preview}
          onRemove={onRemovePlacement}
        />
      ) : (
        !preview && <span className="peg-slot__peg" aria-hidden="true" />
      )}
    </div>
  )
}
