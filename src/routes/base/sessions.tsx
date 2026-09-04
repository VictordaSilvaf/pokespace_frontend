import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { startTransition, useState } from 'react'
import { FormMessage } from '#/components/auth/TextField'
import { authApi } from '#/lib/api/auth'
import { getErrorMessage } from '#/lib/api/errors'
import { useAuth } from '#/lib/auth/auth-provider'
import { authKeys } from '#/lib/auth/keys'
import { pillButton } from '#/lib/pill-button'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/base/sessions')({
  component: SessionsPage,
})

function SessionsPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const sessions = useQuery({
    queryKey: authKeys.sessions,
    queryFn: () => authApi.sessions(),
  })

  const revoke = useMutation({
    mutationFn: (sessionId: string) => authApi.revokeSession(sessionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.sessions })
    },
    onError: (cause) => setError(getErrorMessage(cause)),
  })

  const logoutAll = useMutation({
    mutationFn: () => authApi.logoutAll(),
    onSuccess: async () => {
      await auth.signOut()
      startTransition(() => {
        void navigate({ to: '/login' })
      })
    },
    onError: (cause) => setError(getErrorMessage(cause)),
  })

  const list = sessions.data?.sessions ?? []

  return (
    <section className="animate-rise-in grid max-w-[44rem] gap-3.5 px-6 pt-8 pb-14">
      <p className="text-[0.78rem] font-bold tracking-[0.12em] text-mute uppercase">
        {m.sessions_title()}
      </p>
      <h1 className="m-0 text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
        {m.sessions_title()}
      </h1>
      <p className="text-lg text-ink-soft">{m.sessions_support()}</p>

      {list.length === 0 ? <p>{m.sessions_empty()}</p> : null}

      <div>
        {list.map((session) => (
          <div
            className="grid grid-cols-[1fr_auto] gap-3.5 border-t border-line py-3.5"
            key={session.sessionId}
          >
            <div>
              <p>
                {session.current
                  ? m.sessions_current()
                  : session.userAgent || m.sessions_unknown()}
              </p>
              <p className="text-[0.78rem] font-bold tracking-[0.12em] text-mute uppercase">
                {session.ip ? `${session.ip} · ` : ''}
                {new Date(session.createdAt).toLocaleString()}
              </p>
            </div>
            {session.current ? null : (
              <button
                className={pillButton({ variant: 'ghost' })}
                type="button"
                disabled={revoke.isPending}
                onClick={() => revoke.mutate(session.sessionId)}
              >
                {m.sessions_revoke()}
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        className={pillButton({ variant: 'gold' })}
        type="button"
        disabled={logoutAll.isPending}
        onClick={() => logoutAll.mutate()}
      >
        {m.sessions_logout_all()}
      </button>
      <FormMessage tone="warn">{error}</FormMessage>
    </section>
  )
}
