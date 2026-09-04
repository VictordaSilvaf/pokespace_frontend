import { m } from '#/paraglide/messages'
import { cn } from '#/lib/utils'

import type { Peke } from '../types'

type PekePartySlotProps = {
  peke: Peke
}

function hpRatio(peke: Peke): number {
  if (peke.fainted || peke.maxHp <= 0) return 0
  return Math.max(0, Math.min(1, peke.hp / peke.maxHp))
}

function hpTone(ratio: number, fainted: boolean): 'high' | 'mid' | 'low' | 'empty' {
  if (fainted || ratio <= 0) return 'empty'
  if (ratio > 0.5) return 'high'
  if (ratio > 0.25) return 'mid'
  return 'low'
}

export function PekePartySlot({ peke }: PekePartySlotProps) {
  const ratio = hpRatio(peke)
  const tone = hpTone(ratio, peke.fainted)
  const percent = Math.round(ratio * 100)

  return (
    <article
      className={cn('peke-slot', peke.fainted && 'is-fainted')}
      aria-label={peke.name}
    >
      <div className="peke-portrait">
        <img src={peke.spriteUrl} alt="" draggable={false} />
      </div>

      <div className="peke-meta">
        <div className="peke-name-row">
          <span className="peke-name">{peke.name}</span>
          {!peke.fainted ? (
            <span className="peke-hp-label">{percent}%</span>
          ) : null}
        </div>

        <div className="peke-hp-track" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <div
            className={cn('peke-hp-fill', `is-${tone}`)}
            style={{ width: `${percent}%` }}
          />
          {peke.fainted ? (
            <span className="peke-fainted-label">{m.peke_fainted()}</span>
          ) : null}
        </div>

        <span className="peke-bonus">
          {m.peke_bonus({ value: String(peke.bonus) })}
        </span>
      </div>
    </article>
  )
}
