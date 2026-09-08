import type { QueryClient } from '@tanstack/react-query'

import { charactersListQueryOptions } from './queries'

/** Warm the character roster cache after auth succeeds. */
export function prefetchCharactersList(queryClient: QueryClient) {
  return queryClient.prefetchQuery(charactersListQueryOptions())
}
