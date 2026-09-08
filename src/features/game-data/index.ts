import pokemonJson from './generated/pokemon.json' with { type: 'json' }
import movesJson from './generated/moves.json' with { type: 'json' }
import npcsJson from './generated/npcs.json' with { type: 'json' }
import metaJson from './generated/meta.json' with { type: 'json' }

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

export function pokemonPortraitUrl(dexId: number): string {
  return portraitUrl(getPokemonByDexId(dexId)?.portraitId)
}

export type { CatalogEvolution, CatalogMoveRef, CatalogNpc, CatalogPokemon, CatalogSpell } from './types'
export { EMPTY_SPRITE_URL, portraitUrl } from './urls'
