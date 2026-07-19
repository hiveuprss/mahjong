import { describe, expect, it } from 'vitest'
import {
  FIRST_LEVEL_ID,
  getLevel,
  LEVEL_COUNT,
  LEVELS,
  nextLevel,
} from './levels'

describe('levels', () => {
  it('has forty sequential levels with even unique slots', () => {
    expect(LEVEL_COUNT).toBe(40)
    expect(FIRST_LEVEL_ID).toBe('level-1')

    const nums = LEVELS.map((l) => l.number)
    expect(nums).toEqual(Array.from({ length: 40 }, (_, i) => i + 1))

    for (const level of LEVELS) {
      expect(level.slots.length % 2).toBe(0)
      expect(level.slots.length).toBeGreaterThan(0)
      const keys = new Set(level.slots.map((s) => `${s.x},${s.y},${s.z}`))
      expect(keys.size).toBe(level.slots.length)
    }
  })

  it('resolves next level until the finale', () => {
    expect(nextLevel('level-1')?.id).toBe('level-2')
    expect(nextLevel('level-40')).toBeUndefined()
    expect(getLevel('level-23').name).toBe('Cat Nap')
  })

  it('keeps tile counts rising within each difficulty band', () => {
    const bands: Array<[number, number]> = [
      [1, 10],
      [11, 20],
      [21, 30],
      [31, 40],
    ]
    for (const [start, end] of bands) {
      const slice = LEVELS.filter((l) => l.number >= start && l.number <= end)
      for (let i = 1; i < slice.length; i++) {
        const prev = slice[i - 1]!
        const cur = slice[i]!
        // Allow tiny dips, but never a large regression like Cat→tiny twin towers
        expect(
          cur.slots.length,
          `${cur.number} (${cur.slots.length}) vs ${prev.number} (${prev.slots.length})`,
        ).toBeGreaterThanOrEqual(prev.slots.length * 0.85)
      }
      expect(slice[0]!.slots.length).toBeLessThanOrEqual(slice.at(-1)!.slots.length)
    }
  })
})
