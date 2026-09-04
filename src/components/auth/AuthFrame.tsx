import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { BrandMark } from '#/components/brand/BrandMark'
import { isAuthMockEnabled } from '#/lib/auth/mock'
import { m } from '#/paraglide/messages'

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
    <main className="auth-center">
      <section className="auth-card rise-in">
        <BrandMark compact />
        {isAuthMockEnabled() ? <span className="demo-chip">{m.mock_badge()}</span> : null}
        <div>
          <h1>{title}</h1>
          <p className="support">{support}</p>
        </div>
        {children}
        <p>
          <Link to="/">{m.cta_back_home()}</Link>
        </p>
      </section>
    </main>
  )
}
