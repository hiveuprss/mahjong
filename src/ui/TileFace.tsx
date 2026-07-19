import { themeVisual } from '../game/themes'
import type { TileFace as Face } from '../game/tiles'
import { useGameStore } from '../store/gameStore'

export function TileFace({ face, alt }: { face: Face; alt?: string }) {
  const themeId = useGameStore((s) => s.themeId)
  const visual = themeVisual(themeId, face)

  if (visual.kind === 'image' && visual.src) {
    return <img src={visual.src} alt={alt ?? face} draggable={false} />
  }

  return (
    <span
      className="tile-motif"
      style={{
        background: visual.background,
        color: visual.color,
      }}
      aria-label={alt ?? face}
    >
      {visual.motif}
    </span>
  )
}
