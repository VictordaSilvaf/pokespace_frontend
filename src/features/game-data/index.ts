import pokemonJson from './generated/pokemon.json' with { type: 'json' }
import movesJson from './generated/moves.json' with { type: 'json' }
import npcsJson from './generated/npcs.json' with { type: 'json' }
import metaJson from './generated/meta.json' with { type: 'json' }

import {
  creatureIdForDex,
  creatureUrl,
} from './creature-map'
import type { CatalogNpc, CatalogPokemon, CatalogSpell } from './types'
import { portraitUrl } from './urls'

export const catalogPokemon = pokemonJson as CatalogPokemon[]
export const catalogMoves = movesJson as CatalogSpell[]
export const catalogNpcs = npcsJson as CatalogNpc[]
export const catalogMeta = metaJson as {
  generatedAt: string
  source: string
  counts: Record<string, number>
}

const byDexId = new Map(catalogPokemon.map((p) => [p.dexId, p]))
const byName = new Map(
  catalogPokemon.map((p) => [p.name.toLowerCase(), p]),
)

export function getPokemonByDexId(dexId: number): CatalogPokemon | undefined {
  return byDexId.get(dexId)
}

export function getPokemonByName(name: string): CatalogPokemon | undefined {
  return byName.get(name.toLowerCase())
}

/** Prefer curated creature sheet; fall back to item portrait id from catalog. */
export function pokemonPortraitUrl(dexId: number): string {
  const creatureId = creatureIdForDex(dexId)
  if (creatureId != null) return creatureUrl(creatureId)
  return portraitUrl(getPokemonByDexId(dexId)?.portraitId)
}

export type {
  CatalogEvolution,
  CatalogMoveRef,
  CatalogNpc,
  CatalogPokemon,
  CatalogSpell,
} from './types'
export {
  EMPTY_SPRITE_URL,
  portraitUrl,
  SPRITES_CREATURE_BASE,
} from './urls'
export {
  CREATURE_GEOMETRY,
  DEX_CREATURE_ID,
  PLAYER_CREATURE_ID,
  WORLD_NPC_DEFS,
  creatureIdForDex,
  creatureUrl,
} from './creature-map'
export type { SheetGeometry } from './creature-map'
export {
  buildPokemonVisual,
  getPokemonVisual,
  listCuratedPokemonVisuals,
} from './pokemon-visual'
export type { AssetCategory, AssetReference, PokemonVisual } from './pokemon-visual'
export { CreaturePortrait } from './CreaturePortrait'
export { drawCreatureFrame, facingFromVector, frameRect } from './sheet'
export type { FacingDir, FrameRect } from './sheet'
