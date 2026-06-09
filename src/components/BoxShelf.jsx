import { useDroppable } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import BoxPlacement from './BoxPlacement.jsx'
import { DROP } from '../lib/rack.js'
import { useCandies } from '../context/CandyContext.jsx'

export default function BoxShelf({ bayId, placements, preview, onRemovePlacement }) {
  const { getCandy } = useCandies()
  const id = DROP.box(bayId)
  const { setNodeRef, isOver } = useDroppable({ id, data: { kind: 'box', bayId }, disabled: preview })

  return (
    <div className="box-shelf">
      <div className="bay-section__label">Box Candies</div>
      <div
        ref={setNodeRef}
        className={`box-shelf__drop${isOver ? ' is-over' : ''}${placements.length === 0 ? ' is-empty' : ''}${preview ? ' is-preview' : ''}`}
      >
        <SortableContext items={placements.map((p) => p.id)} strategy={horizontalListSortingStrategy}>
          {placements.map((p) => {
            const candy = getCandy(p.candyId)
            return (
              <BoxPlacement
                key={p.id}
                candy={candy}
                placement={p}
                mismatch={candy && candy.packageType !== 'box'}
                preview={preview}
                onRemove={onRemovePlacement}
              />
            )
          })}
        </SortableContext>
        {placements.length === 0 && !preview && (
          <span className="box-shelf__placeholder">Drag a box candy here</span>
        )}
      </div>
    </div>
  )
}
