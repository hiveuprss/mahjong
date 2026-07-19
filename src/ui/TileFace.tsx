import type { CSSProperties } from 'react'
import { themeVisual } from '../game/themes'
import type { TileFace as Face } from '../game/tiles'
import { useGameStore } from '../store/gameStore'

export function TileFace({ face, alt }: { face: Face; alt?: string }) {
  const themeId = useGameStore((s) => s.themeId)
  const visual = themeVisual(themeId, face)

  if (visual.kind === 'image' && visual.src) {
    return (
      <span className="tile-face">
        <img src={visual.src} alt={alt ?? face} draggable={false} />
      </span>
    )
  }

  return (
    <span
      className="tile-face motif-wash"
      style={
        {
          '--motif-wash': visual.background,
          color: visual.color,
        } as CSSProperties
      }
      aria-label={alt ?? face}
    >
      <span className="tile-motif">{visual.motif}</span>
    </span>
  )
}
