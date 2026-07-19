import { useEffect, useState } from 'react'
import { useGameStore } from './store/gameStore'
import { Board } from './ui/Board'
import { GameChrome } from './ui/GameChrome'
import { InstallTip } from './ui/InstallTip'
import { LevelSelect } from './ui/LevelSelect'
import { LoseModal } from './ui/LoseModal'
import { Tray } from './ui/Tray'
import { WinModal } from './ui/WinModal'

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const [offlineBlocked, setOfflineBlocked] = useState(false)

  useEffect(() => {
    const check = () => {
      // First visit with nothing cached: navigator.onLine false → show gate
      if (!navigator.onLine && screen === 'menu') {
        // If SW already controls the page, assets are available
        const controlled = Boolean(navigator.serviceWorker?.controller)
        setOfflineBlocked(!controlled)
      } else {
        setOfflineBlocked(false)
      }
    }
    check()
    window.addEventListener('online', check)
    window.addEventListener('offline', check)
    return () => {
      window.removeEventListener('online', check)
      window.removeEventListener('offline', check)
    }
  }, [screen])

  if (offlineBlocked) {
    return (
      <div className="offline-gate">
        <h1 className="brand">Mahjong Solitaire</h1>
        <p>Connect once to download the game. After that, you can play offline anytime.</p>
      </div>
    )
  }

  return (
    <div className="app-shell">
      {screen === 'menu' ? (
        <LevelSelect />
      ) : (
        <>
          <GameChrome />
          <Tray />
          <Board />
        </>
      )}
      <WinModal />
      <LoseModal />
      <InstallTip />
    </div>
  )
}
