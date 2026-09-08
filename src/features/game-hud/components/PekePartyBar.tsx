import { m } from '#/paraglide/messages'

import type { Peke } from '../types'
import { PekePartySlot } from './PekePartySlot'

type PekePartyBarProps = {
  party: Peke[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function initialSelectedId(party: Peke[]): string | null {
  const active = party.find((peke) => !peke.fainted)
  return active?.id ?? party.at(0)?.id ?? null
}

export function PekePartyBar({
  party,
  selectedId,
  onSelect,
}: PekePartyBarProps) {
  return (
    <aside
      className="pointer-events-auto absolute top-14 left-0 max-h-[calc(100dvh-3.75rem)] w-auto overflow-visible pt-1 pr-3 pb-2 pl-2 md:top-36 md:max-h-[calc(100dvh-9.5rem)] md:w-[min(20rem,calc(100vw-1.5rem))] md:pl-3"
      aria-label={m.peke_party_label()}
    >
      <ul
        className="m-0 grid max-h-[inherit] list-none gap-2 overflow-x-visible overflow-y-auto p-0 pr-1 scrollbar-none md:gap-3"
        role="listbox"
      >
        {party.map((peke) => (
          <li key={peke.id} role="none" className="overflow-visible">
            <PekePartySlot
              peke={peke}
              selected={peke.id === selectedId}
              onSelect={() => onSelect(peke.id)}
            />
          </li>
        ))}
      </ul>
    </aside>
  )
}
