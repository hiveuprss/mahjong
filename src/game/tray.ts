import { canMatch, type TileFace } from './tiles'
import { freeTiles, type BoardTile } from './rules'

export const TRAY_CAPACITY = 4

export interface TrayTile {
  id: number
  face: TileFace
}

export interface TrayResolveResult {
  /** Tray after all matching pairs are removed. */
  tray: TrayTile[]
  /** Tile ids removed by matching (order: pairs as cleared). */
  shattered: number[]
}

/** Find the earliest matching pair in the tray (left-to-right). */
export function findTrayMatch(
  tray: TrayTile[],
): { a: number; b: number } | null {
  for (let i = 0; i < tray.length; i++) {
    for (let j = i + 1; j < tray.length; j++) {
      if (canMatch(tray[i]!.face, tray[j]!.face)) {
        return { a: tray[i]!.id, b: tray[j]!.id }
      }
    }
  }
  return null
}

/** Remove matching pairs until none remain (matches may be out of order). */
export function resolveTray(tray: TrayTile[]): TrayResolveResult {
  let next = [...tray]
  const shattered: number[] = []
  for (;;) {
    const pair = findTrayMatch(next)
    if (!pair) break
    shattered.push(pair.a, pair.b)
    next = next.filter((t) => t.id !== pair.a && t.id !== pair.b)
  }
  return { tray: next, shattered }
}

export function isTrayLost(tray: TrayTile[]): boolean {
  return tray.length >= TRAY_CAPACITY
}

/** Board cleared and tray empty. */
export function isTrayWon(tiles: BoardTile[], tray: TrayTile[]): boolean {
  return tiles.every((t) => t.gone) && tray.length === 0
}

/**
 * Send a board tile into the tray, mark it gone on the board, then shatter matches.
 * Caller must ensure the tile is free and the tray is not already full.
 */
export function sendToTray(
  tiles: BoardTile[],
  tray: TrayTile[],
  tileId: number,
): {
  tiles: BoardTile[]
  tray: TrayTile[]
  shattered: number[]
  lost: boolean
  won: boolean
} | null {
  if (tray.length >= TRAY_CAPACITY) return null
  const tile = tiles.find((t) => t.id === tileId)
  if (!tile || tile.gone) return null

  const nextTiles = tiles.map((t) =>
    t.id === tileId ? { ...t, gone: true } : t,
  )
  const afterAdd = [...tray, { id: tile.id, face: tile.face }]
  const { tray: resolved, shattered } = resolveTray(afterAdd)
  const lost = isTrayLost(resolved)
  const won = !lost && isTrayWon(nextTiles, resolved)

  return {
    tiles: nextTiles,
    tray: resolved,
    shattered,
    lost,
    won,
  }
}

/** Hint: prefer a free tile that matches the tray; else any free tile. */
export function findTrayHint(
  tiles: BoardTile[],
  tray: TrayTile[],
): number | null {
  if (tray.length >= TRAY_CAPACITY) return null
  const free = freeTiles(tiles)
  if (free.length === 0) return null

  for (const t of free) {
    if (tray.some((slot) => canMatch(slot.face, t.face))) return t.id
  }
  return free[0]!.id
}

export function hasTrayMove(tiles: BoardTile[], tray: TrayTile[]): boolean {
  return tray.length < TRAY_CAPACITY && freeTiles(tiles).length > 0
}
