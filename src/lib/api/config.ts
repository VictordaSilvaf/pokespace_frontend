import { env } from '#/env'

export function getApiBase(): string {
  return env.VITE_API_URL?.replace(/\/$/, '') || '/api/v1'
}
