export interface StoredSession {
  userId: string
  email: string
  phone: string
  username: string
  accessToken: string
  refreshToken: string
  sessionId: string
}

const SESSION_KEY = 'pokespace.session'
const TEMP_TOKEN_KEY = 'pokespace.tempToken'

function canUseStorage(): boolean {
  return typeof window !== 'undefined'
}

export function loadSession(): StoredSession | null {
  if (!canUseStorage()) {
    return null
  }

  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as StoredSession
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.sessionId) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveSession(session: StoredSession): void {
  if (!canUseStorage()) {
    return
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  if (!canUseStorage()) {
    return
  }
  window.localStorage.removeItem(SESSION_KEY)
}

export function loadTempToken(): string | null {
  if (!canUseStorage()) {
    return null
  }
  return window.sessionStorage.getItem(TEMP_TOKEN_KEY)
}

export function saveTempToken(token: string): void {
  if (!canUseStorage()) {
    return
  }
  window.sessionStorage.setItem(TEMP_TOKEN_KEY, token)
}

export function clearTempToken(): void {
  if (!canUseStorage()) {
    return
  }
  window.sessionStorage.removeItem(TEMP_TOKEN_KEY)
}
