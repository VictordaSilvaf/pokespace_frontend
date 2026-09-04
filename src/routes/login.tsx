import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import LocaleSwitcher from '#/components/LocaleSwitcher'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
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
    <main className="page-wrap flex min-h-[100dvh] items-center py-10">
      <section className="island-shell rise-in mx-auto w-full max-w-md rounded-3xl px-6 py-8 sm:px-8">
        <div className="mb-6 flex justify-end">
          <LocaleSwitcher />
        </div>
        <p className="island-kicker">{m.app_brand()}</p>
        <h1 className="display-title mt-3 text-3xl text-[var(--sea-ink)]">
          {m.login_title()}
        </h1>
        <p className="mt-2 text-[var(--sea-ink-soft)]">{m.login_subtitle()}</p>
        <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">
          {m.login_dev_hint()}
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">{m.login_username_label()}</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          {error ? (
            <p className="text-sm font-medium text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {m.login_submit()}
          </Button>
        </form>
      </section>
    </main>
  )
}
