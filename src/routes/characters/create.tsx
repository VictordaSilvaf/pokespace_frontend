import { createFileRoute } from '@tanstack/react-router'

import { requireSession } from '#/features/auth/session'
import { CreateWizard } from '#/features/characters/components/CreateWizard'

export const Route = createFileRoute('/characters/create')({
  beforeLoad: async () => {
    await requireSession()
  },
  component: CreateWizard,
})
