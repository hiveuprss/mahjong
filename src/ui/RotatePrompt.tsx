import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'

/** Only gate phones/tablets in portrait — not desktop browser windows. */
function shouldBlockPlay(): boolean {
  if (typeof window === 'undefined') return false
  const portrait = window.matchMedia('(orientation: portrait)').matches
  const coarse = window.matchMedia('(any-pointer: coarse)').matches
  const narrow = window.matchMedia('(max-width: 900px)').matches
  return portrait && coarse && narrow
}

export function RotatePrompt() {
  const [blocked, setBlocked] = useState(shouldBlockPlay)
  const screen = useGameStore((s) => s.screen)
  const setTimerRunning = useGameStore((s) => s.setTimerRunning)

  useEffect(() => {
    const update = () => setBlocked(shouldBlockPlay())
    const portrait = window.matchMedia('(orientation: portrait)')
    const coarse = window.matchMedia('(any-pointer: coarse)')
    const narrow = window.matchMedia('(max-width: 900px)')
    update()
    portrait.addEventListener('change', update)
    coarse.addEventListener('change', update)
    narrow.addEventListener('change', update)
    window.addEventListener('resize', update)
    return () => {
      portrait.removeEventListener('change', update)
      coarse.removeEventListener('change', update)
      narrow.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    if (screen !== 'playing') return
    setTimerRunning(!blocked)
  }, [blocked, screen, setTimerRunning])

  if (!blocked || screen === 'menu') return null

  return (
    <div className="overlay" role="dialog" aria-label="Rotate device">
      <div className="panel">
        <h2>Rotate for best play</h2>
        <p>
          Mahjong boards are happiest in landscape. Turn your phone sideways to
          continue.
        </p>
      </div>
    </div>
  )
}
