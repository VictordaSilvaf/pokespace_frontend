import { Pause, Play, Store } from 'lucide-react'
import { cn } from '#/lib/utils'
import { HudPanel } from './HudPanel'
import { ProgressBar } from './ProgressBar'
import { spriteUrl, team, type TeamMember } from './mock-data'

type BottomHudProps = {
  activeId: string
  onSelectTeam: (id: string) => void
  onPlay: () => void
  onShop: () => void
  playing?: boolean
}

export function BottomHud({
  activeId,
  onSelectTeam,
  onPlay,
  onShop,
  playing = false,
}: BottomHudProps) {
  const active = (team.find((m) => m?.id === activeId) ?? team[0]) as TeamMember

  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:gap-3">
        <div className="flex items-end justify-between gap-1.5 sm:gap-2">
          <HudPanel className="pointer-events-auto hud-rise flex items-center gap-2 px-2 py-1.5 sm:gap-2.5 sm:px-2.5">
            <div className="hud-avatar hud-avatar--sm shrink-0">
              <img
                src={spriteUrl(active.spriteId)}
                alt=""
                className="size-full object-contain"
                draggable={false}
              />
            </div>
            <div className="min-w-[4.5rem]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Lv {active.level}
              </p>
              <p className="text-sm font-extrabold tabular-nums text-white">
                {active.power}
              </p>
              <ProgressBar
                value={active.hp}
                max={active.maxHp}
                tone="hp"
                className="mt-1 h-1.5 w-16"
              />
            </div>
          </HudPanel>

          <div className="pointer-events-auto hud-rise hidden items-end gap-1.5 sm:flex sm:gap-2">
            {team.map((member, index) => (
              <TeamSlot
                key={member?.id ?? `empty-${index}`}
                member={member}
                selected={member?.id === activeId}
                onSelect={onSelectTeam}
              />
            ))}
          </div>

          <div className="pointer-events-auto hud-rise flex items-end gap-1 sm:hidden">
            {team.slice(0, 4).map((member, index) => (
              <TeamSlot
                key={member?.id ?? `empty-m-${index}`}
                member={member}
                selected={member?.id === activeId}
                onSelect={onSelectTeam}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onShop}
            className="pointer-events-auto hud-rise hud-shop-btn shrink-0"
            aria-label="Abrir loja"
          >
            <Store className="size-5 text-emerald-200" />
            <span className="leading-tight">
              Poke
              <br />
              Shop
            </span>
          </button>
        </div>

        <div className="pointer-events-auto relative mx-auto flex w-full max-w-md items-center justify-center">
          <div className="hud-play-tray flex w-full items-center justify-center gap-3 px-4 py-2 sm:gap-5 sm:px-8 sm:py-2.5">
            {team.slice(0, 2).map((member) =>
              member ? (
                <img
                  key={`left-${member.id}`}
                  src={spriteUrl(member.spriteId)}
                  alt=""
                  className="size-8 object-contain opacity-90 sm:size-9"
                  draggable={false}
                />
              ) : null,
            )}

            <button
              type="button"
              onClick={onPlay}
              className={cn('hud-play-btn', playing && 'hud-play-btn--active')}
              aria-label={playing ? 'Pausar' : 'Jogar'}
            >
              <Play
                className={cn(
                  'size-7 fill-white text-white sm:size-8',
                  playing && 'hidden',
                )}
                strokeWidth={1.5}
              />
              <Pause
                className={cn(
                  'size-7 fill-white text-white sm:size-8',
                  !playing && 'hidden',
                )}
                strokeWidth={1.5}
              />
            </button>

            {team.slice(2, 4).map((member) =>
              member ? (
                <img
                  key={`right-${member.id}`}
                  src={spriteUrl(member.spriteId)}
                  alt=""
                  className="size-8 object-contain opacity-90 sm:size-9"
                  draggable={false}
                />
              ) : null,
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}

function TeamSlot({
  member,
  selected,
  onSelect,
}: {
  member: TeamMember | null
  selected: boolean
  onSelect: (id: string) => void
}) {
  if (!member) {
    return <div className="hud-team-slot hud-team-slot--empty" aria-hidden />
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(member.id)}
      className={cn('hud-team-slot', selected && 'hud-team-slot--active')}
      aria-label={`Selecionar ${member.name}`}
      aria-pressed={selected}
    >
      <img
        src={spriteUrl(member.spriteId)}
        alt=""
        className="size-full object-contain p-0.5"
        draggable={false}
      />
    </button>
  )
}
