import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { readSession, writeSession } from './session-cookie'
import type { SessionUser } from './session-cookie'

export type { SessionUser }

/**
 * Auth slice integration point.
 * Characters routes call `requireSession` in `beforeLoad`.
 * Full login/register lives in the auth slice; this stub keeps the
 * post-auth → /characters contract testable.
 */
export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionUser | null> => readSession(),
)

export const establishDevSessionFn = createServerFn({ method: 'POST' })
  .validator(z.object({ username: z.string().min(1).max(32).optional() }))
  .handler(async ({ data }): Promise<SessionUser> => {
    const user: SessionUser = {
      id: 'dev-user-1',
      username: data.username ?? 'trainer',
    }
    writeSession(user)
    return user
  })

export async function requireSession(): Promise<SessionUser> {
  const session = await getSessionFn()
  if (!session) {
    throw redirect({ to: '/login' })
  }
  return session
}
