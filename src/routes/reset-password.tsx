import { Link, createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { AuthFrame } from '#/components/auth/AuthFrame'
import { FormMessage, TextField } from '#/components/auth/TextField'
import { authApi } from '#/lib/api/auth'
import { getErrorMessage } from '#/lib/api/errors'
import { resetPasswordSchema } from '#/lib/auth/schemas'
import { fieldError } from '#/lib/form/field-error'
import { m } from '#/paraglide/messages'

type ResetSearch = {
  token?: string
}

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>): ResetSearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token } = Route.useSearch()
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const form = useForm({
    defaultValues: {
      token: token ?? '',
      newPassword: '',
    },
    validators: { onSubmit: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await authApi.resetPassword(value.token.trim(), value.newPassword)
        setDone(true)
      } catch (cause) {
        setError(getErrorMessage(cause))
      }
    },
  })

  return (
    <AuthFrame title={m.reset_title()} support={m.reset_support()}>
      {done ? (
        <div className="form-stack">
          <FormMessage>{m.reset_done()}</FormMessage>
          <Link to="/login" className="btn btn-signal">
            {m.cta_enter()}
          </Link>
        </div>
      ) : (
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field name="token">
            {(field) => (
              <TextField
                name={field.name}
                label={m.reset_token()}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                error={fieldError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field name="newPassword">
            {(field) => (
              <TextField
                name={field.name}
                type="password"
                label={m.reset_password()}
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
                className="btn btn-signal"
                type="submit"
                disabled={isSubmitting}
              >
                {m.reset_submit()}
              </button>
            )}
          </form.Subscribe>
        </form>
      )}
    </AuthFrame>
  )
}
