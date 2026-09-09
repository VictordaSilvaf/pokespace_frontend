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

import { DEX_CREATURE_ID } from './creature-map'

/** Curated visual map: dexId → creature sheet id (padventures) for walk/portrait. */
export function buildPokemonVisual(dexId: number): PokemonVisual {
  const creatureId = DEX_CREATURE_ID[dexId] ?? null
  const walk: AssetReference | null =
    creatureId != null ? { category: 'creature', id: creatureId } : null
  return {
    dexId,
    portrait: walk,
    walk,
    shinyWalk: null,
    effects: [],
    missiles: [],
  }
}

export function listCuratedPokemonVisuals(): PokemonVisual[] {
  return Object.keys(DEX_CREATURE_ID)
    .map(Number)
    .sort((a, b) => a - b)
    .map(buildPokemonVisual)
}

export function getPokemonVisual(dexId: number): PokemonVisual | null {
  if (!(dexId in DEX_CREATURE_ID)) return null
  return buildPokemonVisual(dexId)
}
