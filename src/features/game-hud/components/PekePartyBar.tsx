import { m } from '#/paraglide/messages'

import type { Peke } from '../types'
import { PekePartySlot } from './PekePartySlot'

type PekePartyBarProps = {
  party: Peke[]
}

export function PekePartyBar({ party }: PekePartyBarProps) {
  return (
    <aside className="peke-party-bar" aria-label={m.peke_party_label()}>
      <ul className="peke-party-list">
        {party.map((peke) => (
          <li key={peke.id}>
            <PekePartySlot peke={peke} />
          </li>
        ))}
      </ul>
    </aside>
  )
}
