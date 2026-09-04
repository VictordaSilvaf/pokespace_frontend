import { Outlet, createFileRoute } from '@tanstack/react-router'
import { RequireSession } from '#/lib/auth/gates'

export const Route = createFileRoute('/base')({
  component: BaseLayout,
})

function BaseLayout() {
  return (
    <RequireSession>
      <Outlet />
    </RequireSession>
  )
}
