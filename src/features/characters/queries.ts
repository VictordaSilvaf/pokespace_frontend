import { queryOptions } from '@tanstack/react-query'

import {
  createCharacterFn,
  getCharacterFn,
  getCreationOptionsFn,
  listCharactersFn,
} from './api'
import type { CreateCharacterInput } from './schemas'

export const characterKeys = {
  all: ['characters'] as const,
  list: () => [...characterKeys.all, 'list'] as const,
  creationOptions: () =>
    [...characterKeys.all, 'creation-options'] as const,
  detail: (id: string) => [...characterKeys.all, id] as const,
}

export const charactersListQueryOptions = () =>
  queryOptions({
    queryKey: characterKeys.list(),
    queryFn: () => listCharactersFn(),
  })

export const creationOptionsQueryOptions = () =>
  queryOptions({
    queryKey: characterKeys.creationOptions(),
    queryFn: () => getCreationOptionsFn(),
  })

export const characterDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: characterKeys.detail(id),
    queryFn: () => getCharacterFn({ data: { id } }),
  })

export async function createCharacterMutationFn(input: CreateCharacterInput) {
  return createCharacterFn({ data: input })
}
