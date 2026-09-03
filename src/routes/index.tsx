import { Link, createFileRoute } from '@tanstack/react-router'
import { isAuthMockEnabled } from '#/lib/auth/mock'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="hero-center rise-in">
      {isAuthMockEnabled() ? <span className="demo-chip">{m.mock_badge()}</span> : null}
      <h1 className="hero-title">
        {m.hero_line_before()}
        <span className="accent">{m.hero_line_accent_1()}</span>
        {m.hero_line_mid()}
        <span className="accent">{m.hero_line_accent_2()}</span>
        {m.hero_line_after()}
      </h1>
      <p className="hero-support">{m.hero_support()}</p>
      <div className="cta-row">
        <Link to="/register" className="btn btn-gold">
          {m.cta_start()}
        </Link>
        <Link to="/login" className="btn btn-ghost">
          {m.cta_enter()}
        </Link>
      </div>
      {isAuthMockEnabled() ? (
        <p className="support" style={{ color: 'var(--mute)', marginTop: '0.5rem' }}>
          {m.mock_hint()}
        </p>
      ) : null}
    </main>
  )
}
