import { Link, useRouterState } from '@tanstack/react-router'

import { BrandMark } from '#/components/brand/BrandMark'
import LocaleSwitcher from '#/components/LocaleSwitcher'
import { useAuth } from '#/lib/auth/auth-provider'
import { isAuthMockEnabled } from '#/lib/auth/mock'
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

  const links = onAuthScreen
    ? guestLinks
    : loggedIn
      ? ([
          { to: '/characters' as const, label: m.nav_characters() },
          {
            to: '/characters/create' as const,
            label: m.nav_create_character(),
          },
          { to: '/game' as const, label: m.nav_game() },
          { to: '/base' as const, label: m.nav_base() },
          { to: '/base/account' as const, label: m.nav_account() },
          { to: '/base/security' as const, label: m.nav_security() },
          { to: '/base/sessions' as const, label: m.nav_sessions() },
        ] as const)
      : guestLinks

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BrandMark compact />
      </div>

      <div>
        <p className="sidebar-menu-label">{m.nav_menu()}</p>
        <nav className="sidebar-nav" aria-label={m.app_brand()}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'sidebar-link',
                isActivePath(pathname, link.to) && 'is-active',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="sidebar-spacer" />

      <div className="sidebar-footer">
        {isAuthMockEnabled() ? (
          <span className="demo-chip">{m.mock_badge()}</span>
        ) : null}
        <LocaleSwitcher />
        {loggedIn ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => void auth.signOut()}
          >
            {m.nav_logout()}
          </button>
        ) : onAuthScreen ? null : (
          <>
            <Link to="/register" className="btn btn-ghost">
              {m.nav_register()}
            </Link>
            <Link to="/login" className="btn btn-gold">
              {m.cta_enter_short()}
            </Link>
          </>
        )}
      </div>
    </aside>
  )
}
