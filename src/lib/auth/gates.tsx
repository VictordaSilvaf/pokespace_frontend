import { Navigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { m } from '#/paraglide/messages'
import { useAuth } from '#/lib/auth/auth-provider'

export function BootScreen() {
  return (
    <div className="boot-screen">
      <p>{m.boot()}</p>
    </div>
  )
}

export function RequireSession({ children }: { children: ReactNode }) {
  const auth = useAuth()

  if (!auth.ready) {
    return <BootScreen />
  }

  if (!auth.session) {
    return <Navigate to="/login" />
  }

  return children
}

export function RequireGuest({ children }: { children: ReactNode }) {
  const auth = useAuth()

  if (!auth.ready) {
    return <BootScreen />
  }

  if (auth.session) {
    return <Navigate to="/base" />
  }

  return children
}
