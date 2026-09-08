import {
  getPokemonByDexId,
  pokemonPortraitUrl,
  type CatalogPokemon,
} from '#/features/game-data'

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
  portraitId?: number | null
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

const KNOWN_TYPES = new Set<string>(ALL_TYPES)

function asPokeType(value: string): PokeType | null {
  const t = value.toLowerCase()
  return KNOWN_TYPES.has(t) ? (t as PokeType) : null
}

export function pokedexSpriteUrl(dexId: number, _shiny = false) {
  return pokemonPortraitUrl(dexId)
}

export function pokedexWalkUrl(dexId: number) {
  return pokemonPortraitUrl(dexId)
}

export function formatDexId(dexId: number) {
  return String(dexId).padStart(3, '0')
}

export function catalogToPokedexFields(entry: CatalogPokemon): Partial<PokedexEntry> {
  const types = entry.types
    .map(asPokeType)
    .filter((t): t is PokeType => t != null)

  const moves: PokedexMove[] = entry.moves.map((move, index) => ({
    id: `m${index + 1}`,
    name: move.name.replace(/\b\w/g, (c) => c.toUpperCase()),
    type: types[0] ?? 'normal',
  }))

  const evolution =
    entry.evolutions.length > 0
      ? [...new Set(entry.evolutions.map((e) => e.name))].join(' / ')
      : '—'

  return {
    name: entry.name,
    types,
    level: entry.levelMax ?? entry.levelMin ?? undefined,
    moves,
    evolution,
    portraitId: entry.portraitId,
    description: undefined,
  }
}

export function resolvePokedexEntry(
  dexId: number,
  discovered: boolean,
): PokedexEntry {
  const catalog = getPokemonByDexId(dexId)
  if (!catalog || !discovered) {
    return { dexId, discovered }
  }
  return {
    dexId,
    discovered: true,
    ...catalogToPokedexFields(catalog),
  }
}
