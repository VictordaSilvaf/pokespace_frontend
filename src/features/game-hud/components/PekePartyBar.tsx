import { useState } from 'react'

import { m } from '#/paraglide/messages'

import type { Peke } from '../types'
import { PekePartySlot } from './PekePartySlot'

type PekePartyBarProps = {
  party: Peke[]
}

function initialSelectedId(party: Peke[]): string | null {
  const active = party.find((peke) => !peke.fainted)
  return active?.id ?? party.at(0)?.id ?? null
}

export function PekePartyBar({ party }: PekePartyBarProps) {
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    initialSelectedId(party),
  )

  return (
    <aside
      className="pointer-events-auto absolute top-16 left-2 w-auto md:top-36 md:left-0 md:w-[min(20rem,calc(100vw-1.3rem))]"
      aria-label={m.peke_party_label()}
    >
      <ul
        className="m-0 grid list-none gap-2 overflow-visible p-0 md:gap-3"
        role="listbox"
      >
        {party.map((peke) => (
          <li key={peke.id} role="none">
            <PekePartySlot
              peke={peke}
              selected={peke.id === selectedId}
              onSelect={() => setSelectedId(peke.id)}
            />
          </li>
        ))}
      </ul>
    </aside>
  )
}
