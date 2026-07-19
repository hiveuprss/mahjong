import { describe, expect, it } from 'vitest'
import { canMatch } from './tiles'
import {
  canSelectPair,
  isFree,
  removePair,
  type BoardTile,
} from './rules'

function tile(
  partial: Partial<BoardTile> & Pick<BoardTile, 'id' | 'x' | 'y' | 'z' | 'face'>,
): BoardTile {
  return { gone: false, ...partial }
}

describe('isFree', () => {
  it('allows a lone tile', () => {
    const tiles = [tile({ id: 0, x: 0, y: 0, z: 0, face: 'man-1' })]
    expect(isFree(tiles[0]!, tiles)).toBe(true)
  })

  it('blocks a covered tile', () => {
    const tiles = [
      tile({ id: 0, x: 0, y: 0, z: 0, face: 'man-1' }),
      tile({ id: 1, x: 0, y: 0, z: 1, face: 'man-2' }),
    ]
    expect(isFree(tiles[0]!, tiles)).toBe(false)
    expect(isFree(tiles[1]!, tiles)).toBe(true)
  })

  it('blocks when both left and right are occupied', () => {
    const tiles = [
      tile({ id: 0, x: 2, y: 0, z: 0, face: 'man-1' }),
      tile({ id: 1, x: 0, y: 0, z: 0, face: 'man-2' }),
      tile({ id: 2, x: 4, y: 0, z: 0, face: 'man-3' }),
    ]
    expect(isFree(tiles[0]!, tiles)).toBe(false)
    expect(isFree(tiles[1]!, tiles)).toBe(true)
    expect(isFree(tiles[2]!, tiles)).toBe(true)
  })

  it('allows when only one side is open', () => {
    const tiles = [
      tile({ id: 0, x: 2, y: 0, z: 0, face: 'man-1' }),
      tile({ id: 1, x: 0, y: 0, z: 0, face: 'man-2' }),
    ]
    expect(isFree(tiles[0]!, tiles)).toBe(true)
  })
})

describe('canMatch / canSelectPair', () => {
  it('matches identical faces', () => {
    expect(canMatch('pin-5', 'pin-5')).toBe(true)
    expect(canMatch('pin-5', 'pin-6')).toBe(false)
  })

  it('matches any seasons and any flowers, but not across groups', () => {
    expect(canMatch('season-spring', 'season-winter')).toBe(true)
    expect(canMatch('flower-plum', 'flower-bamboo')).toBe(true)
    expect(canMatch('season-spring', 'flower-plum')).toBe(false)
  })

  it('requires both tiles free to select a pair', () => {
    const tiles = [
      tile({ id: 0, x: 0, y: 0, z: 0, face: 'man-1' }),
      tile({ id: 1, x: 0, y: 0, z: 1, face: 'man-1' }),
      tile({ id: 2, x: 4, y: 0, z: 0, face: 'man-1' }),
    ]
    expect(canSelectPair(tiles[0]!, tiles[2]!, tiles)).toBe(false)
    expect(canSelectPair(tiles[1]!, tiles[2]!, tiles)).toBe(true)
  })

  it('removePair marks both gone', () => {
    const tiles = [
      tile({ id: 0, x: 0, y: 0, z: 0, face: 'man-1' }),
      tile({ id: 1, x: 4, y: 0, z: 0, face: 'man-1' }),
    ]
    const next = removePair(tiles, 0, 1)
    expect(next.every((t) => t.gone)).toBe(true)
  })
})
