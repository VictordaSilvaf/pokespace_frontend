import { createFileRoute, redirect } from '@tanstack/react-router'

import { getSessionFn } from '#/features/auth/session'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    throw redirect({ to: session ? '/characters' : '/login' })
  },
})
