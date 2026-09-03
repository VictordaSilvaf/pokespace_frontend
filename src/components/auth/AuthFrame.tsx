import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { m } from '#/paraglide/messages'
import { BrandMark } from '#/components/brand/BrandMark'
import LocaleSwitcher from '#/components/LocaleSwitcher'

export function AuthFrame({
  title,
  support,
  children,
}: {
  title: string
  support: string
  children: ReactNode
}) {
  return (
    <main className="auth-shell">
      <div className="site-top">
        <BrandMark compact />
        <LocaleSwitcher />
      </div>
      <section className="auth-panel rise-in">
        <div>
          <h1 className="display-title text-4xl sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-sm text-lg text-[var(--ink-soft)]">
            {support}
          </p>
        </div>
        {children}
        <p>
          <Link to="/">{m.cta_back_home()}</Link>
        </p>
      </section>
    </main>
  )
}
