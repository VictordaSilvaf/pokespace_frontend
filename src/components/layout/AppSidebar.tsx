import { Link, useRouterState } from '@tanstack/react-router'

import { BrandMark } from '#/components/brand/BrandMark'
import LocaleSwitcher from '#/components/LocaleSwitcher'
import { useAuth } from '#/lib/auth/auth-provider'
import { isAuthMockEnabled } from '#/lib/auth/mock'
import { pillButton } from '#/lib/pill-button'
import { cn } from '#/lib/utils'
import { m } from '#/paraglide/messages'

function isActivePath(pathname: string, to: string) {
  if (to === '/characters') {
    return pathname === '/characters' || pathname === '/characters/'
  }
  return pathname === to || pathname.startsWith(`${to}/`)
}

const AUTH_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/two-factor',
]

export function AppSidebar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const auth = useAuth()
  const loggedIn = Boolean(auth.session)

  const onAuthScreen = AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )

  const guestLinks = [
    { to: '/login' as const, label: m.nav_login() },
    { to: '/register' as const, label: m.nav_register() },
  ] as const

  const loggedInLinks = [
    { to: '/characters' as const, label: m.nav_characters() },
    { to: '/characters/create' as const, label: m.nav_create_character() },
    { to: '/game' as const, label: m.nav_game() },
    { to: '/base' as const, label: m.nav_base() },
    { to: '/base/account' as const, label: m.nav_account() },
    { to: '/base/security' as const, label: m.nav_security() },
    { to: '/base/sessions' as const, label: m.nav_sessions() },
  ] as const

  const links = onAuthScreen
    ? guestLinks
    : loggedIn
      ? loggedInLinks
      : guestLinks

  return (
    <aside
      className={cn(
        'z-40 flex gap-5 border-line bg-[rgba(10,10,16,0.92)] backdrop-blur-[10px]',
        'sticky top-0 h-svh flex-col border-r px-3.5 py-4',
        'max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto max-lg:h-auto max-lg:flex-row max-lg:items-center max-lg:gap-1.5 max-lg:overflow-x-auto max-lg:border-r-0 max-lg:border-t max-lg:px-2.5 max-lg:py-2 max-lg:pb-[calc(0.55rem+env(safe-area-inset-bottom))]',
      )}
    >
      <div className="max-lg:hidden">
        <BrandMark compact />
      </div>

      <div className="min-w-0 max-lg:flex-1">
        <p className="mx-2.5 mt-1.5 mb-1.5 text-[0.68rem] font-bold tracking-[0.14em] text-mute uppercase max-lg:hidden">
          {m.nav_menu()}
        </p>
        <nav
          className="grid gap-0.5 max-lg:flex max-lg:w-full max-lg:gap-1"
          aria-label={m.app_brand()}
        >
          {links.map((link) => {
            const active = isActivePath(pathname, link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-2.5 rounded-[10px] border-l-2 border-transparent px-3 py-2.5 font-semibold text-ink-soft hover:bg-white/4 hover:text-ink',
                  'max-lg:border-b-2 max-lg:border-l-0 max-lg:whitespace-nowrap max-lg:px-2.5 max-lg:py-2 max-lg:text-sm',
                  active &&
                    'border-l-gold bg-gold/10 text-gold max-lg:border-b-gold max-lg:border-l-transparent',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 max-lg:hidden" />

      <div className="grid gap-2 max-lg:ml-auto max-lg:flex max-lg:shrink-0 max-lg:gap-1.5">
        {isAuthMockEnabled() ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/12 px-2.5 py-1 text-[0.72rem] font-bold tracking-wide text-gold uppercase max-lg:hidden">
            {m.mock_badge()}
          </span>
        ) : null}
        <div className="max-lg:hidden">
          <LocaleSwitcher />
        </div>
        {loggedIn ? (
          <button
            type="button"
            className={pillButton({ variant: 'ghost', size: 'sm' })}
            onClick={() => void auth.signOut()}
          >
            {m.nav_logout()}
          </button>
        ) : onAuthScreen ? null : (
          <>
            <Link
              to="/register"
              className={pillButton({ variant: 'ghost', size: 'sm' })}
            >
              {m.nav_register()}
            </Link>
            <Link
              to="/login"
              className={pillButton({ variant: 'gold', size: 'sm' })}
            >
              {m.cta_enter_short()}
            </Link>
          </>
        )}
      </div>
    </aside>
  )
}
