import { catalogPokemon, pokemonPortraitUrl } from '#/features/game-data'
import { apiRequest } from '#/lib/api/client'
import { isAuthMockEnabled } from '#/lib/auth/mock'

import {
  mockPokedexCatalog,
  mockPokedexDiscoveredCount,
} from './mock-catalog'
import {
  characterPokedexSchema,
  detailToEntryFields,
  listItemToEntry,
  pokemonDetailSchema,
  pokemonListResultSchema
  
  
} from './schemas'
import type {CharacterPokedex, PokemonDetail} from './schemas';
import {
  catalogToPokedexFields,
  MOCK_POKEDEX_TOTAL,
  resolvePokedexEntry,
} from './types'
import type { PokedexEntry, PokeType } from './types'

const PAGE_SIZE = 100

export type PokedexCatalogResult = {
  entries: PokedexEntry[]
  total: number
}

export type PokedexProgressResult = {
  totalCatalog: number
  seen: number
  caught: number
  byDexId: Map<number, { seenAt: string; caughtAt: string | null }>
}

export type MergedPokedexResult = {
  entries: PokedexEntry[]
  totalCatalog: number
  seen: number
  caught: number
  hasCharacter: boolean
}

async function fetchPokemonPage(params: {
  offset: number
  limit: number
  q?: string
  type?: string
}) {
  const search = new URLSearchParams()
  search.set('limit', String(params.limit))
  search.set('offset', String(params.offset))
  if (params.q) search.set('q', params.q)
  if (params.type) search.set('type', params.type)

  const raw = await apiRequest<unknown>(`/pokemon?${search.toString()}`)
  return pokemonListResultSchema.parse(raw)
}

function localCatalogEntries(): PokedexEntry[] {
  return catalogPokemon
    .map((p) => ({
      dexId: p.dexId,
      discovered: true,
      caught: false,
      ...catalogToPokedexFields(p),
      spriteUrl: pokemonPortraitUrl(p.dexId),
    }))
    .sort((a, b) => a.dexId - b.dexId)
}

/**
 * Prefer API species; fill gaps from local OT catalog so the dex stays
 * complete while production seed catches up (dex:sync).
 */
function mergeApiWithLocal(apiEntries: PokedexEntry[]): PokedexEntry[] {
  const byDex = new Map<number, PokedexEntry>()
  for (const entry of localCatalogEntries()) {
    byDex.set(entry.dexId, entry)
  }
  for (const entry of apiEntries) {
    const prev = byDex.get(entry.dexId)
    byDex.set(entry.dexId, {
      ...prev,
      ...entry,
      spriteUrl:
        entry.spriteUrl || prev?.spriteUrl || pokemonPortraitUrl(entry.dexId),
      shinySpriteUrl: entry.shinySpriteUrl ?? prev?.shinySpriteUrl,
      hasShiny: entry.hasShiny || prev?.hasShiny,
    })
  }
  return [...byDex.values()].sort((a, b) => a.dexId - b.dexId)
}

/** Fetch full active catalog (paginated until total). */
export async function listPokemonCatalog(options?: {
  q?: string
  type?: PokeType | null
}): Promise<PokedexCatalogResult> {
  if (isAuthMockEnabled()) {
    let entries = mockPokedexCatalog
    if (options?.type) {
      entries = entries.filter(
        (e) => e.discovered && e.types?.includes(options.type!),
      )
    }
    if (options?.q?.trim()) {
      const q = options.q.trim().toLowerCase()
      entries = entries.filter((e) => {
        if (
          String(e.dexId).includes(q) ||
          String(e.dexId).padStart(3, '0').includes(q)
        ) {
          return true
        }
        return Boolean(e.discovered && e.name?.toLowerCase().includes(q))
      })
    }
    return { entries, total: MOCK_POKEDEX_TOTAL }
  }

  const first = await fetchPokemonPage({
    offset: 0,
    limit: PAGE_SIZE,
    q: options?.q,
    type: options?.type ?? undefined,
  })

  const items = [...first.items]
  let offset = first.limit
  while (offset < first.total) {
    const page = await fetchPokemonPage({
      offset,
      limit: PAGE_SIZE,
      q: options?.q,
      type: options?.type ?? undefined,
    })
    items.push(...page.items)
    offset += page.limit
    if (page.items.length === 0) break
  }

  const apiEntries = items.map((item) => listItemToEntry(item))
  const entries =
    options?.q || options?.type
      ? apiEntries
      : mergeApiWithLocal(apiEntries)

  return {
    entries,
    total: Math.max(first.total, entries.length),
  }
}

