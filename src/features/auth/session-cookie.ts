import { getCookie, setCookie } from '@tanstack/react-start/server'

const SESSION_COOKIE = 'pokespace_session'

export type SessionUser = {
  id: string
  username: string
}

/** Server-only session cookie reader (request context required). */
export function readSession(): SessionUser | null {
  try {
    const raw = getCookie(SESSION_COOKIE)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SessionUser
    if (!parsed.id || !parsed.username) return null
    return parsed
  } catch {
    return null
  }
}

export function writeSession(user: SessionUser): void {
  setCookie(SESSION_COOKIE, JSON.stringify(user), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })
}
