import type { ReactNode } from 'react'

import { BrandMark } from '#/components/brand/BrandMark'

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
        <div>
          <h1>{title}</h1>
          <p className="support">{support}</p>
        </div>
        {children}
      </section>
    </main>
  )
}
