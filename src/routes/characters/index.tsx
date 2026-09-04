import { createFileRoute } from '@tanstack/react-router'

import { requireSession } from '#/features/auth/session'
import { CharacterSelectScreen } from '#/features/characters/components/CharacterSelectScreen'

export const Route = createFileRoute('/characters/')({
  beforeLoad: async () => {
    await requireSession()
  },
  component: CharacterSelectScreen,
})
