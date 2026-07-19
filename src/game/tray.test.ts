import { describe, expect, it } from 'vitest'
import type { BoardTile } from './rules'
import {
  findTrayMatch,
  isTrayLost,
  isTrayWon,
  resolveTray,
  sendToTray,
  TRAY_CAPACITY,
  type TrayTile,
} from './tray'

function tile(
  partial: Pick<BoardTile, 'id' | 'face'> & Partial<BoardTile>,
): BoardTile {
  return {
    x: 0,
    y: 0,
    z: 0,
    gone: false,
    ...partial,
  }
}

describe('tray', () => {
  it('matches out of order in the tray', () => {
    const tray: TrayTile[] = [
      { id: 1, face: 'man-1' },
      { id: 2, face: 'pin-3' },
      { id: 3, face: 'man-1' },
    ]
    const pair = findTrayMatch(tray)
    expect(pair).toEqual({ a: 1, b: 3 })
    const resolved = resolveTray(tray)
    expect(resolved.shattered).toEqual([1, 3])
    expect(resolved.tray).toEqual([{ id: 2, face: 'pin-3' }])
  })

  it('cascades multiple pairs', () => {
    const tray: TrayTile[] = [
      { id: 1, face: 'sou-2' },
      { id: 2, face: 'pin-1' },
      { id: 3, face: 'sou-2' },
      { id: 4, face: 'pin-1' },
    ]
    const resolved = resolveTray(tray)
    expect(resolved.tray).toEqual([])
    expect(resolved.shattered).toHaveLength(4)
  })

  it('matches seasons as a group', () => {
    const tray: TrayTile[] = [
      { id: 1, face: 'season-spring' },
      { id: 2, face: 'man-1' },
      { id: 3, face: 'season-winter' },
    ]
    expect(resolveTray(tray).tray).toEqual([{ id: 2, face: 'man-1' }])
  })

  it('loses when tray reaches capacity with no matches', () => {
    const tray: TrayTile[] = [
      { id: 1, face: 'man-1' },
      { id: 2, face: 'man-2' },
      { id: 3, face: 'man-3' },
      { id: 4, face: 'man-4' },
    ]
    expect(tray).toHaveLength(TRAY_CAPACITY)
    expect(isTrayLost(resolveTray(tray).tray)).toBe(true)
  })

  it('does not lose when the 4th tile completes a match', () => {
    const tiles = [
      tile({ id: 10, face: 'man-9', x: 0, y: 0, z: 0 }),
      tile({ id: 11, face: 'pin-1', x: 4, y: 0, z: 0 }),
    ]
    const tray: TrayTile[] = [
      { id: 1, face: 'man-9' },
      { id: 2, face: 'sou-1' },
      { id: 3, face: 'pin-2' },
    ]
    const result = sendToTray(tiles, tray, 10)!
    expect(result.lost).toBe(false)
    expect(result.tray).toEqual([
      { id: 2, face: 'sou-1' },
      { id: 3, face: 'pin-2' },
    ])
    expect(result.shattered).toEqual([1, 10])
  })

  it('wins when board and tray are empty', () => {
    const tiles = [tile({ id: 1, face: 'man-1', gone: true })]
    expect(isTrayWon(tiles, [])).toBe(true)
    expect(isTrayWon(tiles, [{ id: 2, face: 'man-2' }])).toBe(false)
  })
})
