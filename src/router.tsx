import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import * as Sentry from '@sentry/tanstackstart-react'
import { routeTree } from './routeTree.gen'

import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { getContext } from './integrations/tanstack-query/root-provider'

const sentryDsn = import.meta.env.VITE_SENTRY_DSN

if (sentryDsn && typeof window !== 'undefined') {
  Sentry.init({
    dsn: sentryDsn,
    dataCollection: {
      userInfo: false,
      httpBodies: [],
    },
    tracesSampleRate: 0.1,
  })
}

export function getRouter() {
  const context = getContext()

  const router = createTanStackRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
