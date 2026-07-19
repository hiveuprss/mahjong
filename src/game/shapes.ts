import type { Slot } from './rules'

/** Half-tile grid helpers for level boards. */

export function layer(positions: number[][], z: number): Slot[] {
  return positions.map(([x, y]) => ({ x: x!, y: y!, z }))
}

/** Axis-aligned rectangle of tiles on one layer (even count). */
export function rect(
  cols: number,
  rows: number,
  z = 0,
  originX = 0,
  originY = 0,
): Slot[] {
  const slots: Slot[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slots.push({ x: originX + c * 2, y: originY + r * 2, z })
    }
  }
  return slots
}

/** Centered stack of shrinking rectangles. */
export function pyramid(
  baseCols: number,
  baseRows: number,
  layers: number,
  originX = 2,
  originY = 0,
): Slot[] {
  const slots: Slot[] = []
  for (let z = 0; z < layers; z++) {
    const cols = Math.max(1, baseCols - z * 2)
    const rows = Math.max(1, baseRows - z * 2)
    const ox = originX + z * 2
    const oy = originY + z * 2
    slots.push(...rect(cols, rows, z, ox, oy))
  }
  // Ensure even count (drop last if odd — shouldn't happen with even bases)
  if (slots.length % 2 !== 0) slots.pop()
  return slots
}

/** Two side-by-side towers. */
export function twinTowers(
  cols: number,
  rows: number,
  height: number,
  gap = 4,
): Slot[] {
  const left = pyramid(cols, rows, height, 0, 0)
  const rightOx =
    Math.max(...left.map((s) => s.x)) + 2 + gap
  const right = pyramid(cols, rows, height, rightOx, 0)
  const slots = [...left, ...right]
  if (slots.length % 2 !== 0) slots.pop()
  return slots
}

/** Cross / plus shape on z0 with a small stack on the hub. */
export function cross(arm = 3): Slot[] {
  const slots: Slot[] = []
  const mid = arm
  for (let i = 0; i < arm * 2 + 1; i++) {
    slots.push({ x: i * 2, y: mid * 2, z: 0 })
    if (i !== mid) slots.push({ x: mid * 2, y: i * 2, z: 0 })
  }
  // Hub stack
  slots.push(
    { x: mid * 2, y: mid * 2, z: 1 },
    { x: mid * 2, y: mid * 2, z: 2 },
  )
  if (slots.length % 2 !== 0) slots.pop()
  return slots
}

/** Stepped stairs rising left → right. */
export function stairs(steps: number, depth = 2): Slot[] {
  const slots: Slot[] = []
  for (let s = 0; s < steps; s++) {
    for (let d = 0; d < depth; d++) {
      for (let z = 0; z <= s; z++) {
        slots.push({ x: s * 2, y: d * 2, z })
      }
    }
  }
  if (slots.length % 2 !== 0) slots.pop()
  return slots
}

/** Hollow ring (rectangle border) + optional center stack. */
export function ring(cols: number, rows: number, withHub = true): Slot[] {
  const slots: Slot[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const edge = r === 0 || r === rows - 1 || c === 0 || c === cols - 1
      if (edge) slots.push({ x: c * 2, y: r * 2, z: 0 })
    }
  }
  if (withHub) {
    const cx = Math.floor((cols - 1) / 2) * 2
    const cy = Math.floor((rows - 1) / 2) * 2
    slots.push(
      { x: cx, y: cy, z: 1 },
      { x: cx, y: cy, z: 2 },
    )
  }
  if (slots.length % 2 !== 0) slots.pop()
  return slots
}

/** Diamond / lozenge footprint. */
export function diamond(radius: number): Slot[] {
  const slots: Slot[] = []
  for (let y = -radius; y <= radius; y++) {
    const span = radius - Math.abs(y)
    for (let x = -span; x <= span; x++) {
      slots.push({ x: (x + radius) * 2, y: (y + radius) * 2, z: 0 })
    }
  }
  // Peak
  slots.push(
    { x: radius * 2, y: radius * 2, z: 1 },
    { x: radius * 2, y: radius * 2, z: 2 },
  )
  if (slots.length % 2 !== 0) slots.pop()
  return slots
}

/** Bridge: two piers + elevated span. */
export function bridge(): Slot[] {
  const slots: Slot[] = [
    ...rect(2, 3, 0, 0, 0),
    ...rect(2, 3, 0, 12, 0),
    ...rect(4, 1, 1, 4, 2),
    ...rect(2, 1, 2, 6, 2),
  ]
  if (slots.length % 2 !== 0) slots.pop()
  return slots
}

/** Scattered islands — three small pyramids. */
export function islands(): Slot[] {
  return [
    ...pyramid(3, 2, 2, 0, 0),
    ...pyramid(3, 2, 2, 10, 0),
    ...pyramid(2, 2, 2, 5, 6),
  ]
}
