import { Outlet, createFileRoute } from '@tanstack/react-router'
import { BaseHeader } from '#/components/layout/BaseHeader'
import { RequireSession } from '#/lib/auth/gates'

export const Route = createFileRoute('/base')({
  component: BaseLayout,
})

function BaseLayout() {
  return (
    <RequireSession>
      <div className="page-shell">
        <BaseHeader />
        <Outlet />
      </div>
    </RequireSession>
  )
}
