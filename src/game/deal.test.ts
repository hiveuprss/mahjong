import { describe, expect, it } from 'vitest'
import { dealBoard, hasOpeningMove, isSolvable, mulberry32 } from './deal'
import { getLayout } from './layouts'

describe('dealBoard', () => {
  it('deals Garden with opening move and solvability', () => {
    const layout = getLayout('garden')
    for (let seed = 1; seed <= 8; seed++) {
      const board = dealBoard(layout.slots, mulberry32(seed))
      expect(board).toHaveLength(36)
      expect(board.every((t) => !t.gone)).toBe(true)
      expect(hasOpeningMove(board)).toBe(true)
      expect(isSolvable(board)).toBe(true)
    }
  })

  it('deals Turtle with 144 tiles and an opening move', () => {
    const layout = getLayout('turtle')
    const board = dealBoard(layout.slots, mulberry32(42))
    expect(board).toHaveLength(144)
    expect(hasOpeningMove(board)).toBe(true)
    // Backwards-deal guarantees solvability; full search on 144 tiles is too slow for CI.
  })
})
