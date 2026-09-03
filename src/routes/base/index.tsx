import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '#/lib/api/auth'
import { authKeys } from '#/lib/auth/keys'
import { getApiHealth } from '#/lib/server/health'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/base/')({ component: BaseHome })

function BaseHome() {
  const me = useQuery({
    queryKey: authKeys.me,
    queryFn: () => authApi.me(),
  })

  const health = useQuery({
    queryKey: authKeys.health,
    queryFn: () => getApiHealth(),
  })

  const username = me.data?.username ?? 'treinador'

  return (
    <section className="section-block rise-in">
      <p className="status-line">
        {m.base_title()}
        {health.data?.status === 'ok' ? ' · online' : ''}
      </p>
      <h1 className="display-title text-4xl sm:text-6xl">
        {m.base_hello({ username })}
      </h1>
      <p className="text-lg text-[var(--ink-soft)]">{m.base_support()}</p>
      <p>{m.base_energy()}</p>
      {me.data && !me.data.emailVerified ? (
        <p className="warn">
          {m.base_verify_email()}{' '}
          <Link to="/verify-email">{m.base_verify_email_cta()}</Link>
        </p>
      ) : null}
      {me.data && !me.data.phoneVerified ? (
        <p>
          {m.base_verify_phone()}{' '}
          <Link to="/base/account">{m.base_verify_phone_cta()}</Link>
        </p>
      ) : null}
    </section>
  )
}
