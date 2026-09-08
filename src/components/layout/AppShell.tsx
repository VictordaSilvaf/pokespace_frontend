import type { ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'

import { AppSidebar, isAuthPath } from '#/components/layout/AppSidebar'
import { cn } from '#/lib/utils'

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const authScreen = isAuthPath(pathname)

  return (
    <div
      className={cn(
        'grid min-h-svh',
        authScreen
          ? 'grid-rows-[auto_1fr]'
          : 'grid-cols-1 grid-rows-[1fr_auto] lg:grid-cols-[240px_1fr] lg:grid-rows-none',
      )}
    >
      <AppSidebar />
      <div
        className={cn(
          'min-w-0',
          authScreen ? 'min-h-0' : 'min-h-svh pb-20 lg:pb-0',
        )}
      >
        {children}
      </div>
    </div>
  )
}
