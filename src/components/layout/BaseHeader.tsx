import { Link, useRouterState } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'
import { BrandMark } from '#/components/brand/BrandMark'
import LocaleSwitcher from '#/components/LocaleSwitcher'
import { useAuth } from '#/lib/auth/auth-provider'
import { cn } from '#/lib/utils'

const links = [
  { to: '/base', label: () => m.nav_base() },
  { to: '/base/account', label: () => m.nav_account() },
  { to: '/base/security', label: () => m.nav_security() },
  { to: '/base/sessions', label: () => m.nav_sessions() },
] as const

export function BaseHeader() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const auth = useAuth()

  return (
    <header className="site-top">
      <BrandMark compact />
      <nav className="site-nav" aria-label={m.brand()}>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={cn('nav-link', pathname === link.to && 'is-active')}
          >
            {link.label()}
          </Link>
        ))}
        <button
          type="button"
          className="btn btn-quiet"
          onClick={() => void auth.signOut()}
        >
          {m.nav_logout()}
        </button>
        <LocaleSwitcher />
      </nav>
    </header>
  )
}
