import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { FormMessage, TextField } from '#/components/auth/TextField'
import { authApi } from '#/lib/api/auth'
import { getErrorMessage } from '#/lib/api/errors'
import { authKeys } from '#/lib/auth/keys'
import { updateProfileSchema, verifyPhoneSchema } from '#/lib/auth/schemas'
import { fieldError } from '#/lib/form/field-error'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/base/account')({
  component: AccountPage,
})

function AccountPage() {
  const queryClient = useQueryClient()
  const me = useQuery({
    queryKey: authKeys.me,
    queryFn: () => authApi.me(),
  })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [otpDev, setOtpDev] = useState('')

  const phoneForm = useForm({
    defaultValues: { code: '' },
    validators: { onSubmit: verifyPhoneSchema },
    onSubmit: async ({ value }) => {
      setError('')
      setNotice('')
      try {
        await authApi.verifyPhone(value.code)
        await queryClient.invalidateQueries({ queryKey: authKeys.me })
        setNotice(m.phone_verified())
      } catch (cause) {
        setError(getErrorMessage(cause))
      }
    },
  })

  const resend = useMutation({
    mutationFn: () => authApi.resendVerification(),
    onSuccess: (result) => {
      setNotice(
        result.verifyToken
          ? `${m.account_resend_done()} ${result.verifyToken}`
          : m.account_resend_done(),
      )
    },
    onError: (cause) => setError(getErrorMessage(cause)),
  })

  const sendOtp = useMutation({
    mutationFn: () => authApi.sendPhoneOtp(),
    onSuccess: (result) => {
      setNotice(m.phone_sent())
      setOtpDev(result.otp ?? '')
    },
    onError: (cause) => setError(getErrorMessage(cause)),
  })

  return (
    <section className="section-block rise-in">
      <p className="status-line">{m.account_title()}</p>
      <h1 className="display-title text-4xl sm:text-5xl">
        {m.account_title()}
      </h1>
      <p className="text-lg text-[var(--ink-soft)]">{m.account_support()}</p>
      {me.data ? (
        <p>
          {m.account_username()}: {me.data.username}
          <br />
          {m.account_status()}:{' '}
          {me.data.status === 'active'
            ? m.status_active()
            : m.status_deactivated()}
          <br />
          {me.data.emailVerified
            ? m.account_email_verified()
            : m.account_email_pending()}
          {' · '}
          {me.data.phoneVerified
            ? m.account_phone_verified()
            : m.account_phone_pending()}
          {' · '}
          {me.data.twoFactorEnabled ? m.account_2fa_on() : m.account_2fa_off()}
        </p>
      ) : null}

      {me.data ? (
        <ContactForm
          email={me.data.email}
          phone={me.data.phone}
          onError={setError}
          onNotice={setNotice}
        />
      ) : null}

      <div className="form-actions">
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => resend.mutate()}
          disabled={resend.isPending}
        >
          {m.account_resend()}
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => sendOtp.mutate()}
          disabled={sendOtp.isPending}
        >
          {m.phone_send()}
        </button>
      </div>

      {otpDev ? (
        <p className="secret-key">
          {m.phone_otp_dev()}: {otpDev}
        </p>
      ) : null}

      <form
        className="form-stack"
        onSubmit={(event) => {
          event.preventDefault()
          void phoneForm.handleSubmit()
        }}
      >
        <phoneForm.Field name="code">
          {(field) => (
            <TextField
              name={field.name}
              inputMode="numeric"
              maxLength={6}
              label={m.phone_code()}
              value={field.state.value}
              onChange={(event) =>
                field.handleChange(event.target.value.replace(/\D/g, ''))
              }
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </phoneForm.Field>
        <phoneForm.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              className="btn btn-gold"
              type="submit"
              disabled={isSubmitting}
            >
              {m.phone_verify()}
            </button>
          )}
        </phoneForm.Subscribe>
      </form>

      <FormMessage tone="warn">{error}</FormMessage>
      <FormMessage>{notice}</FormMessage>
    </section>
  )
}

function ContactForm({
  email,
  phone,
  onError,
  onNotice,
}: {
  email: string
  phone: string
  onError: (message: string) => void
  onNotice: (message: string) => void
}) {
  const queryClient = useQueryClient()
  const form = useForm({
    defaultValues: { email, phone },
    validators: { onSubmit: updateProfileSchema },
    onSubmit: async ({ value }) => {
      onError('')
      onNotice('')
      try {
        const nextEmail = value.email.trim().toLowerCase()
        const nextPhone = value.phone.replace(/\D/g, '')
        await authApi.updateMe({
          email: nextEmail || undefined,
          phone: nextPhone || undefined,
        })
        await queryClient.invalidateQueries({ queryKey: authKeys.me })
        onNotice(m.account_saved())
      } catch (cause) {
        onError(getErrorMessage(cause))
      }
    },
  })

  return (
    <form
      className="form-stack"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="email">
        {(field) => (
          <TextField
            name={field.name}
            type="email"
            label={m.register_email()}
            value={field.state.value}
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
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            error={fieldError(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <button
            className="btn btn-gold"
            type="submit"
            disabled={isSubmitting}
          >
            {m.account_save()}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
