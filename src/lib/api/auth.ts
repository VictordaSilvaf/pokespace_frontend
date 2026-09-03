import { apiRequest, persistAuthResult } from '#/lib/api/client'
import type {
  AuthResult,
  ForgotPasswordResult,
  HealthResult,
  LoginInput,
  LoginResult,
  MessageResult,
  RegisterInput,
  SendPhoneOtpResult,
  SessionListResult,
  SetupTwoFactorResult,
  UpdateProfileInput,
  UserProfile,
  VerifyEmailResult,
} from '#/lib/api/types'
import { isAuthMockEnabled, mockAuthApi } from '#/lib/auth/mock'

const liveAuthApi = {
  health: () => apiRequest<HealthResult>('/health'),

  register: (input: RegisterInput) =>
    apiRequest<AuthResult>('/auth/register', { method: 'POST', body: input }),

  login: (input: LoginInput) =>
    apiRequest<LoginResult>('/auth/login', { method: 'POST', body: input }),

  forgotPassword: (username: string) =>
    apiRequest<ForgotPasswordResult>('/auth/forgot-password', {
      method: 'POST',
      body: { username },
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest<MessageResult>('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
    }),

  refresh: (refreshToken: string) =>
    apiRequest<AuthResult>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    }),

  verifyEmail: (token: string) =>
    apiRequest<VerifyEmailResult>('/auth/verify-email', {
      method: 'POST',
      body: { token },
    }),

  verifyTwoFactor: (tempToken: string, code: string) =>
    apiRequest<AuthResult>('/auth/2fa/verify', {
      method: 'POST',
      body: { tempToken, code },
    }),

  resendVerification: () =>
    apiRequest<VerifyEmailResult>('/auth/resend-verification', {
      method: 'POST',
      body: {},
      auth: true,
    }),

  sendPhoneOtp: () =>
    apiRequest<SendPhoneOtpResult>('/auth/send-phone-otp', {
      method: 'POST',
      body: {},
      auth: true,
    }),

  verifyPhone: (code: string) =>
    apiRequest<MessageResult>('/auth/verify-phone', {
      method: 'POST',
      body: { code },
      auth: true,
    }),

  setupTwoFactor: () =>
    apiRequest<SetupTwoFactorResult>('/auth/2fa/setup', {
      method: 'POST',
      body: {},
      auth: true,
    }),

  confirmTwoFactor: (code: string) =>
    apiRequest<MessageResult>('/auth/2fa/confirm', {
      method: 'POST',
      body: { code },
      auth: true,
    }),

  disableTwoFactor: (code: string) =>
    apiRequest<MessageResult>('/auth/2fa/disable', {
      method: 'POST',
      body: { code },
      auth: true,
    }),

  sessions: () => apiRequest<SessionListResult>('/auth/sessions', { auth: true }),

  revokeSession: (sessionId: string) =>
    apiRequest<null>(`/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      auth: true,
    }),

  logoutAll: () =>
    apiRequest<null>('/auth/logout-all', {
      method: 'POST',
      body: {},
      auth: true,
    }),

  me: () => apiRequest<UserProfile>('/auth/me', { auth: true }),

  updateMe: (input: UpdateProfileInput) =>
    apiRequest<UserProfile>('/auth/me', {
      method: 'PATCH',
      body: input,
      auth: true,
    }),

  deactivate: () =>
    apiRequest<MessageResult>('/auth/deactivate', {
      method: 'POST',
      body: {},
      auth: true,
    }),

  deleteAccount: (password: string) =>
    apiRequest<MessageResult>('/auth/account', {
      method: 'DELETE',
      body: { password },
      auth: true,
    }),

  logout: (refreshToken?: string, sessionId?: string) =>
    apiRequest<null>('/auth/logout', {
      method: 'POST',
      body: { refreshToken, sessionId },
      auth: true,
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<MessageResult>('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
      auth: true,
    }),
}

export const authApi = new Proxy(liveAuthApi, {
  get(target, prop, receiver) {
    const source = isAuthMockEnabled() ? mockAuthApi : target
    const value = Reflect.get(source, prop, receiver)
    return typeof value === 'function' ? value.bind(source) : value
  },
})

export { persistAuthResult, isAuthMockEnabled }
