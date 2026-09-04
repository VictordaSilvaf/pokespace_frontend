import * as Sentry from '@sentry/tanstackstart-react'
import { createServerFn } from '@tanstack/react-start'

function backendOrigin(): string {
  return process.env.API_URL?.replace(/\/$/, '') || 'http://localhost:3000'
}

export const getApiHealth = createServerFn({ method: 'GET' }).handler(
  async () => {
    return Sentry.startSpan({ name: 'Requesting API health' }, async () => {
      const response = await fetch(`${backendOrigin()}/api/v1/health`)
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }
      return (await response.json()) as { status: string; service?: string }
    })
  },
)
