import { resolvePokedexEntry, MOCK_POKEDEX_TOTAL  } from './types'
import type {PokedexEntry} from './types';

/** Dex ids marked discovered in the preview Pokédex (gen 1–3). */
const DISCOVERED_DEX_IDS = new Set([
  1, 2, 3, 4, 6, 7, 9, 25, 39, 52, 94, 107, 114, 130, 143, 150, 254, 260,
])

function buildCatalog(): PokedexEntry[] {
  const catalog: PokedexEntry[] = []
  for (let dexId = 1; dexId <= MOCK_POKEDEX_TOTAL; dexId++) {
    catalog.push(resolvePokedexEntry(dexId, DISCOVERED_DEX_IDS.has(dexId)))
  }
  return catalog
}

/** Offline catalog used only when `VITE_AUTH_MOCK` is enabled. */
export const mockPokedexCatalog = buildCatalog()

export const mockPokedexDiscoveredCount = DISCOVERED_DEX_IDS.size
