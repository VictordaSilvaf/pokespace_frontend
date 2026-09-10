import { queryOptions } from '@tanstack/react-query'

import {
  loadMergedPokedex,
  loadPokemonDetailFields,
} from './api'

export const pokedexKeys = {
  all: ['pokedex'] as const,
  merged: (characterId: string | null) =>
    [...pokedexKeys.all, 'merged', characterId ?? 'none'] as const,
  detail: (dexId: number) => [...pokedexKeys.all, 'detail', dexId] as const,
}

export const pokedexMergedQueryOptions = (characterId: string | null) =>
  queryOptions({
    queryKey: pokedexKeys.merged(characterId),
    queryFn: () => loadMergedPokedex(characterId),
    staleTime: 30_000,
  })

export const pokedexDetailQueryOptions = (dexId: number, enabled: boolean) =>
  queryOptions({
    queryKey: pokedexKeys.detail(dexId),
    queryFn: () => loadPokemonDetailFields(dexId),
    enabled,
    staleTime: 60_000,
  })
