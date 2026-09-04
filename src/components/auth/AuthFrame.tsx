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
  support?: string
  children: ReactNode
}) {
  return (
    <main className="grid min-h-svh place-items-center px-4 pt-8 pb-12">
      <section className="animate-rise-in grid w-full max-w-md gap-4 rounded-[18px] border border-line bg-[rgba(16,16,24,0.92)] px-[1.4rem] py-8 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <BrandMark />
        {isAuthMockEnabled() ? (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gold/12 px-2.5 py-1 text-[0.72rem] font-bold tracking-wide text-gold uppercase">
            {m.mock_badge()}
          </span>
        ) : null}
        <div className="grid gap-2">
          <h1 className="m-0 text-[1.7rem] font-extrabold">{title}</h1>
          {support ? (
            <p className="m-0 text-[0.95rem] text-ink-soft">{support}</p>
          ) : null}
        </div>
        {children}
      </section>
    </main>
  )
}
