import type { ReactNode } from 'react'

import { mockParty } from '../mock-party'
import { PekePartyBar } from './PekePartyBar'

type GameHudShellProps = {
  children?: ReactNode
}

export function GameHudShell({ children }: GameHudShellProps) {
  return (
    <div className="game-hud-shell">
      <div className="game-viewport" aria-hidden={children ? undefined : true}>
        {children ?? (
          <p className="game-viewport-placeholder">World viewport</p>
        )}
      </div>

      <div className="game-hud-overlay">
        <PekePartyBar party={mockParty} />
      </div>
    </div>
  )
}
