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
import { pillButton } from '#/lib/pill-button'
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
    <section className="animate-rise-in grid max-w-[44rem] gap-3.5 px-6 pt-8 pb-14">
      <p className="text-[0.78rem] font-bold tracking-[0.12em] text-mute uppercase">
        {m.security_title()}
      </p>
      <h1 className="m-0 text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
        {m.security_title()}
      </h1>
      <p className="text-lg text-ink-soft">{m.security_support()}</p>

      <h2 className="m-0 text-2xl font-extrabold tracking-[-0.03em]">
        {m.password_title()}
      </h2>
      <form
        className="grid gap-3.5"
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
              className={pillButton({ variant: 'gold' })}
              type="submit"
              disabled={isSubmitting}
            >
              {m.password_submit()}
            </button>
          )}
        </passwordForm.Subscribe>
      </form>

      <h2 className="m-0 text-2xl font-extrabold tracking-[-0.03em]">
        {m.twofa_title()}
      </h2>
      {me.data?.twoFactorEnabled ? (
        <form
          className="grid gap-3.5"
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
                className={pillButton({ variant: 'ghost' })}
                type="submit"
                disabled={isSubmitting}
              >
                {m.twofa_disable()}
              </button>
            )}
          </disableForm.Subscribe>
        </form>
      ) : (
        <div className="grid gap-3.5">
          <button
            className={pillButton({ variant: 'ghost' })}
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
              <p className="font-mono text-[0.85rem] text-ink-soft break-all">
                {m.twofa_secret()}: {setup.secret}
              </p>
              <form
                className="grid gap-3.5"
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
                      className={pillButton({ variant: 'gold' })}
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

      <h2 className="m-0 text-2xl font-extrabold tracking-[-0.03em]">
        {m.danger_title()}
      </h2>
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          className={pillButton({ variant: 'ghost' })}
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
        className="grid gap-3.5"
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
              className={pillButton({ variant: 'gold' })}
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
