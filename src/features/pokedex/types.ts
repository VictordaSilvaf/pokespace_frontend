export type PokeType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy'

export type PokedexMove = {
  id: string
  name: string
  type: PokeType
}

export type PokedexEntry = {
  dexId: number
  discovered: boolean
  name?: string
  types?: PokeType[]
  category?: string
  heightM?: number
  weightKg?: number
  level?: number
  abilities?: string[]
  moves?: PokedexMove[]
  evolution?: string
  description?: string
}

export const POKEDEX_TOTAL = 386

export const ALL_TYPES: PokeType[] = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
]

export const TYPE_COLORS: Record<PokeType, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
}

const SPRITE_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'

export function pokedexSpriteUrl(dexId: number, shiny = false) {
  return shiny
    ? `${SPRITE_BASE}/shiny/${dexId}.png`
    : `${SPRITE_BASE}/${dexId}.png`
}

export function pokedexWalkUrl(dexId: number) {
  return `${SPRITE_BASE}/other/showdown/${dexId}.gif`
}

export function formatDexId(dexId: number) {
  return String(dexId).padStart(3, '0')
}
