import { Plus } from 'lucide-react'
import { HudPanel } from './HudPanel'
import { ProgressBar } from './ProgressBar'
import { formatGold, formatPremium, player, spriteUrl } from './mock-data'

type TopHudProps = {
  onAddFunds?: () => void
}

export function TopHud({ onAddFunds }: TopHudProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-4">
      <HudPanel className="pointer-events-auto hud-rise flex min-w-0 items-center gap-2.5 px-2.5 py-2 sm:gap-3 sm:px-3">
        <div className="hud-avatar shrink-0">
          <img
            src={spriteUrl(player.avatarId)}
            alt=""
            className="size-full object-contain drop-shadow-sm"
            draggable={false}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <p className="truncate text-sm font-extrabold tracking-wide text-white sm:text-base">
              {player.name}
            </p>
            <span className="shrink-0 text-[11px] font-bold text-[color:var(--hud-gold)] sm:text-xs">
              Lv. {player.level}
            </span>
          </div>
          <ProgressBar
            value={player.hp}
            max={player.maxHp}
            tone="hp"
            showLabel
            className="mt-1.5 w-[7.5rem] sm:w-40"
          />
        </div>
      </HudPanel>

      <div className="pointer-events-auto hud-rise flex flex-col items-end gap-2 sm:flex-row sm:items-center">
        <HudPanel className="flex items-center gap-2 rounded-full px-3 py-1.5">
          <span className="hud-coin" aria-hidden />
          <span className="text-sm font-extrabold tabular-nums text-[color:var(--hud-gold)]">
            {formatGold(player.gold)}
          </span>
        </HudPanel>

        <HudPanel className="flex items-center gap-2 rounded-full py-1.5 pl-3 pr-1.5">
          <span className="hud-bill" aria-hidden />
          <span className="text-sm font-extrabold tabular-nums text-emerald-300">
            {formatPremium(player.premium)}
          </span>
          <button
            type="button"
            onClick={onAddFunds}
            className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_0_2px_rgba(16,185,129,0.35)] transition hover:scale-105 hover:bg-emerald-400 active:scale-95"
            aria-label="Adicionar fundos"
          >
            <Plus className="size-4" strokeWidth={3} />
          </button>
        </HudPanel>
      </div>
    </header>
  )
}
