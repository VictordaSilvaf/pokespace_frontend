import type { ReactNode } from 'react'

import { mockParty } from '../mock-party'
import { PekePartyBar } from './PekePartyBar'
import { MenuBar } from './MenuBar'

type GameHudShellProps = {
  children?: ReactNode
}

export function GameHudShell({ children }: GameHudShellProps) {
  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-hud-viewport">
      <div
        className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_40%_30%,rgba(40,80,50,0.35),transparent_55%),linear-gradient(180deg,#132018_0%,#0b1210_100%)]"
        aria-hidden={children ? undefined : true}
      >
        {children ?? (
          <p className="m-0 text-[0.85rem] font-bold tracking-[0.12em] text-hud-ink/35 uppercase">
            World viewport
          </p>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 z-[3]">
        <MenuBar />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[2]">
        <PekePartyBar party={mockParty} />
      </div>
    </div>
  )
}