export async function getPokemonByDexId(
  dexId: number,
): Promise<PokemonDetail | null> {
  if (isAuthMockEnabled()) {
    return null
  }
  try {
    const raw = await apiRequest<unknown>(`/pokemon/${dexId}`)
    return pokemonDetailSchema.parse(raw)
  } catch {
    return null
  }
}

export async function getCharacterPokedex(
  characterId: string,
): Promise<PokedexProgressResult> {
  if (isAuthMockEnabled()) {
    const byDexId = new Map<
      number,
      { seenAt: string; caughtAt: string | null }
    >()
    for (const entry of mockPokedexCatalog) {
      if (entry.discovered) {
        byDexId.set(entry.dexId, {
          seenAt: new Date(0).toISOString(),
          caughtAt: null,
        })
      }
    }
    return {
      totalCatalog: MOCK_POKEDEX_TOTAL,
      seen: mockPokedexDiscoveredCount,
      caught: 0,
      byDexId,
    }
  }

  const raw = await apiRequest<unknown>(
    `/characters/${encodeURIComponent(characterId)}/pokedex`,
    { auth: true },
  )
  const parsed: CharacterPokedex = characterPokedexSchema.parse(raw)
  const byDexId = new Map(
    parsed.entries.map((e) => [
      e.dexId,
      { seenAt: e.seenAt, caughtAt: e.caughtAt },
    ]),
  )
  return {
    totalCatalog: parsed.totalCatalog,
    seen: parsed.seen,
    caught: parsed.caught,
    byDexId,
  }
}

/** Merge catalog species with character progress into UI entries.
 * By default every species is unlocked (discovered); `caught` still
 * comes from character progress when available.
 */
export async function loadMergedPokedex(
  characterId: string | null,
): Promise<MergedPokedexResult> {
  if (isAuthMockEnabled()) {
    const unlocked = Array.from({ length: MOCK_POKEDEX_TOTAL }, (_, i) => {
      const dexId = i + 1
      return {
        ...resolvePokedexEntry(dexId, true),
        discovered: true,
        caught: false,
      }
    })
    return {
      entries: unlocked,
      totalCatalog: unlocked.length,
      seen: unlocked.length,
      caught: 0,
      hasCharacter: true,
    }
  }

  const catalog = await listPokemonCatalog()
  let progress: PokedexProgressResult | null = null

  if (characterId) {
    try {
      progress = await getCharacterPokedex(characterId)
    } catch {
      progress = null
    }
  }

  const entries = catalog.entries.map((base) => {
    const p = progress?.byDexId.get(base.dexId)
    return {
      ...base,
      discovered: true,
      caught: p?.caughtAt != null,
    }
  })

  return {
    entries,
    totalCatalog: Math.max(
      progress?.totalCatalog ?? 0,
      catalog.total,
      entries.length,
    ),
    seen: entries.length,
    caught: progress?.caught ?? 0,
    hasCharacter: Boolean(characterId),
  }
}

export async function loadPokemonDetailFields(
  dexId: number,
): Promise<Partial<PokedexEntry> | null> {
  if (isAuthMockEnabled()) {
    return resolvePokedexEntry(dexId, true)
  }
  const detail = await getPokemonByDexId(dexId)
  if (detail) return detailToEntryFields(detail)

  const local = catalogPokemon.find((p) => p.dexId === dexId)
  if (!local) return null
  return catalogToPokedexFields(local)
}
