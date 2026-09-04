import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { AuthFrame } from '#/components/auth/AuthFrame'
import {
  establishDevSessionFn,
  getSessionFn,
} from '#/features/auth/session'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    if (session) {
      throw redirect({ to: '/characters' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('trainer')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      await establishDevSessionFn({
        data: { username: username.trim() || 'trainer' },
      })
      await navigate({ to: '/characters' })
    } catch {
      setError(m.character_error_generic())
      setPending(false)
    }
  }

  return (
    <AuthFrame title={m.login_title()} support={m.login_subtitle()}>
      <p className="field-hint">{m.login_dev_hint()}</p>
      <form className="form-stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="username">{m.login_username_label()}</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        {error ? (
          <p className="field-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="form-actions">
          <button className="btn btn-gold btn-block" type="submit" disabled={pending}>
            {m.login_submit()}
          </button>
        </div>
      </form>
    </AuthFrame>
  )
}
