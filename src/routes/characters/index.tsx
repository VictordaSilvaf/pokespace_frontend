import { createFileRoute } from '@tanstack/react-router'

import { CharacterSelectScreen } from '#/features/characters/components/CharacterSelectScreen'
import { RequireSession } from '#/lib/auth/gates'

export const Route = createFileRoute('/characters/')({
  component: CharactersPage,
})

function CharactersPage() {
  return (
    <RequireSession>
      <CharacterSelectScreen />
    </RequireSession>
  )
}
