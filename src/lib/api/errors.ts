import { m } from '#/paraglide/messages'

export class ApiError extends Error {
  readonly status: number
  readonly rawMessage: string

  constructor(status: number, rawMessage: string, displayMessage: string) {
    super(displayMessage)
    this.name = 'ApiError'
    this.status = status
    this.rawMessage = rawMessage
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return m.err_generic()
}

function firstMessage(body: unknown): string {
  if (!body || typeof body !== 'object') {
    return ''
  }

  const record = body as { message?: unknown }
  if (typeof record.message === 'string') {
    return record.message
  }

  if (Array.isArray(record.message) && record.message.length > 0) {
    return String(record.message[0])
  }

  return ''
}

export function translateApiMessage(raw: string): string {
  const value = raw.trim()

  if (!value) {
    return m.err_generic()
  }

  if (/Invalid credentials/i.test(value)) {
    return m.err_invalid_credentials()
  }
  if (/Username already taken/i.test(value)) {
    return m.err_username_taken()
  }
  if (/Maximum of 4 accounts/i.test(value)) {
    return m.err_account_limit()
  }
  if (/temporarily locked/i.test(value)) {
    return m.err_locked()
  }
  if (/Email address is not verified/i.test(value)) {
    return m.err_email_unverified()
  }
  if (/Invalid or expired reset token/i.test(value)) {
    return m.err_reset_token()
  }
  if (/Invalid or expired refresh token/i.test(value)) {
    return m.err_refresh()
  }
  if (/Invalid two-factor/i.test(value)) {
    return m.err_2fa()
  }
  if (/Invalid or expired verification code/i.test(value)) {
    return m.err_otp()
  }
  if (/Account is deactivated/i.test(value)) {
    return m.err_deactivated()
  }
  if (/Invalid phone number/i.test(value)) {
    return m.err_phone()
  }
  if (/Invalid email/i.test(value)) {
    return m.err_email()
  }
  if (/Username must be 3/i.test(value) || /Invalid username/i.test(value)) {
    return m.err_username()
  }
  if (
    /Password must be at least 8/i.test(value) ||
    /password must be longer/i.test(value)
  ) {
    return m.err_password()
  }
  if (/already enabled/i.test(value)) {
    return m.err_2fa_on()
  }
  if (/is not enabled/i.test(value)) {
    return m.err_2fa_off()
  }
  if (
    /Invalid or expired token/i.test(value) ||
    /Token has been revoked/i.test(value) ||
    /Missing or invalid authorization/i.test(value)
  ) {
    return m.err_session()
  }
  if (/Failed to fetch|NetworkError|ECONNREFUSED|fetch failed/i.test(value)) {
    return m.err_network()
  }

  return value
}

export function apiErrorFromResponse(status: number, body: unknown): ApiError {
  const raw = firstMessage(body) || `HTTP ${status}`
  return new ApiError(status, raw, translateApiMessage(raw))
}
