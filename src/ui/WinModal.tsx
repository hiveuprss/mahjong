import { getLevel, nextLevel } from '../game/levels'
import { useGameStore } from '../store/gameStore'
import { Fireworks } from './Fireworks'

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function WinModal() {
  const screen = useGameStore((s) => s.screen)
  const levelId = useGameStore((s) => s.levelId)
  const elapsedMs = useGameStore((s) => s.elapsedMs)
  const bestTimes = useGameStore((s) => s.bestTimes)
  const playAgain = useGameStore((s) => s.playAgain)
  const playNextLevel = useGameStore((s) => s.playNextLevel)
  const goToMenu = useGameStore((s) => s.goToMenu)

  if (screen !== 'won') return null

  const level = getLevel(levelId)
  const nxt = nextLevel(levelId)
  const best = bestTimes[levelId]

  return (
    <div className="overlay overlay-win" role="dialog" aria-label="You won">
      <Fireworks />
      <div className="panel panel-win">
        <h2>Board clear</h2>
        <p>
          {String(level.number).padStart(2, '0')} {level.name} ·{' '}
          {formatTime(elapsedMs)}
          {best !== undefined && <> · best {formatTime(best)}</>}
        </p>
        <div className="panel-actions">
          {nxt && (
            <button type="button" className="primary" onClick={playNextLevel}>
              Next · {nxt.number} {nxt.name}
            </button>
          )}
          <button type="button" className="primary" onClick={playAgain}>
            Play again
          </button>
          <button type="button" onClick={goToMenu}>
            Levels
          </button>
        </div>
      </div>
    </div>
  )
}
