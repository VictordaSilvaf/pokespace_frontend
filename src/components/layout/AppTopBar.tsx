import { Link, useRouterState } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { BrandMark } from '#/components/brand/BrandMark'
import LocaleSwitcher from '#/components/LocaleSwitcher'
import { useAuth } from '#/lib/auth/auth-provider'
import { isAuthMockEnabled } from '#/lib/auth/mock'
import { pillButton } from '#/lib/pill-button'
import { cn } from '#/lib/utils'
import { m } from '#/paraglide/messages'

function isActivePath(pathname: string, to: string) {
  if (to === '/characters') {
    return (
      pathname === '/characters' ||
      pathname === '/characters/' ||
      pathname.startsWith('/characters/')
    )
  }
  if (to === '/base') {
    if (pathname.startsWith('/base/account')) return false
    return (
      pathname === '/base' ||
      pathname === '/base/' ||
      pathname.startsWith('/base/')
    )
  }
  if (to === '/base/account') {
    return pathname === '/base/account' || pathname.startsWith('/base/account/')
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

export function isAuthPath(pathname: string) {
  return AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

type NavLink = {
  to: '/characters' | '/base/account' | '/base' | '/login' | '/register'
  label: () => string
}

export function AppTopBar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const auth = useAuth()
  const loggedIn = Boolean(auth.session)
  const onAuthScreen = isAuthPath(pathname)
  const [mobileOpen, setMobileOpen] = useState(false)

  const guestLinks: NavLink[] = [
    { to: '/login', label: () => m.nav_login() },
    { to: '/register', label: () => m.nav_register() },
  ]

  const hubLinks: NavLink[] = [
    { to: '/characters', label: () => m.nav_start_session() },
    { to: '/base/account', label: () => m.nav_my_account() },
    { to: '/base', label: () => m.nav_settings() },
  ]

  const links = onAuthScreen ? guestLinks : loggedIn ? hubLinks : guestLinks

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileOpen])

  const drawer =
    mobileOpen && typeof document !== 'undefined'
      ? createPortal(
          <div className="fixed inset-0 z-120 md:hidden" role="presentation">
            <button
              type="button"
              aria-label={m.nav_menu()}
              className="absolute inset-0 border-0 bg-black/55 backdrop-blur-[2px]"
              onClick={() => setMobileOpen(false)}
            />
            <aside
              role="dialog"
              aria-modal="true"
              aria-label={m.nav_menu()}
              className="absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col border-r border-line bg-[rgba(10,10,16,0.98)] shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
            >
              <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
                <BrandMark compact />
                <button
                  type="button"
                  aria-label={m.nav_menu()}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex size-9 cursor-pointer items-center justify-center rounded-xl text-ink-soft hover:bg-white/8 hover:text-ink"
                >
                  <X className="size-5" strokeWidth={1.75} />
                </button>
              </div>

              <nav className="grid gap-1 p-3" aria-label={m.app_brand()}>
                {links.map((link) => {
                  const active = isActivePath(pathname, link.to)
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'rounded-[10px] border-l-2 border-transparent px-3 py-3 text-sm font-semibold text-ink-soft hover:bg-white/4 hover:text-ink',
                        active && 'border-l-gold bg-gold/10 text-gold',
                      )}
                    >
                      {link.label()}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-auto grid gap-3 border-t border-line p-4">
                <LocaleSwitcher />
                {loggedIn && !onAuthScreen ? (
                  <button
                    type="button"
                    className={pillButton({ variant: 'ghost', size: 'sm' })}
                    onClick={() => {
                      setMobileOpen(false)
                      void auth.signOut()
                    }}
                  >
                    {m.nav_logout()}
                  </button>
                ) : null}
              </div>
            </aside>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-line bg-[rgba(10,10,16,0.92)] px-4 py-3 backdrop-blur-[10px]">
        <button
          type="button"
          className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-ink hover:bg-white/8 md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="app-mobile-nav"
          aria-label={m.nav_menu()}
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-5" strokeWidth={1.75} />
        </button>

        <BrandMark compact className="max-md:mx-auto" />

        <nav
          id="app-mobile-nav"
          className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex"
          aria-label={m.app_brand()}
        >
          {links.map((link) => {
            const active = isActivePath(pathname, link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'whitespace-nowrap rounded-[10px] border-b-2 border-transparent px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-white/4 hover:text-ink',
                  active && 'border-b-gold bg-gold/10 text-gold',
                )}
              >
                {link.label()}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
          {isAuthMockEnabled() ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/12 px-2.5 py-1 text-[0.72rem] font-bold tracking-wide text-gold uppercase">
              {m.mock_badge()}
            </span>
          ) : null}
          <LocaleSwitcher />
          {loggedIn && !onAuthScreen ? (
            <button
              type="button"
              className={pillButton({ variant: 'ghost', size: 'sm' })}
              onClick={() => void auth.signOut()}
            >
              {m.nav_logout()}
            </button>
          ) : null}
        </div>

        {/* Spacer to balance the hamburger so brand stays centered on mobile */}
        <span className="inline-flex size-10 shrink-0 md:hidden" aria-hidden />
      </header>

      {drawer}
    </>
  )
}

/** @deprecated Use AppTopBar — kept for existing imports. */
export const AppSidebar = AppTopBar
