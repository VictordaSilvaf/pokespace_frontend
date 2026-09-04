import { Link, useRouterState } from '@tanstack/react-router'

import { BrandMark } from '#/components/brand/BrandMark'
import LocaleSwitcher from '#/components/LocaleSwitcher'
import { cn } from '#/lib/utils'
import { m } from '#/paraglide/messages'

function isActivePath(pathname: string, to: string) {
  if (to === '/characters') {
    return pathname === '/characters' || pathname === '/characters/'
  }
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function AppSidebar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const onAuthScreen =
    pathname === '/login' || pathname.startsWith('/login/')
  const links = onAuthScreen
    ? ([{ to: '/login' as const, label: m.nav_login() }] as const)
    : ([
        { to: '/characters' as const, label: m.nav_characters() },
        { to: '/characters/create' as const, label: m.nav_create_character() },
      ] as const)

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
        <LocaleSwitcher />
        {onAuthScreen ? null : (
          <Link to="/login" className="btn btn-ghost">
            {m.nav_login()}
          </Link>
        )}
      </div>
    </aside>
  )
}
