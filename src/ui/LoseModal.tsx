import { useGameStore } from '../store/gameStore'

export function LoseModal() {
  const screen = useGameStore((s) => s.screen)
  const playAgain = useGameStore((s) => s.playAgain)
  const goToMenu = useGameStore((s) => s.goToMenu)
  const undo = useGameStore((s) => s.undo)
  const revive = useGameStore((s) => s.revive)
  const undoStack = useGameStore((s) => s.undoStack)
  const undosRemaining = useGameStore((s) => s.undosRemaining)
  const revivesRemaining = useGameStore((s) => s.revivesRemaining)

  if (screen !== 'lost') return null

  const canUndo = undoStack.length > 0 && undosRemaining > 0
  const canRevive = revivesRemaining > 0

  return (
    <div className="overlay" role="dialog" aria-label="You lost">
      <div className="panel">
        <h2>Tray full</h2>
        <p>
          The tray filled with four tiles that don’t match. Undo, revive (return
          tray tiles and reshuffle), or start fresh.
        </p>
        <div className="panel-actions">
          <button
            type="button"
            className="primary"
            disabled={!canUndo}
            onClick={undo}
          >
            Undo · {undosRemaining}
          </button>
          <button
            type="button"
            className="primary"
            disabled={!canRevive}
            onClick={revive}
          >
            Revive · {revivesRemaining}
          </button>
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
