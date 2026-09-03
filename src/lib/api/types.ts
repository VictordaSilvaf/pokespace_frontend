export interface AuthResult {
  userId: string
  email: string
  phone: string
  username: string
  accessToken: string
  refreshToken: string
  sessionId: string
  verifyToken?: string
}

export interface TwoFactorChallenge {
  requires2fa: true
  tempToken: string
}

export type LoginResult = AuthResult | TwoFactorChallenge

export interface UserProfile {
  userId: string
  email: string
  phone: string
  username: string
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
  status: 'active' | 'deactivated' | string
}

export interface MessageResult {
  message: string
}

export interface ForgotPasswordResult extends MessageResult {
  resetToken?: string
}

export interface VerifyEmailResult extends MessageResult {
  verifyToken?: string
}

export interface SendPhoneOtpResult extends MessageResult {
  otp?: string
}

export interface SetupTwoFactorResult {
  secret: string
  otpauthUri: string
}

export interface SessionInfo {
  sessionId: string
  familyId: string
  userAgent?: string
  ip?: string
  createdAt: string
  current: boolean
}

export interface SessionListResult {
  sessions: Array<SessionInfo>
}

export interface HealthResult {
  status: string
  service?: string
}

export interface RegisterInput {
  email: string
  phone: string
  username: string
  password: string
}

export interface LoginInput {
  identifier: string
  password: string
}

export interface UpdateProfileInput {
  email?: string
  phone?: string
}

export function isTwoFactorChallenge(
  result: LoginResult,
): result is TwoFactorChallenge {
  return 'requires2fa' in result && result.requires2fa
}
