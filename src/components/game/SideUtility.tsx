import { Settings, Share2 } from 'lucide-react'

type SideUtilityProps = {
  onSettings?: () => void
  onShare?: () => void
}

export function SideUtility({ onSettings, onShare }: SideUtilityProps) {
  return (
    <aside className="pointer-events-none absolute left-3 top-24 z-30 flex flex-col gap-2 sm:left-4 sm:top-28">
      <button
        type="button"
        onClick={onSettings}
        className="pointer-events-auto hud-icon-btn hud-rise"
        aria-label="Configurações"
        style={{ animationDelay: '80ms' }}
      >
        <Settings className="size-5" />
      </button>
      <button
        type="button"
        onClick={onShare}
        className="pointer-events-auto hud-icon-btn hud-rise"
        aria-label="Social"
        style={{ animationDelay: '140ms' }}
      >
        <Share2 className="size-5" />
      </button>
    </aside>
  )
}
