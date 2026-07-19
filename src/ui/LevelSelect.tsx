import { LEVELS, type Difficulty } from '../game/levels'
import { useGameStore } from '../store/gameStore'
import { THEMES } from '../game/themes'

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const DIFF_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
}

export function LevelSelect() {
  const startGame = useGameStore((s) => s.startGame)
  const bestTimes = useGameStore((s) => s.bestTimes)
  const highestUnlocked = useGameStore((s) => s.highestUnlocked)
  const completedLevels = useGameStore((s) => s.completedLevels)
  const themeId = useGameStore((s) => s.themeId)
  const setTheme = useGameStore((s) => s.setTheme)

  return (
    <div className="menu level-menu">
      <h1 className="brand">Mahjong Solitaire</h1>
      <p>
        Clear each board through the tray. Matching pairs shatter — fill four
        unmatched slots and you lose.
      </p>

      <div className="theme-row" role="group" aria-label="Tile theme">
        <span className="theme-row-label">Tiles</span>
        <div className="theme-pills">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={
                theme.id === themeId ? 'theme-pill active' : 'theme-pill'
              }
              onClick={() => setTheme(theme.id)}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      <div className="level-grid">
        {LEVELS.map((level) => {
          const locked = level.number > highestUnlocked
          const done = completedLevels.includes(level.id)
          const best = bestTimes[level.id]
          return (
            <button
              key={level.id}
              type="button"
              className={[
                'level-card',
                `diff-${level.difficulty}`,
                locked ? 'locked' : '',
                done ? 'cleared' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={locked}
              onClick={() => startGame(level.id)}
            >
              <span className="level-num">{level.number}</span>
              <span className="level-body">
                <strong>{level.name}</strong>
                <span>
                  {DIFF_LABEL[level.difficulty]} · {level.slots.length} tiles
                  {done ? ' · Cleared' : ''}
                </span>
                {best !== undefined && (
                  <span className="best">Best {formatTime(best)}</span>
                )}
              </span>
              {locked && <span className="lock">Locked</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
