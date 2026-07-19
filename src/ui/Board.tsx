import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { isFree } from '../game/rules'
import { useGameStore } from '../store/gameStore'
import { TileFace } from './TileFace'

/** Visual tile size (logic uses abstract 2×2 half-tile coords). */
const TILE_W = 48
const TILE_H = 64
/** Half-tile steps — abut exactly (flush), no gap and no overlap. */
const STEP_X = TILE_W / 2
const STEP_Y = TILE_H / 2
/**
 * Per-layer depth: rise straight up only. A diagonal lift made whole
 * pyramids lean (and threw Turtle’s centered peak off-axis).
 */
const LIFT_X = 0
const LIFT_Y = -6
const PAD = 24

export function Board() {
  const tiles = useGameStore((s) => s.tiles)
  const hintIds = useGameStore((s) => s.hintIds)
  const shakeId = useGameStore((s) => s.shakeId)
  const selectTile = useGameStore((s) => s.selectTile)
  const clearShake = useGameStore((s) => s.clearShake)

  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const visible = useMemo(() => tiles.filter((t) => !t.gone), [tiles])

  const layout = useMemo(() => {
    if (visible.length === 0) {
      return { width: 0, height: 0, minX: 0, minY: 0, maxZ: 0, originY: PAD }
    }
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    let maxZ = 0
    for (const t of visible) {
      minX = Math.min(minX, t.x)
      minY = Math.min(minY, t.y)
      maxX = Math.max(maxX, t.x)
      maxY = Math.max(maxY, t.y)
      maxZ = Math.max(maxZ, t.z)
    }

    const width =
      (maxX - minX) * STEP_X + TILE_W + maxZ * LIFT_X + PAD * 2
    const height =
      (maxY - minY) * STEP_Y + TILE_H + maxZ * Math.abs(LIFT_Y) + PAD * 2
    const originY = PAD + maxZ * Math.abs(LIFT_Y)

    return { width, height, minX, minY, maxZ, originY }
  }, [visible])

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el || layout.width === 0) return

    const update = () => {
      const availW = el.clientWidth - 16
      const availH = el.clientHeight - 16
      if (availW <= 0 || availH <= 0) return
      const next = Math.min(availW / layout.width, availH / layout.height)
      setScale(Number.isFinite(next) && next > 0 ? next : 1)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [layout.width, layout.height])

  const sorted = useMemo(
    () => [...visible].sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x),
    [visible],
  )

  return (
    <div className="board-wrap" ref={wrapRef}>
      <div
        className="board"
        style={{
          width: layout.width,
          height: layout.height,
          transform: `scale(${scale})`,
        }}
      >
        {sorted.map((tile) => {
          const free = isFree(tile, tiles)
          const left =
            (tile.x - layout.minX) * STEP_X + tile.z * LIFT_X + PAD
          const top =
            (tile.y - layout.minY) * STEP_Y +
            tile.z * LIFT_Y +
            layout.originY
          const className = [
            'tile',
            free ? 'free' : '',
            hintIds.includes(tile.id) ? 'hint' : '',
            shakeId === tile.id ? 'shake' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={tile.id}
              type="button"
              className={className}
              data-z={tile.z}
              style={{
                left,
                top,
                zIndex: tile.z * 200 + tile.y * 2 + tile.x,
                width: TILE_W,
                height: TILE_H,
              }}
              aria-label={tile.face}
              onClick={() => selectTile(tile.id)}
              onAnimationEnd={() => {
                if (shakeId === tile.id) clearShake()
              }}
            >
              <TileFace face={tile.face} alt="" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
