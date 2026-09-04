import { apiRequest } from '#/lib/api/client'
import { ApiError } from '#/lib/api/errors'
import { isAuthMockEnabled } from '#/lib/auth/mock'
import { loadSession } from '#/lib/auth/storage'

import { CHARACTER_MAX_PER_ACCOUNT } from './config'
import {
  mockCreateCharacter,
  mockCreationOptions,
  mockGetCharacter,
  mockListCharacters,
  starterSkins,
} from './mock-store'
import {
  characterSchema,
  charactersListSchema,
  creationOptionsSchema,
  defaultLimits,
  type Character,
  type CharactersList,
  type CreateCharacterInput,
  type CreationOptions,
  type WorldOption,
} from './schemas'

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

type ApiServer = {
  serverId: string
  name: string
  region: string
  status: 'online' | 'maintenance' | 'offline'
  maxPlayers: number
}

type ApiCharacter = {
  id: string
  name: string
  serverId: string
  accountId?: string
}

type ApiCreateCharacterResponse = {
  character: ApiCharacter
  spawn?: unknown
}

function requireUserId(): string {
  const session = loadSession()
  if (!session?.userId) {
    throw new CharacterApiError(401, 'unauthorized')
  }
  return session.userId
}

function avatarFor(name: string): string {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`
}

function serverStatusToWorld(
  status: ApiServer['status'],
): WorldOption['status'] {
  return status === 'online' ? 'open' : 'closed'
}

function toWorldOption(server: ApiServer): WorldOption {
  return {
    id: server.serverId,
    name: server.name,
    status: serverStatusToWorld(server.status),
  }
}

function toUiCharacter(
  raw: ApiCharacter,
  serversById: Map<string, ApiServer>,
): Character {
  const server = serversById.get(raw.serverId)
  return characterSchema.parse({
    id: raw.id,
    displayName: raw.name,
    worldId: raw.serverId,
    worldName: server?.name ?? raw.serverId,
    skinId: 'default',
    skinName: 'Trainer',
    skinImageUrl: avatarFor(raw.name),
    createdAt: new Date(0).toISOString(),
  })
}

async function fetchServers(): Promise<ApiServer[]> {
  return apiRequest<ApiServer[]>('/servers')
}

function serversMap(servers: ApiServer[]): Map<string, ApiServer> {
  return new Map(servers.map((server) => [server.serverId, server]))
}

function mapCreateFailure(error: unknown): CreateCharacterResult {
  if (error instanceof ApiError) {
    const raw = `${error.rawMessage} ${error.message}`.toLowerCase()
    if (
      raw.includes('taken') ||
      raw.includes('já') ||
      raw.includes('ocupado')
    ) {
      return { ok: false, status: error.status || 400, code: 'duplicate_name' }
    }
    if (raw.includes('limit') || raw.includes('limite')) {
      return { ok: false, status: error.status || 400, code: 'limit_reached' }
    }
    if (error.status === 429) {
      return { ok: false, status: 429, code: 'rate_limit' }
    }
    if (error.status === 400 || error.status === 422) {
      return { ok: false, status: error.status, code: 'validation' }
    }
    return { ok: false, status: error.status || 500, code: 'error' }
  }

  if (error instanceof CharacterApiError) {
    return { ok: false, status: error.status, code: error.code }
  }

  return { ok: false, status: 500, code: 'error' }
}

export async function listCharactersFn(): Promise<CharactersList> {
  if (isAuthMockEnabled()) {
    return mockListCharacters(requireUserId())
  }

  const [rawCharacters, servers] = await Promise.all([
    apiRequest<ApiCharacter[]>('/characters', { auth: true }),
    fetchServers(),
  ])
  const byId = serversMap(servers)
  const characters = rawCharacters.map((item) => toUiCharacter(item, byId))

  return charactersListSchema.parse({
    characters,
    limits: defaultLimits(characters.length, CHARACTER_MAX_PER_ACCOUNT),
  })
}

export async function getCreationOptionsFn(): Promise<CreationOptions> {
  if (isAuthMockEnabled()) {
    return mockCreationOptions(requireUserId())
  }

  const [rawCharacters, servers] = await Promise.all([
    apiRequest<ApiCharacter[]>('/characters', { auth: true }),
    fetchServers(),
  ])

  const worlds = servers
    .map(toWorldOption)
    .filter((world) => world.status === 'open')

  return creationOptionsSchema.parse({
    worlds,
    skins: starterSkins,
    limits: defaultLimits(rawCharacters.length, CHARACTER_MAX_PER_ACCOUNT),
  })
}

export async function getCharacterFn(input: {
  data: { id: string }
}): Promise<Character | null> {
  const { id } = input.data

  if (isAuthMockEnabled()) {
    return mockGetCharacter(requireUserId(), id)
  }

  try {
    const [raw, servers] = await Promise.all([
      apiRequest<ApiCharacter>(`/characters/${encodeURIComponent(id)}`, {
        auth: true,
      }),
      fetchServers(),
    ])
    return toUiCharacter(raw, serversMap(servers))
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

export type CreateCharacterResult =
  | { ok: true; character: Character }
  | { ok: false; status: number; code: string }

export async function createCharacterFn(input: {
  data: CreateCharacterInput
}): Promise<CreateCharacterResult> {
  const { idempotencyKey, ...body } = input.data

  if (isAuthMockEnabled()) {
    return mockCreateCharacter(requireUserId(), body, idempotencyKey)
  }

  try {
    const created = await apiRequest<ApiCreateCharacterResponse>(
      '/characters',
      {
        method: 'POST',
        auth: true,
        body: {
          name: body.displayName,
          serverId: body.worldId,
        },
      },
    )
    const servers = await fetchServers()

    return {
      ok: true,
      character: toUiCharacter(created.character, serversMap(servers)),
    }
  } catch (error) {
    return mapCreateFailure(error)
  }
}
