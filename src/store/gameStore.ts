import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  MAX_REVIVES,
  MAX_UNDOS,
  reviveBoard,
} from '../game/assist'
import { dealBoard, mulberry32 } from '../game/deal'
import {
  FIRST_LEVEL_ID,
  getLevel,
  LEVELS,
  nextLevel,
  type Level,
} from '../game/levels'
import { cloneTiles, isFree, type BoardTile } from '../game/rules'
import {
  findTrayHint,
  hasTrayMove,
  sendToTray,
  type TrayTile,
} from '../game/tray'

export type Screen = 'menu' | 'playing' | 'won' | 'lost'

interface Snapshot {
  tiles: BoardTile[]
  tray: TrayTile[]
}

interface GameState {
  screen: Screen
  levelId: string
  tiles: BoardTile[]
  tray: TrayTile[]
  shatteringIds: number[]
  hintIds: number[]
  undoStack: Snapshot[]
  undosRemaining: number
  revivesRemaining: number
  elapsedMs: number
  timerRunning: boolean
  bestTimes: Record<string, number>
  /** Highest level number the player may open (1-based). */
  highestUnlocked: number
  completedLevels: string[]
  themeId: string
  shakeId: number | null
  installTipDismissed: boolean
  stuckVisible: boolean

  startGame: (levelId?: string) => void
  selectTile: (id: number) => void
  undo: () => void
  hint: () => void
  revive: () => void
  tick: (deltaMs: number) => void
  setTimerRunning: (running: boolean) => void
  needsNewGameConfirm: () => boolean
  confirmNewGame: (levelId?: string) => void
  playAgain: () => void
  playNextLevel: () => void
  goToMenu: () => void
  setTheme: (themeId: string) => void
  dismissInstallTip: () => void
  clearShake: () => void
  isLevelUnlocked: (level: Level) => boolean
}

function dealLevel(levelId: string): BoardTile[] {
  const level = getLevel(levelId)
  const rng = mulberry32(level.number * 9973 + 42)
  return dealBoard(level.slots, rng)
}

function cloneTray(tray: TrayTile[]): TrayTile[] {
  return tray.map((t) => ({ ...t }))
}

