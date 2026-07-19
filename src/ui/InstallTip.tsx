import { useMemo } from 'react'
import { useGameStore } from '../store/gameStore'

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true
  )
}

export function InstallTip() {
  const dismissed = useGameStore((s) => s.installTipDismissed)
  const dismiss = useGameStore((s) => s.dismissInstallTip)

  const show = useMemo(() => {
    if (dismissed || isStandalone()) return false
    return isIos()
  }, [dismissed])

  if (!show) return null

  return (
    <div className="install-tip" role="status">
      <p>
        Add to your Home Screen for the full app feel: tap <strong>Share</strong>,
        then <strong>Add to Home Screen</strong>. Works offline after the first visit.
      </p>
      <button type="button" onClick={dismiss}>
        Got it
      </button>
    </div>
  )
}
