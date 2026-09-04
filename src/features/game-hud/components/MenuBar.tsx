import { useNavigate } from '@tanstack/react-router'
import { House, Menu, Store, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { useAuth } from '#/lib/auth/auth-provider'
import { cn } from '#/lib/utils'
import { m } from '#/paraglide/messages'

const TOP_MENU = '/assets/data/images/ui/pxg/topMenu_icons'
const PXG = '/assets/data/images/ui/pxg'

type MenuId =
  | 'loja'
  | 'cp'
  | 'guild'
  | 'casa'
  | 'amigos'
  | 'meus_pokemons'
  | 'map'
  | 'mochila'
  | 'noticias'
  | 'settings'
  | 'logout'

type MenuItem = {
  id: MenuId
  label: () => string
  iconSrc?: string
  icon?: LucideIcon
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'loja', label: () => m.menu_loja(), icon: Store },
  { id: 'cp', label: () => m.menu_cp(), iconSrc: `${PXG}/HealthHeart.png` },
  {
    id: 'guild',
    label: () => m.menu_guild(),
    iconSrc: `${TOP_MENU}/guild_icon.png`,
  },
  { id: 'casa', label: () => m.menu_casa(), icon: House },
  {
    id: 'amigos',
    label: () => m.menu_amigos(),
    iconSrc: `${TOP_MENU}/friend_icon.png`,
  },
  {
    id: 'meus_pokemons',
    label: () => m.menu_meus_pokemons(),
    iconSrc: `${TOP_MENU}/pokemon_icon.png`,
  },
  {
    id: 'map',
    label: () => m.menu_map(),
    iconSrc: `${TOP_MENU}/minimap_icon.png`,
  },
  {
    id: 'mochila',
    label: () => m.menu_mochila(),
    iconSrc: `${TOP_MENU}/bag_icon.png`,
  },
  {
    id: 'noticias',
    label: () => m.menu_noticias(),
    iconSrc: `${TOP_MENU}/news_icon.png`,
  },
  {
    id: 'settings',
    label: () => m.menu_settings(),
    iconSrc: `${TOP_MENU}/config_icon.png`,
  },
  {
    id: 'logout',
    label: () => m.menu_logout(),
    iconSrc: `${TOP_MENU}/sair_icon.png`,
  },
]

function MenuButton({
  item,
  onClick,
  layout = 'desktop',
}: {
  item: MenuItem
  onClick: () => void
  layout?: 'desktop' | 'modal'
}) {
  const label = item.label()
  const FallbackIcon = item.icon
  const iconSize = layout === 'modal' ? 'size-7' : 'size-8'

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-xl border border-transparent text-hud-ink-soft transition-colors hover:border-white/15 hover:bg-white/8 hover:text-hud-ink',
        layout === 'desktop' && 'size-11 flex-col gap-0.5 p-1',
        layout === 'modal' &&
          'aspect-square w-full flex-col gap-1.5 p-2 text-center',
        item.id === 'logout' && 'hover:border-red-400/30 hover:text-red-300',
      )}
    >
      {item.iconSrc ? (
        <img
          src={item.iconSrc}
          alt=""
          aria-hidden
          draggable={false}
          className={cn(iconSize, 'object-contain [image-rendering:pixelated]')}
        />
      ) : FallbackIcon ? (
        <FallbackIcon
          className={layout === 'modal' ? 'size-6' : 'size-8'}
          strokeWidth={1.75}
        />
      ) : null}
      {layout === 'modal' ? (
        <span className="text-[0.7rem] font-semibold leading-tight text-hud-ink">
          {label}
        </span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </button>
  )
}

export function MenuBar() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  async function handleItem(id: MenuId) {
    setMobileOpen(false)

    if (id === 'logout') {
      await auth.signOut()
      await navigate({ to: '/login' })
    }

    // Placeholders until those screens exist.
  }

  const modal =
    mobileOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="pointer-events-auto fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px] md:hidden"
            role="presentation"
            onClick={() => setMobileOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={m.menu_label()}
              className="w-full max-w-sm rounded-3xl border border-hud-panel-border bg-hud-panel p-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <h2 className="m-0 text-sm font-bold tracking-wide text-hud-ink uppercase">
                  {m.menu_label()}
                </h2>
                <button
                  type="button"
                  aria-label={m.menu_label()}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex size-9 cursor-pointer items-center justify-center rounded-xl text-hud-ink-soft hover:bg-white/8 hover:text-hud-ink"
                >
                  <X className="size-5" strokeWidth={1.75} />
                </button>
              </div>

              <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0">
                {MENU_ITEMS.map((item) => (
                  <li key={item.id}>
                    <MenuButton
                      item={item}
                      layout="modal"
                      onClick={() => void handleItem(item.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <header className="pointer-events-auto absolute top-0 left-1/2 w-auto max-w-[calc(100vw-1rem)] -translate-x-1/2 rounded-b-3xl border border-t-0 border-hud-panel-border bg-hud-panel px-3 py-2 md:px-5 md:py-3">
        <div className="flex items-center justify-center md:hidden">
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            aria-label={m.menu_label()}
            onClick={() => setMobileOpen(true)}
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xl text-hud-ink hover:bg-white/8"
          >
            <Menu className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <ul
          className="m-0 hidden list-none grid-flow-col gap-1 overflow-visible p-0 md:grid"
          aria-label={m.menu_label()}
        >
          {MENU_ITEMS.map((item) => (
            <li key={item.id}>
              <MenuButton
                item={item}
                layout="desktop"
                onClick={() => void handleItem(item.id)}
              />
            </li>
          ))}
        </ul>
      </header>

      {modal}
    </>
  )
}
