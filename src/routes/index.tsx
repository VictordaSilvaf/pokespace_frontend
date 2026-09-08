import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    // Client JWT (localStorage) is the source of truth for API auth.
    // Always land on login; RequireGuest/RequireSession decide next.
    throw redirect({ to: '/login' })
  },
})
