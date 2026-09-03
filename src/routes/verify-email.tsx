import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { AuthFrame } from '#/components/auth/AuthFrame'
import { FormMessage, TextField } from '#/components/auth/TextField'
import { authApi } from '#/lib/api/auth'
import { getErrorMessage } from '#/lib/api/errors'
import { verifyEmailSchema } from '#/lib/auth/schemas'
import { fieldError } from '#/lib/form/field-error'
import { m } from '#/paraglide/messages'

type VerifySearch = {
  token?: string
}

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>): VerifySearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { token } = Route.useSearch()
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  const form = useForm({
    defaultValues: { token: token ?? '' },
    validators: { onSubmit: verifyEmailSchema },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await authApi.verifyEmail(value.token.trim())
        setDone(m.verify_done())
      } catch (cause) {
        setError(getErrorMessage(cause))
      }
    },
  })

  return (
    <AuthFrame title={m.verify_title()} support={m.verify_support()}>
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
              label={m.verify_token()}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <FormMessage tone="warn">{error}</FormMessage>
        <FormMessage>{done}</FormMessage>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              className="btn btn-signal"
              type="submit"
              disabled={isSubmitting}
            >
              {m.verify_submit()}
            </button>
          )}
        </form.Subscribe>
      </form>
    </AuthFrame>
  )
}
