/** Tile face identifiers for a standard 144-tile solitaire set. */

export type SuitFace =
  | `man-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
  | `pin-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
  | `sou-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`

export type HonorFace =
  | 'dragon-white'
  | 'dragon-green'
  | 'dragon-red'
  | 'wind-east'
  | 'wind-south'
  | 'wind-west'
  | 'wind-north'

export type SeasonFace = 'season-spring' | 'season-summer' | 'season-autumn' | 'season-winter'
export type FlowerFace = 'flower-plum' | 'flower-orchid' | 'flower-chrysanthemum' | 'flower-bamboo'

export type TileFace = SuitFace | HonorFace | SeasonFace | FlowerFace

export type MatchGroup = 'exact' | 'season' | 'flower'

const SUITS = ['man', 'pin', 'sou'] as const
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

const HONORS: HonorFace[] = [
  'dragon-white',
  'dragon-green',
  'dragon-red',
  'wind-east',
  'wind-south',
  'wind-west',
  'wind-north',
]

export const SEASONS: SeasonFace[] = [
  'season-spring',
  'season-summer',
  'season-autumn',
  'season-winter',
]

export const FLOWERS: FlowerFace[] = [
  'flower-plum',
  'flower-orchid',
  'flower-chrysanthemum',
  'flower-bamboo',
]

/** Asset filenames from samoheen/mahjong-tiles (Hong Kong set). */
export const FACE_ASSET: Record<TileFace, string> = {
  'dragon-white': '01-white-dragon.svg',
  'dragon-green': '02-green-dragon.svg',
  'dragon-red': '03-red-dragon.svg',
  'wind-east': '04-east-wind.svg',
  'wind-south': '05-south-wind.svg',
  'wind-west': '06-west-wind.svg',
  'wind-north': '07-north-wind.svg',
  'man-1': '08-characters-1.svg',
  'man-2': '09-characters-2.svg',
  'man-3': '10-characters-3.svg',
  'man-4': '11-characters-4.svg',
  'man-5': '12-characters-5.svg',
  'man-6': '13-characters-6.svg',
  'man-7': '14-characters-7.svg',
  'man-8': '15-characters-8.svg',
  'man-9': '16-characters-9.svg',
  'pin-1': '17-circles-1.svg',
  'pin-2': '18-circles-2.svg',
  'pin-3': '19-circles-3.svg',
  'pin-4': '20-circles-4.svg',
  'pin-5': '21-circles-5.svg',
  'pin-6': '22-circles-6.svg',
  'pin-7': '23-circles-7.svg',
  'pin-8': '24-circles-8.svg',
  'pin-9': '25-circles-9.svg',
  'sou-1': '26-bamboos-1.svg',
  'sou-2': '27-bamboos-2.svg',
  'sou-3': '28-bamboos-3.svg',
  'sou-4': '29-bamboos-4.svg',
  'sou-5': '30-bamboos-5.svg',
  'sou-6': '31-bamboos-6.svg',
  'sou-7': '32-bamboos-7.svg',
  'sou-8': '33-bamboos-8.svg',
  'sou-9': '34-bamboos-9.svg',
  'season-spring': '35-spring.svg',
  'season-summer': '36-summer.svg',
  'season-autumn': '37-autumn.svg',
  'season-winter': '38-winter.svg',
  'flower-plum': '39-plum.svg',
  'flower-orchid': '40-orchid.svg',
  'flower-chrysanthemum': '41-chrysanthemum.svg',
  'flower-bamboo': '42-bamboo.svg',
}

export function matchGroup(face: TileFace): MatchGroup {
  if (SEASONS.includes(face as SeasonFace)) return 'season'
  if (FLOWERS.includes(face as FlowerFace)) return 'flower'
  return 'exact'
}

export function canMatch(a: TileFace, b: TileFace): boolean {
  const ga = matchGroup(a)
  const gb = matchGroup(b)
  if (ga === 'season' && gb === 'season') return true
  if (ga === 'flower' && gb === 'flower') return true
  return a === b
}

/** Full 144-tile multiset: 4× each of 34 suits/honors + 1× each season/flower. */
export function buildFullDeck(): TileFace[] {
  const deck: TileFace[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const face = `${suit}-${rank}` as SuitFace
      for (let i = 0; i < 4; i++) deck.push(face)
    }
  }
  for (const honor of HONORS) {
    for (let i = 0; i < 4; i++) deck.push(honor)
  }
  deck.push(...SEASONS, ...FLOWERS)
  return deck
}

export function tileAssetUrl(face: TileFace): string {
  // Respect Vite base (e.g. /mahjong/ on GitHub Pages)
  return `${import.meta.env.BASE_URL}tiles/${FACE_ASSET[face]}`
}
