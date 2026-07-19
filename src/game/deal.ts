import { buildFullDeck, canMatch, type TileFace } from './tiles'
import { cloneTiles, freeTiles, type BoardTile, type Slot } from './rules'

export type Rng = () => number

export function mulberry32(seed: number): Rng {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleInPlace<T>(items: T[], rng: Rng): void {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
}

/** Group a face multiset into matchable pairs. */
export function pairFaces(faces: TileFace[], rng: Rng): [TileFace, TileFace][] {
  const remaining = [...faces]
  shuffleInPlace(remaining, rng)
  const pairs: [TileFace, TileFace][] = []

  while (remaining.length >= 2) {
    const a = remaining.pop()!
    const idx = remaining.findIndex((b) => canMatch(a, b))
    if (idx === -1) {
      throw new Error(`Unpairable face left in bag: ${a}`)
    }
    const b = remaining.splice(idx, 1)[0]!
    pairs.push([a, b])
  }

  if (remaining.length !== 0) {
    throw new Error('Odd face left unpaired')
  }
  return pairs
}

export function facesForSlotCount(count: number, rng: Rng): TileFace[] {
  if (count % 2 !== 0) throw new Error('count must be even')
  if (count === 144) return buildFullDeck()

  const pairsNeeded = count / 2
  const bag = buildFullDeck()
  const pairs = pairFaces(bag, rng)
  shuffleInPlace(pairs, rng)
  return pairs.slice(0, pairsNeeded).flat()
}

function findRemovalOrder(
  slots: Slot[],
  rng: Rng,
  maxAttempts = 80,
): [number, number][] {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const working: BoardTile[] = slots.map((s, id) => ({
      ...s,
      id,
      face: 'man-1',
      gone: false,
    }))
    const removalOrder: [number, number][] = []
    let stuck = false

    while (working.some((t) => !t.gone)) {
      const free = freeTiles(working)
      if (free.length < 2) {
        stuck = true
        break
      }
      const indices = free.map((_, i) => i)
      shuffleInPlace(indices, rng)
      const a = free[indices[0]!]!
      const rest = free.filter((t) => t.id !== a.id)
      const b = rest[Math.floor(rng() * rest.length)]!
      removalOrder.push([a.id, b.id])
      a.gone = true
      b.gone = true
    }

    if (!stuck) return removalOrder
  }

  // Deterministic backtracking fallback for awkward geometries
  const working: BoardTile[] = slots.map((s, id) => ({
    ...s,
    id,
    face: 'man-1',
    gone: false,
  }))

  function search(): [number, number][] | null {
    if (working.every((t) => t.gone)) return []
    const free = freeTiles(working)
    if (free.length < 2) return null
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        const a = free[i]!
        const b = free[j]!
        a.gone = true
        b.gone = true
        const rest = search()
        if (rest) return [[a.id, b.id], ...rest]
        a.gone = false
        b.gone = false
      }
    }
    return null
  }

  const order = search()
  if (!order) {
    throw new Error('Layout geometry cannot be fully cleared by free pairs')
  }
  return order
}

/**
 * Backwards deal: remove free geometric pairs from a blank board, then assign
 * matching face pairs in reverse so a winning path always exists.
 */
export function dealBoard(slots: Slot[], rng: Rng = Math.random): BoardTile[] {
  if (slots.length % 2 !== 0) {
    throw new Error(`Layout must have an even number of slots, got ${slots.length}`)
  }

  const removalOrder = findRemovalOrder(slots, rng)
  const faces = facesForSlotCount(slots.length, rng)
  const pairs = pairFaces(faces, rng)
  shuffleInPlace(pairs, rng)

  if (pairs.length !== removalOrder.length) {
    throw new Error('Pair count mismatch with removal order')
  }

  const assigned = new Map<number, TileFace>()
  for (let i = removalOrder.length - 1; i >= 0; i--) {
    const [aId, bId] = removalOrder[i]!
    const [fa, fb] = pairs.pop()!
    assigned.set(aId, fa)
    assigned.set(bId, fb)
  }

  return slots.map((s, id) => ({
    ...s,
    id,
    face: assigned.get(id)!,
    gone: false,
  }))
}

/** Verify a board can be cleared by searching free matching pairs. */
export function isSolvable(tiles: BoardTile[]): boolean {
  const state = cloneTiles(tiles)

  function search(): boolean {
    if (state.every((t) => t.gone)) return true
    const free = freeTiles(state)
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        const a = free[i]!
        const b = free[j]!
        if (!canMatch(a.face, b.face)) continue
        a.gone = true
        b.gone = true
        if (search()) return true
        a.gone = false
        b.gone = false
      }
    }
    return false
  }

  return search()
}

export function hasOpeningMove(tiles: BoardTile[]): boolean {
  const free = freeTiles(tiles)
  for (let i = 0; i < free.length; i++) {
    for (let j = i + 1; j < free.length; j++) {
      if (canMatch(free[i]!.face, free[j]!.face)) return true
    }
  }
  return false
}
