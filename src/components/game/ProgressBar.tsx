import { cn } from '#/lib/utils'

type ProgressBarProps = {
  value: number
  max: number
  tone?: 'hp' | 'xp' | 'energy'
  className?: string
  showLabel?: boolean
}

export function ProgressBar({
  value,
  max,
  tone = 'hp',
  className,
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100))

  return (
    <div className={cn('hud-bar-track', className)}>
      <div
        className={cn('hud-bar-fill', `hud-bar-fill--${tone}`)}
        style={{ width: `${pct}%` }}
      />
      {showLabel ? (
        <span className="hud-bar-label">
          {value} / {max}
        </span>
      ) : null}
    </div>
  )
}
