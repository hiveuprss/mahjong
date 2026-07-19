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
      <header className="menu-hero">
        <p className="menu-kicker">Free · Offline · No ads</p>
        <h1 className="brand">Mahjong Solitaire</h1>
        <p className="menu-lede">
          Free tiles into the tray. Matching pairs clear. Four unmatched ends
          the round.
        </p>
      </header>

      <div className="theme-row" role="group" aria-label="Tile theme">
        <span className="theme-row-label">Faces</span>
        <div className="theme-tabs">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={
                theme.id === themeId ? 'theme-tab active' : 'theme-tab'
              }
              onClick={() => setTheme(theme.id)}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      <div className="level-ledger" aria-label="Levels">
        <div className="level-ledger-head">
          <span>#</span>
          <span>Board</span>
          <span>Best</span>
        </div>
        {LEVELS.map((level) => {
          const locked = level.number > highestUnlocked
          const done = completedLevels.includes(level.id)
          const best = bestTimes[level.id]
          return (
            <button
              key={level.id}
              type="button"
              className={[
                'level-row',
                `diff-${level.difficulty}`,
                locked ? 'locked' : '',
                done ? 'cleared' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={locked}
              onClick={() => startGame(level.id)}
            >
              <span className="level-num">
                {String(level.number).padStart(2, '0')}
              </span>
              <span className="level-body">
                <strong>{level.name}</strong>
                <span>
                  {DIFF_LABEL[level.difficulty]} · {level.slots.length}
                  {done ? ' · cleared' : ''}
                </span>
              </span>
              <span className="level-meta">
                {locked ? (
                  <span className="lock">Lock</span>
                ) : best !== undefined ? (
                  <span className="best">{formatTime(best)}</span>
                ) : (
                  <span className="best quiet">—</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