let shatterTimer: ReturnType<typeof setTimeout> | null = null

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
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

      isLevelUnlocked: (level) => level.number <= get().highestUnlocked,

      startGame: (levelId = FIRST_LEVEL_ID) => {
        if (shatterTimer) {
          clearTimeout(shatterTimer)
          shatterTimer = null
        }
        const level = getLevel(levelId)
        if (level.number > get().highestUnlocked) return

        set({
          screen: 'playing',
          levelId,
          tiles: dealLevel(levelId),
          tray: [],
          shatteringIds: [],
          hintIds: [],
          undoStack: [],
          undosRemaining: MAX_UNDOS,
          revivesRemaining: MAX_REVIVES,
          elapsedMs: 0,
          timerRunning: true,
          shakeId: null,
          stuckVisible: false,
        })
      },

      selectTile: (id) => {
        const { tiles, tray, undoStack, elapsedMs, levelId, bestTimes, screen } =
          get()
        if (screen !== 'playing') return

        const tile = tiles.find((t) => t.id === id)
        if (!tile || tile.gone) return

        if (!isFree(tile, tiles)) {
          set({ shakeId: id, hintIds: [] })
          return
        }

        if (tray.length >= 4) return

        const result = sendToTray(tiles, tray, id)
        if (!result) return

        const nextBest = { ...bestTimes }
        let completedLevels = get().completedLevels
        let highestUnlocked = get().highestUnlocked

        if (result.won) {
          const prev = nextBest[levelId]
          if (prev === undefined || elapsedMs < prev) {
            nextBest[levelId] = elapsedMs
          }
          if (!completedLevels.includes(levelId)) {
            completedLevels = [...completedLevels, levelId]
          }
          const nxt = nextLevel(levelId)
          if (nxt && nxt.number > highestUnlocked) {
            highestUnlocked = nxt.number
          }
        }

        const afterAdd = [...tray, { id: tile.id, face: tile.face }]
        const nextScreen: Screen = result.won
          ? 'won'
          : result.lost
            ? 'lost'
            : 'playing'

        if (shatterTimer) {
          clearTimeout(shatterTimer)
          shatterTimer = null
        }

        set({
          tiles: result.tiles,
          tray: afterAdd,
          shatteringIds: result.shattered,
          hintIds: [],
          undoStack: [
            ...undoStack,
            { tiles: cloneTiles(tiles), tray: cloneTray(tray) },
          ],
          shakeId: null,
          stuckVisible: false,
          bestTimes: nextBest,
          completedLevels,
          highestUnlocked,
          screen: nextScreen,
          timerRunning: nextScreen === 'playing',
        })

        const finish = () => {
          shatterTimer = null
          const current = get()
          set({
            tray: result.tray,
            shatteringIds: [],
            stuckVisible:
              current.screen === 'playing' &&
              !hasTrayMove(current.tiles, result.tray) &&
              current.tiles.some((t) => !t.gone),
          })
        }

        if (result.shattered.length > 0) {
          shatterTimer = setTimeout(finish, 720)
        } else {
          finish()
        }
      },

      undo: () => {
        const { undoStack, undosRemaining } = get()
        if (undoStack.length === 0 || undosRemaining <= 0) return
        if (shatterTimer) {
          clearTimeout(shatterTimer)
          shatterTimer = null
        }
        const previous = undoStack[undoStack.length - 1]!
        set({
          tiles: cloneTiles(previous.tiles),
          tray: cloneTray(previous.tray),
          undoStack: undoStack.slice(0, -1),
          undosRemaining: undosRemaining - 1,
          shatteringIds: [],
          hintIds: [],
          stuckVisible:
            !hasTrayMove(previous.tiles, previous.tray) &&
            previous.tiles.some((t) => !t.gone),
          screen: 'playing',
          timerRunning: true,
        })
      },

      hint: () => {
        const { tiles, tray } = get()
        const id = findTrayHint(tiles, tray)
        if (id === null) {
          set({ stuckVisible: true, hintIds: [] })
          return
        }
        set({ hintIds: [id], stuckVisible: false })
      },

      revive: () => {
        const { tiles, tray, revivesRemaining, screen } = get()
        if (revivesRemaining <= 0) return
        if (screen !== 'playing' && screen !== 'lost') return
        if (shatterTimer) {
          clearTimeout(shatterTimer)
          shatterTimer = null
        }

        const { tiles: nextTiles, tray: nextTray } = reviveBoard(tiles, tray)
        set({
          tiles: nextTiles,
          tray: nextTray,
          revivesRemaining: revivesRemaining - 1,
          hintIds: [],
          shatteringIds: [],
          undoStack: [],
          stuckVisible:
            !hasTrayMove(nextTiles, nextTray) &&
            nextTiles.some((t) => !t.gone),
          screen: 'playing',
          timerRunning: true,
        })
      },

      tick: (deltaMs) => {
        const { timerRunning, elapsedMs } = get()
        if (!timerRunning) return
        set({ elapsedMs: elapsedMs + deltaMs })
      },

      setTimerRunning: (running) => set({ timerRunning: running }),

      needsNewGameConfirm: () => {
        const { screen, tiles, tray } = get()
        return (
          screen === 'playing' &&
          (tray.length > 0 ||
            (tiles.some((t) => !t.gone) && tiles.some((t) => t.gone)))
        )
      },

      confirmNewGame: (levelId) => {
        get().startGame(levelId ?? get().levelId)
      },

      playAgain: () => {
        get().startGame(get().levelId)
      },

      playNextLevel: () => {
        const nxt = nextLevel(get().levelId)
        if (nxt) get().startGame(nxt.id)
        else get().goToMenu()
      },

      goToMenu: () => {
        if (shatterTimer) {
          clearTimeout(shatterTimer)
          shatterTimer = null
        }
        set({
          screen: 'menu',
          tiles: [],
          tray: [],
          shatteringIds: [],
          hintIds: [],
          undoStack: [],
          undosRemaining: MAX_UNDOS,
          revivesRemaining: MAX_REVIVES,
          timerRunning: false,
          stuckVisible: false,
        })
      },

      setTheme: (themeId) => set({ themeId }),

      dismissInstallTip: () => set({ installTipDismissed: true }),

      clearShake: () => set({ shakeId: null }),
    }),
    {
      name: 'mahjong-solitaire-v4',
      storage: createJSONStorage(() => {
        if (typeof localStorage === 'undefined') {
          const memory = new Map<string, string>()
          return {
            getItem: (name) => memory.get(name) ?? null,
            setItem: (name, value) => {
              memory.set(name, value)
            },
            removeItem: (name) => {
              memory.delete(name)
            },
          }
        }
        return localStorage
      }),
      partialize: (state) => ({
        screen: state.screen === 'lost' ? 'playing' : state.screen,
        levelId: state.levelId,
        tiles: state.tiles,
        tray: state.tray,
        undoStack: state.undoStack,
        undosRemaining: state.undosRemaining,
        revivesRemaining: state.revivesRemaining,
        elapsedMs: state.elapsedMs,
        bestTimes: state.bestTimes,
        highestUnlocked: state.highestUnlocked,
        completedLevels: state.completedLevels,
        themeId: state.themeId,
        installTipDismissed: state.installTipDismissed,
        stuckVisible: state.stuckVisible,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (!Array.isArray(state.tray)) state.tray = []
        if (!Array.isArray(state.completedLevels)) state.completedLevels = []
        if (typeof state.highestUnlocked !== 'number') state.highestUnlocked = 1
        if (typeof state.undosRemaining !== 'number') {
          state.undosRemaining = MAX_UNDOS
        }
        if (typeof state.revivesRemaining !== 'number') {
          state.revivesRemaining = MAX_REVIVES
        }
        if (!state.themeId) state.themeId = 'classic'
        // Migrate old layoutId saves
        const legacy = state as GameState & { layoutId?: string }
        if (!state.levelId && legacy.layoutId) {
          state.levelId = FIRST_LEVEL_ID
        }
        if (!LEVELS.some((l) => l.id === state.levelId)) {
          state.levelId = FIRST_LEVEL_ID
        }
        state.shatteringIds = []
        if (state.screen === 'playing' && state.tiles.length > 0) {
          state.timerRunning = true
        }
      },
    },
  ),
)
