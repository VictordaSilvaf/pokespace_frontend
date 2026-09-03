import { Link, createFileRoute } from '@tanstack/react-router'
import { BrandMark } from '#/components/brand/BrandMark'
import LocaleSwitcher from '#/components/LocaleSwitcher'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="auth-shell hero-copy">
      <div className="site-top rise-in">
        <span className="status-line">{m.brand_kicker()}</span>
        <LocaleSwitcher />
      </div>
      <div className="rise-in-slow">
        <BrandMark />
        <h1 className="mt-6 max-w-xl text-3xl font-semibold sm:text-4xl">
          {m.hero_line()}
        </h1>
        <p className="mt-4 max-w-md text-lg text-[var(--ink-soft)]">
          {m.hero_support()}
        </p>
        <div className="form-actions mt-8">
          <Link to="/login" className="btn btn-signal">
            {m.cta_enter()}
          </Link>
          <Link to="/register" className="btn btn-ghost">
            {m.cta_register()}
          </Link>
        </div>
      </div>
    </main>
  )
}
