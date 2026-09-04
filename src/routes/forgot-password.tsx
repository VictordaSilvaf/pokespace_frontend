import { Link, createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { AuthFrame } from '#/components/auth/AuthFrame'
import { FormMessage, TextField } from '#/components/auth/TextField'
import { authApi } from '#/lib/api/auth'
import { getErrorMessage } from '#/lib/api/errors'
import { RequireGuest } from '#/lib/auth/gates'
import { forgotPasswordSchema } from '#/lib/auth/schemas'
import { fieldError } from '#/lib/form/field-error'
import { pillButton } from '#/lib/pill-button'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  return (
    <RequireGuest>
      <ForgotPasswordForm />
    </RequireGuest>
  )
}

function ForgotPasswordForm() {
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const [devToken, setDevToken] = useState('')

  const form = useForm({
    defaultValues: { username: '' },
    validators: { onSubmit: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      setError('')
      setDone('')
      setDevToken('')
      try {
        const result = await authApi.forgotPassword(
          value.username.trim().toLowerCase(),
        )
        setDone(m.forgot_done())
        if (result.resetToken) {
          setDevToken(result.resetToken)
        }
      } catch (cause) {
        setError(getErrorMessage(cause))
      }
    },
  })

  return (
    <AuthFrame title={m.forgot_title()} support={m.forgot_support()}>
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
              label={m.forgot_username()}
              value={field.state.value}
              autoComplete="username"
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <FormMessage tone="warn">{error}</FormMessage>
        <FormMessage>{done}</FormMessage>
        {devToken ? (
          <p className="font-mono text-[0.85rem] text-ink-soft break-all">
            {m.forgot_token_dev()}: {devToken}
          </p>
        ) : null}
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              className={pillButton({ variant: 'gold' })}
              type="submit"
              disabled={isSubmitting}
            >
              {m.forgot_submit()}
            </button>
          )}
        </form.Subscribe>
      </form>
      <p>
        <Link
          to="/reset-password"
          search={devToken ? { token: devToken } : undefined}
        >
          {m.forgot_to_reset()}
        </Link>
      </p>
    </AuthFrame>
  )
}
