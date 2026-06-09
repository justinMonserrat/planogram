import { useState } from 'react'
import { textOn } from '../lib/color.js'

// Renders a candy's product photo when available, otherwise a clean color
// fallback tile with the candy name. Used on catalog tiles and placements.
export default function CandyImage({ candy, url, className = '', showNameFallback = true }) {
  const [failed, setFailed] = useState(false)
  const hasImage = url && !failed

  if (hasImage) {
    return (
      <img
        className={`candy-img ${className}`}
        src={url}
        alt={candy.name}
        crossOrigin="anonymous"
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div
      className={`candy-img candy-img--fallback ${className}`}
      style={{ background: candy.color, color: textOn(candy.color) }}
    >
      {showNameFallback && <span className="candy-img__name">{candy.name}</span>}
    </div>
  )
}
