import { canMatch, type TileFace } from './tiles'
import { dealBoard, isSolvable, pairFaces, type Rng } from './deal'
import { cloneTiles, freeTiles, type BoardTile, type Slot } from './rules'
import type { TrayTile } from './tray'

export const MAX_UNDOS = 5
export const MAX_REVIVES = 2

export { isSolvable } from './deal'

export interface HintPair {
  aId: number
  bId: number
}

export function findHint(tiles: BoardTile[]): HintPair | null {
  const free = freeTiles(tiles)
  for (let i = 0; i < free.length; i++) {
    for (let j = i + 1; j < free.length; j++) {
      if (canMatch(free[i]!.face, free[j]!.face)) {
        return { aId: free[i]!.id, bId: free[j]!.id }
      }
    }
  }
  return null
}

export function hasLegalMove(tiles: BoardTile[]): boolean {
  return findHint(tiles) !== null
}

function shuffleInPlace<T>(items: T[], rng: Rng): void {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
}

/**
 * Reshuffle remaining tiles onto the same slots.
 * Prefers a fresh backwards-deal; falls back to re-pairing existing faces.
 */
export function reshuffleRemaining(tiles: BoardTile[], rng: Rng = Math.random): BoardTile[] {
  const remaining = tiles.filter((t) => !t.gone)
  if (remaining.length === 0) return cloneTiles(tiles)
  if (remaining.length % 2 !== 0) {
    throw new Error('Remaining tile count must be even')
  }

  const slots: Slot[] = remaining.map(({ x, y, z }) => ({ x, y, z }))

  try {
    const redealt = dealBoard(slots, rng)
    const byId = new Map(tiles.map((t) => [t.id, { ...t }]))
    remaining.forEach((old, index) => {
      const next = byId.get(old.id)!
      next.face = redealt[index]!.face
      next.gone = false
    })
    return tiles.map((t) => byId.get(t.id)!)
  } catch {
    // Geometry may not admit a full free-pair teardown; re-pair faces in place.
    return reshuffleFacesOnly(tiles, rng)
  }
}

/**
 * Return tray tiles to the board, then reshuffle all remaining faces.
 */
export function reviveBoard(
  tiles: BoardTile[],
  tray: TrayTile[],
  rng: Rng = Math.random,
): { tiles: BoardTile[]; tray: TrayTile[] } {
  const trayIds = new Set(tray.map((t) => t.id))
  const restored = cloneTiles(tiles).map((t) =>
    trayIds.has(t.id) ? { ...t, gone: false } : t,
  )
  return { tiles: reshuffleRemaining(restored, rng), tray: [] }
}

function reshuffleFacesOnly(tiles: BoardTile[], rng: Rng): BoardTile[] {
  const remaining = tiles.filter((t) => !t.gone)
  const faces = remaining.map((t) => t.face)

  for (let attempt = 0; attempt < 80; attempt++) {
    const pairs = pairFaces([...faces], rng)
    shuffleInPlace(pairs, rng)
    const flat: TileFace[] = pairs.flat()
    const next = cloneTiles(tiles)
    let i = 0
    for (const t of next) {
      if (t.gone) continue
      t.face = flat[i++]!
    }
    if (isSolvable(next) || hasLegalMove(next)) {
      return next
    }
  }

  // Last resort: return a face shuffle even if solver is slow/uncertain
  const pairs = pairFaces([...faces], rng)
  const flat = pairs.flat()
  const next = cloneTiles(tiles)
  let i = 0
  for (const t of next) {
    if (t.gone) continue
    t.face = flat[i++]!
  }
  return next
}
