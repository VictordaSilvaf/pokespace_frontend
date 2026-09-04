import { cn } from '#/lib/utils'

type HudPanelProps = {
  children: React.ReactNode
  className?: string
}

export function HudPanel({ children, className }: HudPanelProps) {
  return (
    <div className={cn('hud-panel', className)} data-slot="hud-panel">
      {children}
    </div>
  )
}
