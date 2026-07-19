import { canMatch, type TileFace } from './tiles'

/** Half-tile coordinate position: 2 units = 1 tile width/height. */
export interface Slot {
  x: number
  y: number
  z: number
}

export interface BoardTile extends Slot {
  id: number
  face: TileFace
  gone: boolean
}

function overlapsXY(a: Slot, b: Slot): boolean {
  return Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2
}

/** A tile is free when nothing covers it and at least one side (left or right) is open. */
export function isFree(tile: BoardTile, tiles: BoardTile[]): boolean {
  if (tile.gone) return false

  for (const other of tiles) {
    if (other.gone || other.id === tile.id) continue
    if (other.z > tile.z && overlapsXY(other, tile)) return false
  }

  let leftBlocked = false
  let rightBlocked = false
  for (const other of tiles) {
    if (other.gone || other.id === tile.id || other.z !== tile.z) continue
    if (Math.abs(other.y - tile.y) >= 2) continue
    if (other.x === tile.x - 2) leftBlocked = true
    if (other.x === tile.x + 2) rightBlocked = true
  }

  return !leftBlocked || !rightBlocked
}

export function freeTiles(tiles: BoardTile[]): BoardTile[] {
  return tiles.filter((t) => isFree(t, tiles))
}

export function canSelectPair(a: BoardTile, b: BoardTile, tiles: BoardTile[]): boolean {
  if (a.id === b.id) return false
  if (!isFree(a, tiles) || !isFree(b, tiles)) return false
  return canMatch(a.face, b.face)
}

export function removePair(tiles: BoardTile[], aId: number, bId: number): BoardTile[] {
  return tiles.map((t) =>
    t.id === aId || t.id === bId ? { ...t, gone: true } : t,
  )
}

export function remainingCount(tiles: BoardTile[]): number {
  return tiles.filter((t) => !t.gone).length
}

export function isWon(tiles: BoardTile[]): boolean {
  return remainingCount(tiles) === 0
}

export function cloneTiles(tiles: BoardTile[]): BoardTile[] {
  return tiles.map((t) => ({ ...t }))
}
