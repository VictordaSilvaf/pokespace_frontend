import { createContext, use, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthResult } from '#/lib/api/types'
import { persistAuthResult } from '#/lib/api/client'
import { authApi } from '#/lib/api/auth'
import type { StoredSession } from '#/lib/auth/storage'
import {
  clearSession,
  clearTempToken,
  loadSession,
  loadTempToken,
  saveTempToken,
} from '#/lib/auth/storage'

type AuthContextValue = {
  ready: boolean
  session: StoredSession | null
  tempToken: string | null
  signIn: (result: AuthResult) => void
  beginTwoFactor: (token: string) => void
  clearTwoFactor: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<StoredSession | null>(null)
  const [tempToken, setTempToken] = useState<string | null>(null)

  useEffect(() => {
    setSession(loadSession())
    setTempToken(loadTempToken())
    setReady(true)
  }, [])

  const value: AuthContextValue = {
    ready,
    session,
    tempToken,
    signIn: (result) => {
      const next = persistAuthResult(result)
      clearTempToken()
      setTempToken(null)
      setSession(next)
    },
    beginTwoFactor: (token) => {
      saveTempToken(token)
      setTempToken(token)
    },
    clearTwoFactor: () => {
      clearTempToken()
      setTempToken(null)
    },
    signOut: async () => {
      const current = loadSession()
      try {
        if (current) {
          await authApi.logout(current.refreshToken, current.sessionId)
        }
      } catch {
        // Local sign-out still proceeds if the API is unreachable.
      }
      clearSession()
      clearTempToken()
      setSession(null)
      setTempToken(null)
    },
  }

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const value = use(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return value
}
