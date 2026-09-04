import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { startTransition, useState } from 'react'
import { AuthFrame } from '#/components/auth/AuthFrame'
import { FormMessage, TextField } from '#/components/auth/TextField'
import { authApi } from '#/lib/api/auth'
import { getErrorMessage } from '#/lib/api/errors'
import { useAuth } from '#/lib/auth/auth-provider'
import { BootScreen } from '#/lib/auth/gates'
import { twoFactorSchema } from '#/lib/auth/schemas'
import { establishDevSessionFn } from '#/features/auth/session'
import { fieldError } from '#/lib/form/field-error'
import { pillButton } from '#/lib/pill-button'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/two-factor')({
  component: TwoFactorPage,
})

function TwoFactorPage() {
  const auth = useAuth()

  if (!auth.ready) {
    return <BootScreen />
  }

  if (auth.session) {
    return <Navigate to="/base" />
  }

  if (!auth.tempToken) {
    return <Navigate to="/login" />
  }

  return <TwoFactorForm tempToken={auth.tempToken} />
}

function TwoFactorForm({ tempToken }: { tempToken: string }) {
  const auth = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: { code: '' },
    validators: { onSubmit: twoFactorSchema },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        const result = await authApi.verifyTwoFactor(
          tempToken,
          value.code.trim(),
        )
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
    <AuthFrame title={m.two_factor_title()} support={m.two_factor_support()}>
      <form
        className="grid gap-3.5"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field name="code">
          {(field) => (
            <TextField
              name={field.name}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              label={m.two_factor_code()}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) =>
                field.handleChange(event.target.value.replace(/\D/g, ''))
              }
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
              {m.two_factor_submit()}
            </button>
          )}
        </form.Subscribe>
      </form>
    </AuthFrame>
  )
}
