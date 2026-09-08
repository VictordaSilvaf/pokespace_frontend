import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

import { mockParty } from '../mock-party'
import type { Peke } from '../types'
import { initialSelectedId, PekePartyBar } from './PekePartyBar'
import { MenuBar } from './MenuBar'

type GameHudShellProps = {
  children?: ReactNode
}

type FollowerChildProps = {
  followerPeke?: Peke | null
}

export function GameHudShell({ children }: GameHudShellProps) {
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    initialSelectedId(mockParty),
  )

  const selectedPeke =
    mockParty.find((peke) => peke.id === selectedId) ?? null

  useEffect(() => {
    const html = document.documentElement
    const { body } = document
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
    }

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'

    return () => {
      html.style.overflow = prev.htmlOverflow
      body.style.overflow = prev.bodyOverflow
      body.style.overscrollBehavior = prev.bodyOverscroll
    }
  }, [])

  const world = Children.map(children, (child) => {
    if (!isValidElement(child)) return child
    return cloneElement(child as ReactElement<FollowerChildProps>, {
      followerPeke: selectedPeke,
    })
  })

  return (
    <div className="fixed inset-0 z-40 h-dvh w-full touch-none overflow-hidden bg-void">
      <div
        className="absolute inset-0 size-full overflow-hidden bg-[radial-gradient(900px_500px_at_85%_10%,rgba(249,188,1,0.06),transparent_55%),radial-gradient(700px_420px_at_10%_90%,rgba(70,110,255,0.06),transparent_60%),linear-gradient(160deg,#07070b_0%,#0d0d14_48%,#120e0a_100%)]"
        aria-hidden={children ? undefined : true}
      >
        {world ?? (
          <p className="m-0 grid size-full place-items-center text-[0.85rem] font-bold tracking-[0.12em] text-mute uppercase">
            World viewport
          </p>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 z-3">
        <MenuBar />
      </div>

      <div className="pointer-events-none absolute inset-0 z-2 overflow-visible">
        <PekePartyBar
          party={mockParty}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  )
}
