import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '#/lib/api/auth'
import { authKeys } from '#/lib/auth/keys'
import { isAuthMockEnabled } from '#/lib/auth/mock'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/base/')({ component: BaseHome })

function BaseHome() {
  const me = useQuery({
    queryKey: authKeys.me,
    queryFn: () => authApi.me(),
  })

  const health = useQuery({
    queryKey: authKeys.health,
    queryFn: () => authApi.health(),
  })

  const username = me.data?.username ?? 'treinador'

  return (
    <section className="animate-rise-in grid max-w-[44rem] gap-3.5 px-6 pt-8 pb-14">
      <p className="text-[0.78rem] font-bold tracking-[0.12em] text-mute uppercase">
        {m.base_title()}
        {health.data?.status === 'ok' ? ' · online' : ''}
        {isAuthMockEnabled() ? ` · ${m.mock_badge()}` : ''}
      </p>
      <h1 className="m-0 text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold tracking-[-0.03em]">
        {m.base_hello({ username })}
      </h1>
      <p className="text-[1.05rem] text-ink-soft">{m.base_support()}</p>
      <p>{m.base_energy()}</p>
      {me.data && !me.data.emailVerified ? (
        <p className="font-semibold text-[#ff8d8d]">
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
