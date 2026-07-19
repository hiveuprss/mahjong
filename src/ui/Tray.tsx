import type { CSSProperties } from 'react'
import { themeVisual } from '../game/themes'
import { TRAY_CAPACITY } from '../game/tray'
import { useGameStore } from '../store/gameStore'
import { TileFace } from './TileFace'

const SHARD_COUNT = 8

export function Tray() {
  const tray = useGameStore((s) => s.tray)
  const shatteringIds = useGameStore((s) => s.shatteringIds)
  const screen = useGameStore((s) => s.screen)
  const themeId = useGameStore((s) => s.themeId)

  if (screen === 'menu') return null

  const slots = Array.from({ length: TRAY_CAPACITY }, (_, i) => tray[i] ?? null)
  const bursting = shatteringIds.length > 0

  return (
    <div
      className={['tray', bursting ? 'tray-bursting' : ''].filter(Boolean).join(' ')}
      role="region"
      aria-label={`Tile tray, ${tray.length} of ${TRAY_CAPACITY} slots filled`}
    >
      <div className="tray-slots">
        {slots.map((slot, i) => {
          const shattering = Boolean(slot && shatteringIds.includes(slot.id))
          return (
            <div
              key={slot ? `t-${slot.id}` : `empty-${i}`}
              className={[
                'tray-slot',
                slot ? 'filled' : '',
                shattering ? 'shatter' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {slot && (
                <>
                  <div className="tile tray-tile" data-z={0}>
                    <TileFace face={slot.face} />
                  </div>
                  {shattering && (
                    <div className="shatter-burst" aria-hidden="true">
                      {Array.from({ length: SHARD_COUNT }, (_, s) => {
                        const visual = themeVisual(themeId, slot.face)
                        const style = {
                          ...(visual.kind === 'image' && visual.src
                            ? { '--shard-url': `url(${visual.src})` }
                            : {
                                '--shard-url': 'none',
                                background: visual.background,
                                color: visual.color,
                              }),
                        } as CSSProperties
                        return (
                          <span
                            key={s}
                            className={`shatter-shard shard-${s}`}
                            style={style}
                          >
                            {visual.kind === 'motif' ? visual.motif : null}
                          </span>
                        )
                      })}
                      {Array.from({ length: 10 }, (_, p) => (
                        <span key={`p-${p}`} className={`shatter-spark spark-${p}`} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
