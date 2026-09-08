import { createFileRoute } from '@tanstack/react-router'

import { GameHudShell } from '#/features/game-hud/components/GameHudShell'
import { GameWorldViewport } from '#/features/game-world/components/GameWorldViewport'
import { RequireSession } from '#/lib/auth/gates'

export const Route = createFileRoute('/game')({
  component: GamePage,
})

function GamePage() {
  return (
    <RequireSession>
      <GameHudShell>
        <GameWorldViewport />
      </GameHudShell>
    </RequireSession>
  )
}
