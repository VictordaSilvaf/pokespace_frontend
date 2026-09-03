import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { startTransition, useState } from 'react'
import { FormMessage } from '#/components/auth/TextField'
import { authApi } from '#/lib/api/auth'
import { getErrorMessage } from '#/lib/api/errors'
import { useAuth } from '#/lib/auth/auth-provider'
import { authKeys } from '#/lib/auth/keys'
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
    <section className="section-block rise-in">
      <p className="status-line">{m.sessions_title()}</p>
      <h1 className="display-title text-4xl sm:text-5xl">
        {m.sessions_title()}
      </h1>
      <p className="text-lg text-[var(--ink-soft)]">{m.sessions_support()}</p>

      {list.length === 0 ? <p>{m.sessions_empty()}</p> : null}

      <div>
        {list.map((session) => (
          <div className="session-row" key={session.sessionId}>
            <div>
              <p>
                {session.current
                  ? m.sessions_current()
                  : session.userAgent || m.sessions_unknown()}
              </p>
              <p className="status-line">
                {session.ip ? `${session.ip} · ` : ''}
                {new Date(session.createdAt).toLocaleString()}
              </p>
            </div>
            {session.current ? null : (
              <button
                className="btn btn-ghost"
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
        className="btn btn-signal"
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
