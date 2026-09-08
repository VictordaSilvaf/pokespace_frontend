import { createFileRoute } from '@tanstack/react-router'

import { CreateWizard } from '#/features/characters/components/CreateWizard'
import { RequireSession } from '#/lib/auth/gates'

export const Route = createFileRoute('/characters/create')({
  component: CreateCharacterPage,
})

function CreateCharacterPage() {
  return (
    <RequireSession>
      <CreateWizard />
    </RequireSession>
  )
}
