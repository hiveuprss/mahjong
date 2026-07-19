import { type TileFace, tileAssetUrl } from './tiles'

export interface Theme {
  id: string
  name: string
  description: string
}

export const THEMES: Theme[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional mahjong faces',
  },
  {
    id: 'orchard',
    name: 'Orchard',
    description: 'Fruits and blossoms',
  },
  {
    id: 'fauna',
    name: 'Fauna',
    description: 'Friendly animals',
  },
  {
    id: 'cosmos',
    name: 'Cosmos',
    description: 'Stars and shapes',
  },
]

export const DEFAULT_THEME_ID = 'classic'

/** Stable index for a face — same face always maps to the same motif. */
const FACE_ORDER: TileFace[] = [
  'man-1', 'man-2', 'man-3', 'man-4', 'man-5', 'man-6', 'man-7', 'man-8', 'man-9',
  'pin-1', 'pin-2', 'pin-3', 'pin-4', 'pin-5', 'pin-6', 'pin-7', 'pin-8', 'pin-9',
  'sou-1', 'sou-2', 'sou-3', 'sou-4', 'sou-5', 'sou-6', 'sou-7', 'sou-8', 'sou-9',
  'dragon-white', 'dragon-green', 'dragon-red',
  'wind-east', 'wind-south', 'wind-west', 'wind-north',
  'season-spring', 'season-summer', 'season-autumn', 'season-winter',
  'flower-plum', 'flower-orchid', 'flower-chrysanthemum', 'flower-bamboo',
]

const ORCHARD = [
  '🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🍑', '🥝', '🍉',
  '🫐', '🍐', '🥭', '🍍', '🥥', '🍈', '🍌', '🍏', '🌮',
  '🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌿', '🍀', '🪴',
  '🌕', '🌲', '🍁',
  '☀️', '🌙', '⭐', '💫',
  '🌱', '🌾', '🍂', '❄️',
  '💮', '🏵️', '💐', '🎋',
]

const FAUNA = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨',
  '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦',
  '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄',
  '🐝', '🦋', '🐞',
  '🐢', '🐍', '🦎', '🐙',
  '🐬', '🐳', '🦭', '🦈',
  '🦩', '🦚', '🦜', '🦢',
]

const COSMOS = [
  '★', '◆', '●', '▲', '✦', '✧', '✧', '◉', '◌',
  '◇', '○', '△', '▽', '▣', '▤', '▥', '▦', '▧',
  '▨', '▩', '◈', '◊', '✧', '✧', '✧', '✦', '✧',
  '☀', '☁', '☾',
  '♃', '♄', '♅', '♆',
  '♈', '♉', '♊', '♋',
  '♌', '♍', '♎', '♏',
]

const ORCHARD_COLORS = [
  '#ffe8e0', '#fff3d6', '#e8ffe8', '#e8f4ff', '#f5e8ff', '#ffe8f4',
]

const FAUNA_COLORS = [
  '#e8f8ff', '#fff8e8', '#f0ffe8', '#ffe8f0', '#f4f0ff', '#e8fff6',
]

const COSMOS_COLORS = [
  '#1a2744', '#243356', '#1e3a4c', '#2a2450', '#1c3048', '#252040',
]

function faceIndex(face: TileFace): number {
  const i = FACE_ORDER.indexOf(face)
  return i >= 0 ? i : 0
}

export interface ThemeVisual {
  kind: 'image' | 'motif'
  src?: string
  motif?: string
  background?: string
  color?: string
}

export function themeVisual(themeId: string, face: TileFace): ThemeVisual {
  if (themeId === 'classic' || !THEMES.some((t) => t.id === themeId)) {
    return { kind: 'image', src: tileAssetUrl(face) }
  }

  const i = faceIndex(face)
  if (themeId === 'orchard') {
    return {
      kind: 'motif',
      motif: ORCHARD[i % ORCHARD.length],
      background: ORCHARD_COLORS[i % ORCHARD_COLORS.length],
      color: '#1a120a',
    }
  }
  if (themeId === 'fauna') {
    return {
      kind: 'motif',
      motif: FAUNA[i % FAUNA.length],
      background: FAUNA_COLORS[i % FAUNA_COLORS.length],
      color: '#1a120a',
    }
  }
  // cosmos
  return {
    kind: 'motif',
    motif: COSMOS[i % COSMOS.length],
    background: COSMOS_COLORS[i % COSMOS_COLORS.length],
    color: '#f2d07a',
  }
}
