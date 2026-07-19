import { useEffect, useState } from 'react'
import { getLevel } from '../game/levels'
import { useGameStore } from '../store/gameStore'

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function GameChrome() {
  const levelId = useGameStore((s) => s.levelId)
  const elapsedMs = useGameStore((s) => s.elapsedMs)
  const undoStack = useGameStore((s) => s.undoStack)
  const undosRemaining = useGameStore((s) => s.undosRemaining)
  const revivesRemaining = useGameStore((s) => s.revivesRemaining)
  const stuckVisible = useGameStore((s) => s.stuckVisible)
  const tiles = useGameStore((s) => s.tiles)
  const undo = useGameStore((s) => s.undo)
  const hint = useGameStore((s) => s.hint)
  const revive = useGameStore((s) => s.revive)
  const goToMenu = useGameStore((s) => s.goToMenu)
  const needsNewGameConfirm = useGameStore((s) => s.needsNewGameConfirm)
  const confirmNewGame = useGameStore((s) => s.confirmNewGame)
  const tick = useGameStore((s) => s.tick)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const remaining = tiles.filter((t) => !t.gone).length
  const level = getLevel(levelId)
  const canUndo = undoStack.length > 0 && undosRemaining > 0
  const canRevive = revivesRemaining > 0

  useEffect(() => {
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      tick(now - last)
      last = now
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [tick])

  return (
    <>
      <header className="chrome">
        <div className="chrome-left">
          <button type="button" className="chrome-nav" onClick={goToMenu}>
            Levels
          </button>
          <span className="chrome-title">
            <span className="chrome-idx">
              {String(level.number).padStart(2, '0')}
            </span>
            <span className="chrome-name">{level.name}</span>
          </span>
        </div>

        <div className="chrome-stats" aria-label="Status">
          <span className="stat">
            <em>time</em> {formatTime(elapsedMs)}
          </span>
          <span className="stat">
            <em>left</em> {remaining}
          </span>
        </div>

        <div className="chrome-tools">
          <button type="button" disabled={!canUndo} onClick={undo}>
            Undo {undosRemaining}
          </button>
          <button type="button" onClick={hint}>
            Hint
          </button>
          <button type="button" disabled={!canRevive} onClick={revive}>
            Revive {revivesRemaining}
          </button>
          <button
            type="button"
            onClick={() => {
              if (needsNewGameConfirm()) setConfirmOpen(true)
              else confirmNewGame()
            }}
          >
            New
          </button>
        </div>
      </header>

      {stuckVisible && (
        <div className="banner" role="status">
          <span>
            No free tiles — try hint
            {canRevive ? ' or revive' : ''}.
          </span>
          <button type="button" className="primary" onClick={hint}>
            Hint
          </button>
          <button
            type="button"
            className="primary"
            disabled={!canRevive}
            onClick={revive}
          >
            Revive {revivesRemaining}
          </button>
        </div>
      )}

      {confirmOpen && (
        <div className="overlay" role="dialog">
          <div className="panel">
            <h2>Start over?</h2>
            <p>Current board progress will be lost.</p>
            <div className="panel-actions">
              <button type="button" onClick={() => setConfirmOpen(false)}>
                Keep playing
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  setConfirmOpen(false)
                  confirmNewGame()
                }}
              >
                New game
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
