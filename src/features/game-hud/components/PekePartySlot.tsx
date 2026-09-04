import { useState } from 'react'
import { motion } from 'motion/react'

import { m } from '#/paraglide/messages'
import { cn } from '#/lib/utils'

import type { Peke } from '../types'

type PekePartySlotProps = {
  peke: Peke
  selected: boolean
  onSelect: () => void
}

function hpRatio(peke: Peke): number {
  if (peke.fainted || peke.maxHp <= 0) return 0
  return Math.max(0, Math.min(1, peke.hp / peke.maxHp))
}

function hpTone(
  ratio: number,
  fainted: boolean,
): 'high' | 'mid' | 'low' | 'empty' {
  if (fainted || ratio <= 0) return 'empty'
  if (ratio > 0.5) return 'high'
  if (ratio > 0.25) return 'mid'
  return 'low'
}

const hpFillClass = {
  high: 'bg-gradient-to-b from-[#5ee887] to-hud-hp-high',
  mid: 'bg-gradient-to-b from-[#f0db6a] to-hud-hp-mid',
  low: 'bg-gradient-to-b from-[#ff7a7a] to-hud-hp-low',
  empty: '!w-0 bg-hud-hp-empty',
} as const

const ringStroke = {
  high: '#3fd46c',
  mid: '#e6c84a',
  low: '#e24b4b',
  empty: '#5a3030',
} as const

/** Soft spring — subtle, no bounce overshoot. */
const softSpring = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 32,
  mass: 0.85,
}

const softTween = {
  type: 'tween' as const,
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
}

const RING_SIZE = 44
const RING_RADIUS = 18
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function HpRing({
  ratio,
  tone,
  label,
}: {
  ratio: number
  tone: keyof typeof ringStroke
  label: string
}) {
  const offset = RING_CIRCUMFERENCE * (1 - ratio)

  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full -rotate-90"
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      aria-hidden
    >
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke="rgba(0,0,0,0.55)"
        strokeWidth="3"
      />
      <motion.circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke={ringStroke[tone]}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        initial={false}
        animate={{ strokeDashoffset: offset }}
        transition={softTween}
      />
      <title>{label}</title>
    </svg>
  )
}

export function PekePartySlot({
  peke,
  selected,
  onSelect,
}: PekePartySlotProps) {
  const [hovered, setHovered] = useState(false)
  const ratio = hpRatio(peke)
  const tone = hpTone(ratio, peke.fainted)
  const percent = Math.round(ratio * 100)
  const opacity = peke.fainted ? (selected ? 0.92 : 0.82) : 1

  const scale = selected ? 1.06 : hovered ? 1.03 : 1
  const zIndex = selected || hovered ? 10 : 1
  const meterLabel = peke.fainted ? m.peke_fainted() : `${percent}%`

  return (
    <motion.button
      type="button"
      role="option"
      aria-selected={selected}
      aria-label={`${peke.name}, ${meterLabel}`}
      onClick={() => {
        if (!selected) onSelect()
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={false}
      animate={{
        scale,
        opacity,
        zIndex,
      }}
      whileTap={selected ? undefined : { scale: Math.min(scale, 1.015) }}
      transition={softSpring}
      className={cn(
        'origin-left cursor-pointer bg-transparent select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35',
        // Mobile: compact circular portrait
        'relative size-11 rounded-full border-0 p-0 shadow-none',
        // Desktop: full HUD row
        'md:grid md:size-auto md:w-full md:grid-cols-[2.65rem_1fr] md:items-center md:gap-1.5 md:rounded-r-full md:border md:border-l-0 md:border-hud-panel-border md:bg-hud-panel md:py-1.5 md:pr-16 md:pl-1.5 md:text-left md:shadow-[0_4px_16px_rgba(0,0,0,0.35)] md:rounded-l-none md:backdrop-blur-sm',
        hovered && !selected && 'md:shadow-[0_6px_20px_rgba(0,0,0,0.45)]',
        selected &&
          'md:border-white/40 md:bg-[rgba(32,36,42,0.92)] md:shadow-[0_8px_24px_rgba(0,0,0,0.5)]',
      )}
      style={{ willChange: 'transform', transformOrigin: 'left center' }}
    >
      <div
        className={cn(
          'relative mx-auto size-11 shrink-0 md:mx-0 md:size-[2.65rem]',
          'rounded-full bg-black/45',
          'md:overflow-hidden md:border md:border-white/14',
          selected && 'md:border-white/45 md:shadow-[0_0_0_2px_rgba(255,255,255,0.18)]',
        )}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={meterLabel}
      >
        <div className="absolute inset-0 md:hidden">
          <HpRing ratio={ratio} tone={tone} label={meterLabel} />
        </div>

        <div
          className={cn(
            'absolute inset-1 overflow-hidden rounded-full md:static md:inset-auto md:size-full',
            peke.fainted && 'ring-1 ring-red-500/50',
          )}
        >
          <motion.img
            src={peke.spriteUrl}
            alt=""
            draggable={false}
            initial={false}
            animate={{
              scale: selected ? 1.1 : 1,
              filter: peke.fainted
                ? 'grayscale(0.35) sepia(0.85) hue-rotate(-15deg) saturate(2.4) brightness(0.72)'
                : 'none',
            }}
            transition={softSpring}
            className="size-full object-contain [image-rendering:pixelated]"
          />
          {peke.fainted ? (
            <span
              className="pointer-events-none absolute inset-0 rounded-full bg-red-700/35 mix-blend-multiply md:hidden"
              aria-hidden
            />
          ) : null}
        </div>
      </div>

      <div className="hidden min-w-0 gap-0.5 md:grid">
        <div className="flex items-baseline justify-between gap-1.5">
          <span className="truncate text-[0.78rem] font-bold text-hud-ink">
            {peke.name}
          </span>
          {!peke.fainted ? (
            <span className="shrink-0 text-[0.65rem] font-semibold text-hud-ink-soft">
              {percent}%
            </span>
          ) : null}
        </div>

        <div className="relative min-h-4 overflow-hidden rounded-[3px] border border-white/8 bg-hud-hp-track">
          <motion.div
            className={cn('h-full rounded-[inherit]', hpFillClass[tone])}
            initial={false}
            animate={{ width: tone === 'empty' ? '0%' : `${percent}%` }}
            transition={softTween}
          />
          {peke.fainted ? (
            <span className="absolute inset-0 grid place-items-center bg-[rgba(90,30,30,0.55)] text-[0.58rem] font-extrabold tracking-wide text-white uppercase [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
              {m.peke_fainted()}
            </span>
          ) : null}
        </div>

        <span className="text-[0.62rem] font-semibold text-hud-ink-soft">
          {m.peke_bonus({ value: String(peke.bonus) })}
        </span>
      </div>
    </motion.button>
  )
}
