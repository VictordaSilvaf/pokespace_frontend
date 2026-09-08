import type { ReactNode } from 'react'

import { AppTopBar } from '#/components/layout/AppTopBar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr]">
      <AppTopBar />
      <div className="min-h-0 min-w-0">{children}</div>
    </div>
  )
}
