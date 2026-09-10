import { cn } from '#/lib/utils'

import { TYPE_COLORS  } from '../types'
import type {PokeType} from '../types';

const TYPE_LABEL: Record<PokeType, string> = {
  normal: 'NOR',
  fire: 'FIR',
  water: 'WAT',
  electric: 'ELE',
  grass: 'GRA',
  ice: 'ICE',
  fighting: 'FIG',
  poison: 'POI',
  ground: 'GRO',
  flying: 'FLY',
  psychic: 'PSY',
  bug: 'BUG',
  rock: 'ROC',
  ghost: 'GHO',
  dragon: 'DRA',
  dark: 'DAR',
  steel: 'STE',
  fairy: 'FAI',
}

type TypeBadgeProps = {
  type: PokeType
  size?: 'sm' | 'md'
  selected?: boolean
  onClick?: () => void
  title?: string
}

export function TypeBadge({
  type,
  size = 'sm',
  selected,
  onClick,
  title,
}: TypeBadgeProps) {
  const color = TYPE_COLORS[type]
  const className = cn(
    'inline-flex shrink-0 items-center justify-center rounded-full border font-bold uppercase tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]',
    size === 'sm' && 'size-5 text-[0.5rem]',
    size === 'md' && 'size-8 text-[0.62rem]',
    onClick && 'cursor-pointer transition-transform hover:scale-105',
    selected && 'ring-2 ring-gold ring-offset-1 ring-offset-transparent',
    !selected && onClick && 'opacity-70 hover:opacity-100',
  )
  const style = {
    backgroundColor: color,
    borderColor: 'rgba(0,0,0,0.35)',
  }
  const label = title ?? type

  if (onClick) {
    return (
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-pressed={Boolean(selected)}
        onClick={onClick}
        className={className}
        style={style}
      >
        {TYPE_LABEL[type]}
      </button>
    )
  }

  return (
    <span title={label} className={className} style={style}>
      {TYPE_LABEL[type]}
    </span>
  )
}
