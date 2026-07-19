import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MAX_REVIVES, MAX_UNDOS } from '../game/assist'
import { FIRST_LEVEL_ID } from '../game/levels'
import { freeTiles } from '../game/rules'
import { useGameStore } from './gameStore'

describe('gameStore tray + levels', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useGameStore.setState({
      screen: 'menu',
      levelId: FIRST_LEVEL_ID,
      tiles: [],
      tray: [],
      shatteringIds: [],
      hintIds: [],
      undoStack: [],
      undosRemaining: MAX_UNDOS,
      revivesRemaining: MAX_REVIVES,
      elapsedMs: 0,
      timerRunning: false,
      bestTimes: {},
      highestUnlocked: 1,
      completedLevels: [],
      themeId: 'classic',
      shakeId: null,
      installTipDismissed: false,
      stuckVisible: false,
    })
  })

  it('starts level 1 and moves a free tile into the tray', () => {
    useGameStore.getState().startGame(FIRST_LEVEL_ID)
    const free = freeTiles(useGameStore.getState().tiles)
    expect(free.length).toBeGreaterThan(0)
    const id = free[0]!.id

    useGameStore.getState().selectTile(id)
    const after = useGameStore.getState()
    expect(after.tray.some((t) => t.id === id)).toBe(true)
    expect(after.tiles.find((t) => t.id === id)?.gone).toBe(true)
  })

  it('refuses locked levels', () => {
    useGameStore.getState().startGame('level-5')
    expect(useGameStore.getState().screen).toBe('menu')
    expect(useGameStore.getState().tiles).toHaveLength(0)
  })

  it('unlocks the next level on a win', () => {
    useGameStore.setState({
      screen: 'playing',
      levelId: 'level-1',
      highestUnlocked: 1,
      completedLevels: [],
      tiles: [
        { id: 1, face: 'man-1', x: 0, y: 0, z: 0, gone: false },
        { id: 2, face: 'man-1', x: 4, y: 0, z: 0, gone: false },
      ],
      tray: [],
      undoStack: [],
      undosRemaining: MAX_UNDOS,
      revivesRemaining: MAX_REVIVES,
      elapsedMs: 12000,
      timerRunning: true,
      bestTimes: {},
      themeId: 'classic',
      shatteringIds: [],
      hintIds: [],
      shakeId: null,
      installTipDismissed: true,
      stuckVisible: false,
    })

    useGameStore.getState().selectTile(1)
    useGameStore.getState().selectTile(2)
    vi.advanceTimersByTime(800)

    const after = useGameStore.getState()
    expect(after.screen).toBe('won')
    expect(after.highestUnlocked).toBe(2)
    expect(after.completedLevels).toContain('level-1')
    expect(after.bestTimes['level-1']).toBe(12000)
  })

  it('undo spends a charge; revive returns tray tiles', () => {
    useGameStore.getState().startGame(FIRST_LEVEL_ID)
    const id = freeTiles(useGameStore.getState().tiles)[0]!.id
    useGameStore.getState().selectTile(id)
    useGameStore.getState().undo()
    expect(useGameStore.getState().undosRemaining).toBe(MAX_UNDOS - 1)
    expect(useGameStore.getState().tray).toHaveLength(0)

    useGameStore.getState().selectTile(id)
    useGameStore.getState().revive()
    expect(useGameStore.getState().tray).toHaveLength(0)
    expect(useGameStore.getState().tiles.find((t) => t.id === id)?.gone).toBe(
      false,
    )
    expect(useGameStore.getState().revivesRemaining).toBe(MAX_REVIVES - 1)
  })

  it('persists theme selection', () => {
    useGameStore.getState().setTheme('fauna')
    expect(useGameStore.getState().themeId).toBe('fauna')
  })
})
