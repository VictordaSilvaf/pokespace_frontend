import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { startTransition, useState } from 'react'
import { AuthFrame } from '#/components/auth/AuthFrame'
import { FormMessage, TextField } from '#/components/auth/TextField'
import { authApi } from '#/lib/api/auth'
import { isTwoFactorChallenge } from '#/lib/api/types'
import { getErrorMessage } from '#/lib/api/errors'
import { useAuth } from '#/lib/auth/auth-provider'
import { RequireGuest } from '#/lib/auth/gates'
import { loginSchema } from '#/lib/auth/schemas'
import { fieldError } from '#/lib/form/field-error'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  return (
    <RequireGuest>
      <LoginForm />
    </RequireGuest>
  )
}

function LoginForm() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: {
      identifier: '',
      password: '',
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        const result = await authApi.login({
          identifier: value.identifier.trim().toLowerCase(),
          password: value.password,
        })
        if (isTwoFactorChallenge(result)) {
          auth.beginTwoFactor(result.tempToken)
          startTransition(() => {
            void navigate({ to: '/two-factor' })
          })
          return
        }
        auth.signIn(result)
        startTransition(() => {
          void navigate({ to: '/base' })
        })
      } catch (cause) {
        setError(getErrorMessage(cause))
      }
    },
  })

  return (
    <AuthFrame title={m.login_title()} support={m.login_support()}>
      <form
        className="form-stack"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field name="identifier">
          {(field) => (
            <TextField
              name={field.name}
              label={m.login_identifier()}
              value={field.state.value}
              autoComplete="username"
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <TextField
              name={field.name}
              type="password"
              label={m.login_password()}
              value={field.state.value}
              autoComplete="current-password"
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <FormMessage tone="warn">{error}</FormMessage>
        <div className="form-actions">
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <button
                className="btn btn-signal"
                type="submit"
                disabled={isSubmitting}
              >
                {m.login_submit()}
              </button>
            )}
          </form.Subscribe>
          <Link to="/forgot-password">{m.login_forgot()}</Link>
        </div>
      </form>
      <p>
        {m.login_to_register()} <Link to="/register">{m.cta_register()}</Link>
      </p>
    </AuthFrame>
  )
}
