import {
  Coins,
  Gem,
  Leaf,
  Zap,
  Package,
  Search,
  ShoppingBag,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { actionMenu, type ActionMenuItem } from './mock-data'

const icons = {
  shop: ShoppingBag,
  explore: Search,
  energy: Zap,
  gems: Gem,
  'bag-a': Package,
  'bag-b': Package,
  boost: Leaf,
} as const

const toneClass: Record<ActionMenuItem['tone'], string> = {
  gold: 'text-[color:var(--hud-gold)]',
  sky: 'text-sky-300',
  energy: 'text-amber-300',
  gem: 'text-cyan-300',
  bag: 'text-lime-300',
  boost: 'text-emerald-300',
  alert: 'text-rose-300',
}

type RightActionMenuProps = {
  activeId?: string | null
  onSelect?: (id: string) => void
}

export function RightActionMenu({
  activeId,
  onSelect,
}: RightActionMenuProps) {
  return (
    <aside className="pointer-events-none absolute right-2 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2 sm:right-4">
      {actionMenu.map((item, index) => {
        const Icon = icons[item.id as keyof typeof icons] ?? Coins
        const active = activeId === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            className={cn(
              'pointer-events-auto hud-menu-btn hud-rise relative',
              active && 'hud-menu-btn--active',
            )}
            aria-label={item.label}
            aria-pressed={active}
            style={{ animationDelay: `${100 + index * 40}ms` }}
          >
            <Icon className={cn('size-5', toneClass[item.tone])} />
            {item.badge ? (
              <span className="hud-badge">{item.badge}</span>
            ) : null}
          </button>
        )
      })}
    </aside>
  )
}
