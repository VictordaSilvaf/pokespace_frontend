import type { ReactNode } from 'react'
import { AppSidebar } from '#/components/layout/AppSidebar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <AppSidebar />
      <div className="main-stage">{children}</div>
    </div>
  )
}
