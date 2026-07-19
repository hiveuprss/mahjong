import { describe, expect, it } from 'vitest'
import { findHint, hasLegalMove, reshuffleRemaining, reviveBoard } from './assist'
import { dealBoard, mulberry32 } from './deal'
import { getLayout } from './layouts'
import { canSelectPair, removePair, type BoardTile } from './rules'
import type { TrayTile } from './tray'

describe('assist', () => {
  it('finds a hint when moves exist', () => {
    const board = dealBoard(getLayout('garden').slots, mulberry32(7))
    const hint = findHint(board)
    expect(hint).not.toBeNull()
    const a = board.find((t) => t.id === hint!.aId)!
    const b = board.find((t) => t.id === hint!.bId)!
    expect(canSelectPair(a, b, board)).toBe(true)
  })

  it('returns null hint when no moves remain on a blocked micro-board', () => {
    const tiles: BoardTile[] = [
      { id: 0, x: 2, y: 0, z: 0, face: 'man-1', gone: false },
      { id: 1, x: 0, y: 0, z: 0, face: 'man-2', gone: false },
      { id: 2, x: 4, y: 0, z: 0, face: 'man-3', gone: false },
    ]
    // Middle blocked; sides are free but faces don't match
    expect(hasLegalMove(tiles)).toBe(false)
    expect(findHint(tiles)).toBeNull()
  })

  it('reshuffles remaining tiles and restores a legal move when possible', () => {
    let board = dealBoard(getLayout('garden').slots, mulberry32(3))
    const hint = findHint(board)!
    board = removePair(board, hint.aId, hint.bId)
    const next = reshuffleRemaining(board, mulberry32(99))
    expect(next.filter((t) => !t.gone)).toHaveLength(34)
    expect(hasLegalMove(next)).toBe(true)
  })

  it('revives tray tiles onto the board then shuffles', () => {
    let board = dealBoard(getLayout('garden').slots, mulberry32(11))
    const free = board.filter((t) => !t.gone).slice(0, 2)
    const tray: TrayTile[] = free.map((t) => ({ id: t.id, face: t.face }))
    board = board.map((t) =>
      tray.some((slot) => slot.id === t.id) ? { ...t, gone: true } : t,
    )
    expect(board.filter((t) => !t.gone)).toHaveLength(34)

    const { tiles, tray: nextTray } = reviveBoard(board, tray, mulberry32(5))
    expect(nextTray).toHaveLength(0)
    expect(tiles.filter((t) => !t.gone)).toHaveLength(36)
    expect(hasLegalMove(tiles)).toBe(true)
  })
})
