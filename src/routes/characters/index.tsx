import { createFileRoute } from '@tanstack/react-router'

import { requireSession } from '#/features/auth/session'
import { CharacterSelectScreen } from '#/features/characters/components/CharacterSelectScreen'
import { charactersListQueryOptions } from '#/features/characters/queries'

export const Route = createFileRoute('/characters/')({
  beforeLoad: async () => {
    await requireSession()
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(charactersListQueryOptions())
  },
  component: CharacterSelectScreen,
})
