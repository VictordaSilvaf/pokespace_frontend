import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { startTransition, useState } from 'react'
import { AuthFrame } from '#/components/auth/AuthFrame'
import { FormMessage, TextField } from '#/components/auth/TextField'
import { authApi } from '#/lib/api/auth'
import { getErrorMessage } from '#/lib/api/errors'
import { useAuth } from '#/lib/auth/auth-provider'
import { RequireGuest } from '#/lib/auth/gates'
import { registerSchema } from '#/lib/auth/schemas'
import { establishDevSessionFn } from '#/features/auth/session'
import { fieldError } from '#/lib/form/field-error'
import { pillButton } from '#/lib/pill-button'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/register')({ component: RegisterPage })

function RegisterPage() {
  return (
    <RequireGuest>
      <RegisterForm />
    </RequireGuest>
  )
}

function RegisterForm() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: {
      email: '',
      phone: '',
      username: '',
      password: '',
    },
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        const result = await authApi.register({
          email: value.email.trim().toLowerCase(),
          phone: value.phone.replace(/\D/g, ''),
          username: value.username.trim().toLowerCase(),
          password: value.password,
        })
        auth.signIn(result)
        await establishDevSessionFn({
          data: { id: result.userId, username: result.username },
        })
        startTransition(() => {
          void navigate({ to: '/characters' })
        })
      } catch (cause) {
        setError(getErrorMessage(cause))
      }
    },
  })

  return (
    <AuthFrame title={m.register_title()} support={m.register_support()}>
      <form
        className="grid gap-3.5"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field name="username">
          {(field) => (
            <TextField
              name={field.name}
              label={m.register_username()}
              hint={m.register_username_hint()}
              value={field.state.value}
              autoComplete="username"
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <TextField
              name={field.name}
              type="email"
              label={m.register_email()}
              value={field.state.value}
              autoComplete="email"
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field name="phone">
          {(field) => (
            <TextField
              name={field.name}
              type="tel"
              label={m.register_phone()}
              value={field.state.value}
              autoComplete="tel"
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
              label={m.register_password()}
              hint={m.register_password_hint()}
              value={field.state.value}
              autoComplete="new-password"
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <FormMessage tone="warn">{error}</FormMessage>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              className={pillButton({ variant: 'gold' })}
              type="submit"
              disabled={isSubmitting}
            >
              {m.register_submit()}
            </button>
          )}
        </form.Subscribe>
      </form>
      <p>
        {m.register_to_login()} <Link to="/login">{m.cta_enter()}</Link>
      </p>
    </AuthFrame>
  )
}
