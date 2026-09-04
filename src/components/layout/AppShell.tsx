import type { ReactNode } from 'react'

import { AppSidebar } from '#/components/layout/AppSidebar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh grid-cols-1 grid-rows-[1fr_auto] lg:grid-cols-[240px_1fr] lg:grid-rows-none">
      <AppSidebar />
      <div className="min-h-svh min-w-0 pb-20 lg:pb-0">{children}</div>
    </div>
  )
}
