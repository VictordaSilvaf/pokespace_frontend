import { Link, useRouterState } from '@tanstack/react-router'
import { BrandMark } from '#/components/brand/BrandMark'
import LocaleSwitcher from '#/components/LocaleSwitcher'
import { useAuth } from '#/lib/auth/auth-provider'
import { isAuthMockEnabled } from '#/lib/auth/mock'
import { m } from '#/paraglide/messages'
import { cn } from '#/lib/utils'

export function AppSidebar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const auth = useAuth()
  const loggedIn = Boolean(auth.session)

  const guestLinks = [{ to: '/', label: m.nav_home() }] as const
  const authedLinks = [
    { to: '/base', label: m.nav_base() },
    { to: '/base/account', label: m.nav_account() },
    { to: '/base/security', label: m.nav_security() },
    { to: '/base/sessions', label: m.nav_sessions() },
  ] as const

  const links = loggedIn ? authedLinks : guestLinks

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BrandMark compact />
      </div>

      <div>
        <p className="sidebar-menu-label">{m.nav_menu()}</p>
        <nav className="sidebar-nav" aria-label={m.brand()}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'sidebar-link',
                (pathname === link.to ||
                  (link.to !== '/' && pathname.startsWith(link.to))) &&
                  'is-active',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="sidebar-spacer" />

      <div className="sidebar-footer">
        {isAuthMockEnabled() ? <span className="demo-chip">{m.mock_badge()}</span> : null}
        <LocaleSwitcher />
        {loggedIn ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => void auth.signOut()}
          >
            {m.nav_logout()}
          </button>
        ) : (
          <Link to="/login" className="btn btn-gold">
            {m.cta_enter_short()}
          </Link>
        )}
      </div>
    </aside>
  )
}
