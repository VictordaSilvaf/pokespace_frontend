import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { startTransition, useState } from 'react'
import { TotpQr } from '#/components/auth/TotpQr'
import { FormMessage, TextField } from '#/components/auth/TextField'
import { authApi } from '#/lib/api/auth'
import type { SetupTwoFactorResult } from '#/lib/api/types'
import { getErrorMessage } from '#/lib/api/errors'
import { useAuth } from '#/lib/auth/auth-provider'
import { authKeys } from '#/lib/auth/keys'
import {
  changePasswordSchema,
  deleteAccountSchema,
  twoFactorSchema,
} from '#/lib/auth/schemas'
import { fieldError } from '#/lib/form/field-error'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/base/security')({
  component: SecurityPage,
})

function SecurityPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const me = useQuery({
    queryKey: authKeys.me,
    queryFn: () => authApi.me(),
  })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [setup, setSetup] = useState<SetupTwoFactorResult | null>(null)

  const passwordForm = useForm({
    defaultValues: { currentPassword: '', newPassword: '' },
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await authApi.changePassword(value.currentPassword, value.newPassword)
        await auth.signOut()
        startTransition(() => {
          void navigate({ to: '/login' })
        })
      } catch (cause) {
        setError(getErrorMessage(cause))
      }
    },
  })

  const confirmForm = useForm({
    defaultValues: { code: '' },
    validators: { onSubmit: twoFactorSchema },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await authApi.confirmTwoFactor(value.code)
        setSetup(null)
        setNotice(m.twofa_enabled())
        await queryClient.invalidateQueries({ queryKey: authKeys.me })
      } catch (cause) {
        setError(getErrorMessage(cause))
      }
    },
  })

  const disableForm = useForm({
    defaultValues: { code: '' },
    validators: { onSubmit: twoFactorSchema },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await authApi.disableTwoFactor(value.code)
        setNotice(m.twofa_disabled())
        await queryClient.invalidateQueries({ queryKey: authKeys.me })
      } catch (cause) {
        setError(getErrorMessage(cause))
      }
    },
  })

  const deleteForm = useForm({
    defaultValues: { password: '' },
    validators: { onSubmit: deleteAccountSchema },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await authApi.deleteAccount(value.password)
        await auth.signOut()
        startTransition(() => {
          void navigate({ to: '/' })
        })
      } catch (cause) {
        setError(getErrorMessage(cause))
      }
    },
  })

  return (
    <section className="section-block rise-in">
      <p className="status-line">{m.security_title()}</p>
      <h1 className="display-title text-4xl sm:text-5xl">
        {m.security_title()}
      </h1>
      <p className="text-lg text-[var(--ink-soft)]">{m.security_support()}</p>

      <h2 className="display-title text-2xl">{m.password_title()}</h2>
      <form
        className="form-stack"
        onSubmit={(event) => {
          event.preventDefault()
          void passwordForm.handleSubmit()
        }}
      >
        <passwordForm.Field name="currentPassword">
          {(field) => (
            <TextField
              name={field.name}
              type="password"
              label={m.password_current()}
              value={field.state.value}
              autoComplete="current-password"
              onChange={(event) => field.handleChange(event.target.value)}
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </passwordForm.Field>
        <passwordForm.Field name="newPassword">
          {(field) => (
            <TextField
              name={field.name}
              type="password"
              label={m.password_new()}
              value={field.state.value}
              autoComplete="new-password"
              onChange={(event) => field.handleChange(event.target.value)}
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </passwordForm.Field>
        <passwordForm.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              className="btn btn-gold"
              type="submit"
              disabled={isSubmitting}
            >
              {m.password_submit()}
            </button>
          )}
        </passwordForm.Subscribe>
      </form>

      <h2 className="display-title text-2xl">{m.twofa_title()}</h2>
      {me.data?.twoFactorEnabled ? (
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault()
            void disableForm.handleSubmit()
          }}
        >
          <disableForm.Field name="code">
            {(field) => (
              <TextField
                name={field.name}
                inputMode="numeric"
                maxLength={6}
                label={m.two_factor_code()}
                value={field.state.value}
                onChange={(event) =>
                  field.handleChange(event.target.value.replace(/\D/g, ''))
                }
                error={fieldError(field.state.meta.errors)}
              />
            )}
          </disableForm.Field>
          <disableForm.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <button
                className="btn btn-ghost"
                type="submit"
                disabled={isSubmitting}
              >
                {m.twofa_disable()}
              </button>
            )}
          </disableForm.Subscribe>
        </form>
      ) : (
        <div className="form-stack">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={async () => {
              setError('')
              try {
                setSetup(await authApi.setupTwoFactor())
              } catch (cause) {
                setError(getErrorMessage(cause))
              }
            }}
          >
            {m.twofa_setup()}
          </button>
          {setup ? (
            <>
              <p>{m.twofa_scan()}</p>
              <TotpQr value={setup.otpauthUri} />
              <p className="secret-key">
                {m.twofa_secret()}: {setup.secret}
              </p>
              <form
                className="form-stack"
                onSubmit={(event) => {
                  event.preventDefault()
                  void confirmForm.handleSubmit()
                }}
              >
                <confirmForm.Field name="code">
                  {(field) => (
                    <TextField
                      name={field.name}
                      inputMode="numeric"
                      maxLength={6}
                      label={m.two_factor_code()}
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value.replace(/\D/g, ''),
                        )
                      }
                      error={fieldError(field.state.meta.errors)}
                    />
                  )}
                </confirmForm.Field>
                <confirmForm.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <button
                      className="btn btn-gold"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {m.twofa_confirm()}
                    </button>
                  )}
                </confirmForm.Subscribe>
              </form>
            </>
          ) : null}
        </div>
      )}

      <h2 className="display-title text-2xl">{m.danger_title()}</h2>
      <div className="form-actions">
        <button
          className="btn btn-ghost"
          type="button"
          onClick={async () => {
            setError('')
            try {
              await authApi.deactivate()
              await auth.signOut()
              startTransition(() => {
                void navigate({ to: '/login' })
              })
            } catch (cause) {
              setError(getErrorMessage(cause))
            }
          }}
        >
          {m.deactivate()}
        </button>
      </div>
      <form
        className="form-stack"
        onSubmit={(event) => {
          event.preventDefault()
          void deleteForm.handleSubmit()
        }}
      >
        <deleteForm.Field name="password">
          {(field) => (
            <TextField
              name={field.name}
              type="password"
              label={m.delete_password()}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </deleteForm.Field>
        <deleteForm.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              className="btn btn-gold"
              type="submit"
              disabled={isSubmitting}
            >
              {m.delete_account()}
            </button>
          )}
        </deleteForm.Subscribe>
      </form>

      <FormMessage tone="warn">{error}</FormMessage>
      <FormMessage>{notice}</FormMessage>
    </section>
  )
}
