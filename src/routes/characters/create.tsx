import { createFileRoute, redirect } from '@tanstack/react-router'

import { requireSession } from '#/features/auth/session'
import { CreateWizard } from '#/features/characters/components/CreateWizard'
import {
  creationOptionsQueryOptions,
  charactersListQueryOptions,
} from '#/features/characters/queries'

export const Route = createFileRoute('/characters/create')({
  beforeLoad: async ({ context }) => {
    await requireSession()

    const [list, options] = await Promise.all([
      context.queryClient.ensureQueryData(charactersListQueryOptions()),
      context.queryClient.ensureQueryData(creationOptionsQueryOptions()),
    ])

    const canCreate = options.limits.canCreate && list.limits.canCreate
    if (!canCreate) {
      throw redirect({ to: '/characters' })
    }
  },
  component: CreateWizard,
})
