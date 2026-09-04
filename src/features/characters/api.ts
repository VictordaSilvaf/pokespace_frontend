import * as Sentry from '@sentry/tanstackstart-react'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { env } from '#/env'
import { readSession } from '#/features/auth/session-cookie'

import {
  mockCreateCharacter,
  mockCreationOptions,
  mockGetCharacter,
  mockListCharacters,
} from './mock-store'
import {
  characterSchema,
  charactersListSchema,
  createCharacterInputSchema,
  creationOptionsSchema,
} from './schemas'
import type { Character, CharactersList, CreationOptions } from './schemas'

export class CharacterApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message?: string) {
    super(message ?? code)
    this.name = 'CharacterApiError'
    this.status = status
    this.code = code
  }
}

function requireUserId(): string {
  const session = readSession()
  if (!session) {
    throw new CharacterApiError(401, 'unauthorized')
  }
  return session.id
}

function apiBase(): string | undefined {
  return env.SERVER_URL
}

async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const base = apiBase()
  if (!base) {
    throw new Error('SERVER_URL is not configured')
  }
  return fetch(new URL(path, base), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  })
}

function readErrorCode(body: unknown): string | null {
  if (typeof body !== 'object' || body === null || !('code' in body)) {
    return null
  }
  const value = Reflect.get(body, 'code')
  return typeof value === 'string' ? value : null
}

function mapHttpError(status: number, body: unknown): CharacterApiError {
  const fromBody = readErrorCode(body)
  const code =
    fromBody ??
    (status === 409
      ? 'conflict'
      : status === 429
        ? 'rate_limit'
        : status === 404
          ? 'not_found'
          : status === 400
            ? 'validation'
            : 'error')

  return new CharacterApiError(status, code)
}

export const listCharactersFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CharactersList> => {
    return Sentry.startSpan({ name: 'List characters' }, async () => {
      const userId = requireUserId()
      const base = apiBase()

      if (!base) {
        return mockListCharacters(userId)
      }

      const res = await apiFetch('/characters')
      if (!res.ok) {
        throw mapHttpError(res.status, await res.json().catch(() => null))
      }
      return charactersListSchema.parse(await res.json())
    })
  },
)

export const getCreationOptionsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CreationOptions> => {
    return Sentry.startSpan(
      { name: 'Fetch character creation options' },
      async () => {
        const userId = requireUserId()
        const base = apiBase()

        if (!base) {
          return mockCreationOptions(userId)
        }

        const res = await apiFetch('/characters/creation-options')
        if (!res.ok) {
          throw mapHttpError(res.status, await res.json().catch(() => null))
        }
        return creationOptionsSchema.parse(await res.json())
      },
    )
  },
)

export const getCharacterFn = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }): Promise<Character | null> => {
    return Sentry.startSpan(
      { name: 'Get character by id' },
      async () => {
        const userId = requireUserId()
        const base = apiBase()

        if (!base) {
          return mockGetCharacter(userId, data.id)
        }

        const res = await apiFetch(`/characters/${encodeURIComponent(data.id)}`)
        if (res.status === 404) {
          return null
        }
        if (!res.ok) {
          throw mapHttpError(res.status, await res.json().catch(() => null))
        }
        return characterSchema.parse(await res.json())
      },
    )
  })

export type CreateCharacterResult =
  | { ok: true; character: Character }
  | { ok: false; status: number; code: string }

export const createCharacterFn = createServerFn({ method: 'POST' })
  .validator(createCharacterInputSchema)
  .handler(async ({ data }): Promise<CreateCharacterResult> => {
    return Sentry.startSpan({ name: 'Create character' }, async () => {
      const userId = requireUserId()
      const base = apiBase()
      const { idempotencyKey, ...body } = data

      if (!base) {
        return mockCreateCharacter(userId, body, idempotencyKey)
      }

      const res = await apiFetch('/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = mapHttpError(res.status, await res.json().catch(() => null))
        return { ok: false, status: err.status, code: err.code }
      }

      return {
        ok: true,
        character: characterSchema.parse(await res.json()),
      }
    })
  })
