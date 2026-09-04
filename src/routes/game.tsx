import { createFileRoute } from '@tanstack/react-router'

import { requireSession } from '#/features/auth/session'
import { GameHudShell } from '#/features/game-hud/components/GameHudShell'

export const Route = createFileRoute('/game')({
  beforeLoad: async () => {
    await requireSession()
  },
  component: GamePage,
})

function GamePage() {
  return <GameHudShell />
}
