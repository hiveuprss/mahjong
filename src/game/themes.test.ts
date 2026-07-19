import { describe, expect, it } from 'vitest'
import { themeVisual, THEMES } from './themes'

describe('themes', () => {
  it('lists four themes including classic', () => {
    expect(THEMES.map((t) => t.id)).toEqual([
      'classic',
      'orchard',
      'fauna',
      'cosmos',
    ])
  })

  it('classic uses image assets; others use motifs', () => {
    const classic = themeVisual('classic', 'man-1')
    expect(classic.kind).toBe('image')
    expect(classic.src).toContain('.svg')

    const orchard = themeVisual('orchard', 'man-1')
    expect(orchard.kind).toBe('motif')
    expect(orchard.motif).toBeTruthy()

    // Stable mapping — same face always same motif
    expect(themeVisual('fauna', 'dragon-red').motif).toBe(
      themeVisual('fauna', 'dragon-red').motif,
    )
  })
})
