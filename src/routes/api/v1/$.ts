import { createFileRoute } from '@tanstack/react-router'
import * as Sentry from '@sentry/tanstackstart-react'
import { proxyToBackend } from '#/lib/server/proxy'

export const Route = createFileRoute('/api/v1/$')({
  server: {
    handlers: {
      GET: ({ request }) =>
        Sentry.startSpan({ name: 'Proxying API GET' }, () =>
          proxyToBackend(request),
        ),
      POST: ({ request }) =>
        Sentry.startSpan({ name: 'Proxying API POST' }, () =>
          proxyToBackend(request),
        ),
      PATCH: ({ request }) =>
        Sentry.startSpan({ name: 'Proxying API PATCH' }, () =>
          proxyToBackend(request),
        ),
      DELETE: ({ request }) =>
        Sentry.startSpan({ name: 'Proxying API DELETE' }, () =>
          proxyToBackend(request),
        ),
    },
  },
})
