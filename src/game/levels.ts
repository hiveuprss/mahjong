import { getLayout } from './layouts'
import type { Slot } from './rules'
import { rect } from './shapes'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface Level {
  id: string
  number: number
  name: string
  difficulty: Difficulty
  slots: Slot[]
}

function L(
  number: number,
  name: string,
  difficulty: Difficulty,
  slots: Slot[],
): Level {
  if (slots.length % 2 !== 0) {
    throw new Error(`Level ${number} (${name}) has odd slot count ${slots.length}`)
  }
  return {
    id: `level-${number}`,
    number,
    name,
    difficulty,
    slots,
  }
}

/** Merge slot lists; drop duplicate x/y/z; force even count. */
function merge(...parts: Slot[][]): Slot[] {
  const seen = new Set<string>()
  const out: Slot[] = []
  for (const part of parts) {
    for (const s of part) {
      const key = `${s.x},${s.y},${s.z}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push(s)
    }
  }
  if (out.length % 2 !== 0) out.pop()
  return out
}

/**
 * Stacked plateau on the half-tile grid.
 * Each higher layer shrinks by 1 col/row and shifts +2,+2.
 */
function plateau(
  baseCols: number,
  baseRows: number,
  layers: number,
  originX = 0,
  originY = 0,
): Slot[] {
  const parts: Slot[][] = []
  for (let z = 0; z < layers; z++) {
    const cols = Math.max(1, baseCols - z)
    const rows = Math.max(1, baseRows - z)
    parts.push(rect(cols, rows, z, originX + z * 2, originY + z * 2))
  }
  return merge(...parts)
}

function twin(
  cols: number,
  rows: number,
  layers: number,
  gap = 4,
): Slot[] {
  const left = plateau(cols, rows, layers, 0, 0)
  const maxX = Math.max(...left.map((s) => s.x))
  const right = plateau(cols, rows, layers, maxX + 2 + gap, 0)
  return merge(left, right)
}

const garden = () => getLayout('garden').slots
const cat = () => getLayout('cat').slots
const turtle = () => getLayout('turtle').slots

/**
 * 40 levels with a rising difficulty curve (tile count + stack depth).
 * Easy ~8→36, medium ~40→74, hard ~74→110, expert ~112→144.
 */
export const LEVELS: Level[] = [
  // —— Easy: learn the tray ——
  L(1, 'First Steps', 'easy', rect(4, 2)), // 8
  L(2, 'Tiny Stack', 'easy', merge(rect(4, 2), rect(2, 2, 1, 2, 0))), // 12
  L(3, 'Low Wall', 'easy', rect(8, 2)), // 16
  L(4, 'Little Bridge', 'easy', merge(
    rect(2, 3),
    rect(2, 3, 0, 10, 0),
    rect(4, 1, 1, 4, 2),
    rect(2, 1, 2, 6, 2),
    rect(2, 1, 0, 6, 0),
  )), // 20
  L(5, 'Stepped Path', 'easy', merge(rect(6, 3), rect(3, 2, 1, 3, 1))), // 24
  L(6, 'Courtyard', 'easy', merge(
    rect(6, 3),
    rect(4, 2, 1, 2, 1),
    rect(2, 1, 2, 4, 2),
  )), // 28
  L(7, 'Twin Huts', 'easy', twin(4, 3, 2, 4)), // 36
  L(8, 'Cross Plaza', 'easy', merge(
    rect(8, 2),
    rect(3, 5, 0, 6, 0),
    rect(4, 2, 1, 4, 2),
    rect(2, 1, 2, 6, 3),
  )), // 34
  L(9, 'Rising Isles', 'easy', merge(
    plateau(4, 2, 2, 0, 0),
    plateau(4, 2, 2, 12, 0),
    plateau(4, 2, 2, 6, 6),
    rect(4, 1, 0, 6, 4),
  )), // 34
  L(10, 'Meadow', 'easy', garden()), // 36

  // —— Medium ——
  L(11, 'Wide Meadow', 'medium', merge(rect(8, 4), rect(4, 2, 1, 4, 2))), // 40
  L(12, 'Pyramid Rise', 'medium', plateau(6, 4, 3)), // 46
  L(13, 'Long Stairs', 'medium', merge(
    rect(8, 2),
    rect(7, 2, 1, 1, 0),
    rect(6, 2, 2, 2, 0),
    rect(5, 2, 3, 3, 0),
  )), // 52
  L(14, 'Fort Gate', 'medium', merge(
    rect(8, 4),
    rect(6, 3, 1, 2, 1),
    rect(4, 1, 2, 4, 2),
  )), // 54
  L(15, 'Crystal Rise', 'medium', merge(
    plateau(6, 4, 3),
    rect(6, 2, 0, 14, 2),
  )), // 58
  L(16, 'Harbor', 'medium', merge(
    rect(8, 4),
    rect(6, 3, 1, 2, 1),
    rect(6, 2, 0, 2, 10),
    rect(4, 1, 2, 4, 2),
  )), // 66
  L(17, 'Twin Keeps', 'medium', twin(5, 4, 2, 4)), // 64
  L(18, 'Grand Cross', 'medium', merge(
    rect(10, 2),
    rect(3, 7, 0, 8, 0),
    rect(6, 3, 1, 5, 2),
    rect(4, 2, 2, 7, 3),
    rect(6, 2, 0, 2, 16),
  )), // 72
  L(19, 'Triple Isles', 'medium', merge(
    plateau(5, 3, 3, 0, 0),
    plateau(5, 3, 3, 14, 0),
    plateau(4, 3, 2, 7, 10),
    rect(4, 1, 0, 8, 8),
  )), // 74
  L(20, 'High Pyramid', 'medium', plateau(7, 5, 3)), // 74

  // —— Hard ——
  L(21, 'Bastion Steps', 'hard', merge(
    rect(9, 3),
    rect(8, 2, 1, 1, 1),
    rect(7, 2, 2, 2, 1),
    rect(6, 2, 3, 3, 1),
    rect(5, 1, 4, 4, 2),
  )), // 74
  L(22, 'Sky Stairs', 'hard', merge(
    rect(9, 2),
    rect(8, 2, 1, 1, 0),
    rect(7, 2, 2, 2, 0),
    rect(6, 2, 3, 3, 0),
    rect(5, 2, 4, 4, 0),
    rect(6, 2, 0, 2, 6),
  )), // 82
  L(23, 'Cat Nap', 'hard', merge(cat(), rect(4, 2, 0, 16, 4))), // 80
  L(24, 'Crown Ring', 'hard', merge(
    rect(9, 4),
    rect(7, 3, 1, 2, 1),
    rect(5, 2, 2, 4, 2),
    rect(7, 2, 0, 2, 10),
    rect(3, 1, 3, 6, 3),
  )), // 84
  L(25, 'Twin Citadels', 'hard', twin(6, 4, 3, 4)), // 92
  L(26, 'Star Cross', 'hard', merge(
    rect(12, 2),
    rect(3, 8, 0, 10, 0),
    rect(7, 3, 1, 6, 3),
    rect(5, 2, 2, 8, 4),
    rect(3, 2, 3, 10, 4),
    rect(6, 2, 0, 4, 18),
  )), // 90
  L(27, 'Deep Crystal', 'hard', merge(plateau(7, 5, 4), rect(8, 2, 0, 0, 12))), // 98
  L(28, 'Archipelago', 'hard', merge(
    plateau(5, 3, 3, 0, 0),
    plateau(5, 3, 3, 14, 0),
    plateau(5, 3, 3, 7, 10),
    rect(8, 2, 0, 4, 18),
  )), // 94
  L(29, 'Great Wall', 'hard', merge(
    rect(12, 3),
    rect(10, 2, 1, 2, 1),
    rect(8, 2, 2, 4, 1),
    rect(6, 2, 3, 6, 1),
    rect(8, 2, 0, 4, 8),
    rect(4, 1, 4, 8, 2),
  )), // 104
  L(30, 'Cat Kingdom', 'hard', merge(
    cat(),
    plateau(5, 3, 3, 16, 2),
    rect(6, 2, 0, 16, 12),
  )), // 110

  // —— Expert ——
  L(31, 'Summit', 'expert', merge(plateau(8, 5, 4), rect(8, 2, 0, 2, 12))), // 112
  L(32, 'Palace', 'expert', merge(
    rect(10, 5),
    rect(8, 4, 1, 2, 1),
    rect(6, 3, 2, 4, 2),
    rect(4, 2, 3, 6, 3),
    rect(6, 2, 0, 2, 12),
  )), // 120
  L(33, 'Spiral Steps', 'expert', merge(
    rect(11, 2),
    rect(10, 2, 1, 1, 0),
    rect(9, 2, 2, 2, 0),
    rect(8, 2, 3, 3, 0),
    rect(7, 2, 4, 4, 0),
    rect(6, 2, 5, 5, 0),
    rect(8, 2, 0, 2, 6),
  )), // 118
  L(34, 'Eclipse', 'expert', merge(
    rect(11, 5),
    rect(9, 4, 1, 2, 1),
    rect(7, 3, 2, 4, 2),
    rect(5, 2, 3, 6, 3),
  )), // 122
  L(35, 'Twin Empires', 'expert', twin(6, 5, 3, 6)), // 124
  L(36, 'Labyrinth', 'expert', merge(
    rect(12, 2),
    rect(3, 8, 0, 10, 0),
    rect(8, 4, 1, 4, 2),
    rect(6, 3, 2, 6, 3),
    rect(4, 2, 3, 8, 4),
    plateau(4, 3, 2, 0, 14),
    rect(6, 2, 0, 14, 14),
  )), // 128
  L(37, 'Nebula', 'expert', merge(
    plateau(8, 5, 4),
    plateau(5, 4, 3, 20, 2),
  )), // 134
  L(38, 'Citadel Isles', 'expert', merge(
    plateau(6, 4, 3, 0, 0),
    plateau(6, 4, 3, 16, 0),
    plateau(5, 3, 3, 8, 12),
    rect(8, 2, 0, 6, 20),
  )), // 134
  L(39, 'Emperor Wall', 'expert', merge(
    rect(14, 3),
    rect(12, 2, 1, 2, 1),
    rect(10, 2, 2, 4, 1),
    rect(8, 2, 3, 6, 1),
    rect(10, 2, 0, 4, 8),
    rect(6, 1, 4, 6, 2),
    rect(4, 2, 0, 6, 12),
  )), // 136
  L(40, 'Turtle Legacy', 'expert', turtle()), // 144
]

export function getLevel(id: string): Level {
  const level = LEVELS.find((l) => l.id === id)
  if (!level) throw new Error(`Unknown level: ${id}`)
  return level
}

export function getLevelByNumber(n: number): Level | undefined {
  return LEVELS.find((l) => l.number === n)
}

export function nextLevel(id: string): Level | undefined {
  const current = getLevel(id)
  return getLevelByNumber(current.number + 1)
}

export const FIRST_LEVEL_ID = LEVELS[0]!.id
export const LEVEL_COUNT = LEVELS.length
