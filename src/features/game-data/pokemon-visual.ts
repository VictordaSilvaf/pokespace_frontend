/**
 * Pokemon visual identity is always `dexId`.
 * Never assume dexId === spriteId / lookType / itemId.
 */

export type AssetCategory = 'item' | 'creature' | 'effect' | 'missile' | 'pokemon'

export type AssetReference = {
  category: AssetCategory
  id: number
}

export type PokemonVisual = {
  dexId: number
  portrait: AssetReference | null
  walk: AssetReference | null
  shinyWalk: AssetReference | null
  effects: AssetReference[]
  missiles: AssetReference[]
}

import catalogPokemon from './generated/pokemon.json' with { type: 'json' }

/** Build visual map from server catalog: walk=lookType, portrait=portraitId|lookType. */
export function buildPokemonVisual(dexId: number): PokemonVisual {
  const entry = catalogPokemon.find((p) => p.dexId === dexId)
  const lookType = entry?.lookType ?? null
  const portraitId =
    entry?.portraitId != null && entry.portraitId > 0
      ? entry.portraitId
      : lookType
  const walk: AssetReference | null =
    lookType != null ? { category: 'creature', id: lookType } : null
  const portrait: AssetReference | null =
    portraitId != null
      ? {
          category: entry?.portraitId != null && entry.portraitId > 0 ? 'item' : 'creature',
          id: portraitId,
        }
      : null
  return {
    dexId,
    portrait,
    walk,
    shinyWalk: null,
    effects: [],
    missiles: [],
  }
}

export function listCuratedPokemonVisuals(): PokemonVisual[] {
  return catalogPokemon
    .filter((p) => p.dexId != null)
    .map((p) => buildPokemonVisual(p.dexId as number))
    .sort((a, b) => a.dexId - b.dexId)
}

export function getPokemonVisual(dexId: number): PokemonVisual | null {
  if (!catalogPokemon.some((p) => p.dexId === dexId)) return null
  return buildPokemonVisual(dexId)
}
