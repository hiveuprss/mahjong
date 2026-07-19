import { describe, expect, it } from 'vitest'
import { dealBoard, mulberry32 } from './deal'
import { DEFAULT_LAYOUT_ID, LAYOUTS, getLayout } from './layouts'

describe('layouts', () => {
  it('defaults to Garden', () => {
    expect(DEFAULT_LAYOUT_ID).toBe('garden')
    expect(getLayout(DEFAULT_LAYOUT_ID).name).toBe('Garden')
  })

  it('has even slot counts and Turtle is 144', () => {
    for (const layout of LAYOUTS) {
      expect(layout.slots.length % 2).toBe(0)
    }
    expect(getLayout('turtle').slots).toHaveLength(144)
    expect(getLayout('garden').slots).toHaveLength(36)
    expect(getLayout('cat').slots).toHaveLength(72)
  })

  it('can deal into every layout', () => {
    for (const layout of LAYOUTS) {
      const board = dealBoard(layout.slots, mulberry32(11))
      expect(board).toHaveLength(layout.slots.length)
      expect(board.every((t) => t.face)).toBe(true)
    }
  })
})
