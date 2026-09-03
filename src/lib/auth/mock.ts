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

export function isAuthMockEnabled(): boolean {
  const flag = import.meta.env.VITE_AUTH_MOCK
  return flag === 'true' || flag === '1'
}

function mockId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function createMockAuthResult(
  overrides: Partial<AuthResult> = {},
): AuthResult {
  const username =
    overrides.username ??
    (typeof overrides.email === 'string'
      ? overrides.email.split('@')[0]?.replace(/[^a-z0-9_]/gi, '_').slice(0, 20)
      : 'demo_trainer')

  return {
    userId: overrides.userId ?? 'mock-user-id',
    email: overrides.email ?? 'demo@poke.space',
    phone: overrides.phone ?? '11999998888',
    username: username || 'demo_trainer',
    accessToken: overrides.accessToken ?? `mock-access-${mockId('tok')}`,
    refreshToken: overrides.refreshToken ?? `mock-refresh-${mockId('tok')}`,
    sessionId: overrides.sessionId ?? mockId('session'),
    verifyToken: overrides.verifyToken,
  }
}

let mockProfile: UserProfile = {
  userId: 'mock-user-id',
  email: 'demo@poke.space',
  phone: '11999998888',
  username: 'demo_trainer',
  emailVerified: true,
  phoneVerified: false,
  twoFactorEnabled: false,
  status: 'active',
}

let mockSessions: SessionListResult = {
  sessions: [
    {
      sessionId: 'mock-session-current',
      familyId: 'mock-family',
      userAgent: 'Pokespace Demo Browser',
      ip: '127.0.0.1',
      createdAt: new Date().toISOString(),
      current: true,
    },
  ],
}

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms)
  })
}

export const mockAuthApi = {
  health: () =>
    delay<HealthResult>({ status: 'ok', service: 'pokespace-mock' }),

  register: (input: RegisterInput) => {
    const result = createMockAuthResult({
      email: input.email,
      phone: input.phone,
      username: input.username,
      verifyToken: 'mock-verify-token',
    })
    mockProfile = {
      userId: result.userId,
      email: result.email,
      phone: result.phone,
      username: result.username,
      emailVerified: false,
      phoneVerified: false,
      twoFactorEnabled: false,
      status: 'active',
    }
    mockSessions = {
      sessions: [
        {
          sessionId: result.sessionId,
          familyId: 'mock-family',
          userAgent: 'Pokespace Demo Browser',
          ip: '127.0.0.1',
          createdAt: new Date().toISOString(),
          current: true,
        },
      ],
    }
    return delay(result)
  },

  login: (input: LoginInput) => {
    const identifier = input.identifier.trim().toLowerCase()
    const result = createMockAuthResult({
      email: identifier.includes('@') ? identifier : `${identifier}@poke.space`,
      username: identifier.includes('@')
        ? identifier.split('@')[0] || 'demo_trainer'
        : identifier,
    })
    mockProfile = {
      ...mockProfile,
      userId: result.userId,
      email: result.email,
      username: result.username,
      emailVerified: true,
      status: 'active',
    }
    mockSessions = {
      sessions: [
        {
          sessionId: result.sessionId,
          familyId: 'mock-family',
          userAgent: 'Pokespace Demo Browser',
          ip: '127.0.0.1',
          createdAt: new Date().toISOString(),
          current: true,
        },
      ],
    }
    return delay<LoginResult>(result)
  },

  forgotPassword: (_username: string) =>
    delay<ForgotPasswordResult>({
      message: 'If the account exists, a recovery signal was sent',
      resetToken: 'mock-reset-token',
    }),

  resetPassword: (_token: string, _newPassword: string) =>
    delay<MessageResult>({ message: 'Password updated' }),

  refresh: (_refreshToken: string) => delay(createMockAuthResult(mockProfile)),

  verifyEmail: (_token: string) => {
    mockProfile = { ...mockProfile, emailVerified: true }
    return delay<VerifyEmailResult>({ message: 'Email verified' })
  },

  verifyTwoFactor: (_tempToken: string, _code: string) =>
    delay(createMockAuthResult(mockProfile)),

  resendVerification: () =>
    delay<VerifyEmailResult>({
      message: 'Verification email sent',
      verifyToken: 'mock-verify-token',
    }),

  sendPhoneOtp: () =>
    delay<SendPhoneOtpResult>({
      message: 'Verification code sent',
      otp: '123456',
    }),

  verifyPhone: (_code: string) => {
    mockProfile = { ...mockProfile, phoneVerified: true }
    return delay<MessageResult>({ message: 'Phone verified' })
  },

  setupTwoFactor: () =>
    delay<SetupTwoFactorResult>({
      secret: 'MOCK2FASECRETBASE32',
      otpauthUri:
        'otpauth://totp/PokeSpace:demo_trainer?secret=MOCK2FASECRETBASE32&issuer=PokeSpace',
    }),

  confirmTwoFactor: (_code: string) => {
    mockProfile = { ...mockProfile, twoFactorEnabled: true }
    return delay<MessageResult>({ message: 'Two-factor authentication enabled' })
  },

  disableTwoFactor: (_code: string) => {
    mockProfile = { ...mockProfile, twoFactorEnabled: false }
    return delay<MessageResult>({ message: 'Two-factor authentication disabled' })
  },

  sessions: () => delay(mockSessions),

  revokeSession: (sessionId: string) => {
    mockSessions = {
      sessions: mockSessions.sessions.filter((s) => s.sessionId !== sessionId),
    }
    return delay(null)
  },

  logoutAll: () => {
    mockSessions = { sessions: [] }
    return delay(null)
  },

  me: () => delay({ ...mockProfile }),

  updateMe: (input: UpdateProfileInput) => {
    mockProfile = {
      ...mockProfile,
      email: input.email ?? mockProfile.email,
      phone: input.phone ?? mockProfile.phone,
      emailVerified: input.email ? false : mockProfile.emailVerified,
      phoneVerified: input.phone ? false : mockProfile.phoneVerified,
    }
    return delay({ ...mockProfile })
  },

  deactivate: () => {
    mockProfile = { ...mockProfile, status: 'deactivated' }
    return delay<MessageResult>({ message: 'Account deactivated' })
  },

  deleteAccount: (_password: string) =>
    delay<MessageResult>({ message: 'Account deleted' }),

  logout: (_refreshToken?: string, _sessionId?: string) => delay(null),

  changePassword: (_currentPassword: string, _newPassword: string) =>
    delay<MessageResult>({ message: 'Password changed' }),
}
