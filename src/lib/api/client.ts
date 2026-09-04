import { getApiBase } from '#/lib/api/config'
import {
  ApiError,
  apiErrorFromResponse,
  translateApiMessage,
} from '#/lib/api/errors'
import type { AuthResult } from '#/lib/api/types'
import type { StoredSession } from '#/lib/auth/storage'
import { clearSession, loadSession, saveSession } from '#/lib/auth/storage'

type RequestOptions = {
  method?: string
  body?: unknown
  auth?: boolean
  retryOnUnauthorized?: boolean
}

let refreshInFlight: Promise<boolean> | null = null

function sessionFromAuth(result: AuthResult): StoredSession {
  return {
    userId: result.userId,
    email: result.email,
    phone: result.phone,
    username: result.username,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    sessionId: result.sessionId,
  }
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    const text = await response.text()
    return text ? { message: text } : null
  }

  try {
    return await response.json()
  } catch {
    return null
  }
}

async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) {
    return refreshInFlight
  }

  refreshInFlight = (async () => {
    const session = loadSession()
    if (!session?.refreshToken) {
      return false
    }

    try {
      const response = await fetch(`${getApiBase()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      })
      const body = await parseBody(response)
      if (!response.ok) {
        clearSession()
        return false
      }

      const next = body as AuthResult
      saveSession({
        ...session,
        accessToken: next.accessToken,
        refreshToken: next.refreshToken,
        sessionId: next.sessionId,
      })
      return true
    } catch {
      return false
    }
  })()

  try {
    return await refreshInFlight
  } finally {
    refreshInFlight = null
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    auth = false,
    retryOnUnauthorized = true,
  } = options
  const headers = new Headers()

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth) {
    const session = loadSession()
    if (session?.accessToken) {
      headers.set('Authorization', `Bearer ${session.accessToken}`)
    }
    if (session?.sessionId) {
      headers.set('X-Session-Id', session.sessionId)
    }
  }

  let response: Response
  try {
    response = await fetch(`${getApiBase()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    const raw = error instanceof Error ? error.message : 'network'
    throw new ApiError(
      0,
      raw,
      translateApiMessage(raw) || translateApiMessage('Failed to fetch'),
    )
  }

  if (response.status === 401 && auth && retryOnUnauthorized) {
    const refreshed = await refreshSession()
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false })
    }
  }

  const payload = await parseBody(response)

  if (!response.ok) {
    throw apiErrorFromResponse(response.status, payload)
  }

  return payload as T
}

export function persistAuthResult(result: AuthResult): StoredSession {
  const session = sessionFromAuth(result)
  saveSession(session)
  return session
}
