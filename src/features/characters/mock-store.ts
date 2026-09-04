import { CHARACTER_MAX_PER_ACCOUNT } from './config'
import { defaultLimits } from './schemas'
import type {
  Character,
  CharactersList,
  CreationOptions,
  CreateCharacterBody,
} from './schemas'

/**
 * In-memory mock used when SERVER_URL is unset so the character UI
 * can be exercised without the backend. Not used in production.
 */
const starterWorlds = [
  { id: 'world-kanto', name: 'Kanto', status: 'open' as const },
]

const starterSkins = [
  {
    id: 'skin-red',
    name: 'Red',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Red&backgroundColor=b6e3f4',
  },
  {
    id: 'skin-leaf',
    name: 'Leaf',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Leaf&backgroundColor=c0aede',
  },
  {
    id: 'skin-ethan',
    name: 'Ethan',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Ethan&backgroundColor=d1f4d1',
  },
  {
    id: 'skin-lyra',
    name: 'Lyra',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Lyra&backgroundColor=ffd5dc',
  },
]

const storeByUser = new Map<string, Character[]>()
const idempotencyByUser = new Map<string, Map<string, Character>>()

function charactersFor(userId: string): Character[] {
  if (!storeByUser.has(userId)) {
    storeByUser.set(userId, [])
  }
  return storeByUser.get(userId)!
}

export function mockListCharacters(userId: string): CharactersList {
  const characters = charactersFor(userId)
  return {
    characters: [...characters],
    limits: defaultLimits(characters.length),
  }
}

export function mockCreationOptions(userId: string): CreationOptions {
  const characters = charactersFor(userId)
  return {
    worlds: starterWorlds,
    skins: starterSkins,
    limits: defaultLimits(characters.length),
  }
}

export function mockGetCharacter(
  userId: string,
  id: string,
): Character | null {
  return charactersFor(userId).find((c) => c.id === id) ?? null
}

export type MockCreateResult =
  | { ok: true; character: Character }
  | {
      ok: false
      status: 400 | 409 | 429
      code: 'validation' | 'duplicate_name' | 'limit_reached' | 'rate_limit'
    }

export function mockCreateCharacter(
  userId: string,
  body: CreateCharacterBody,
  idempotencyKey: string,
): MockCreateResult {
  const existingKeys = idempotencyByUser.get(userId) ?? new Map()
  const replay = existingKeys.get(idempotencyKey)
  if (replay) {
    return { ok: true, character: replay }
  }

  const characters = charactersFor(userId)
  if (characters.length >= CHARACTER_MAX_PER_ACCOUNT) {
    return { ok: false, status: 409, code: 'limit_reached' }
  }

  const nameTaken = characters.some(
    (c) => c.displayName.toLowerCase() === body.displayName.toLowerCase(),
  )
  if (nameTaken) {
    return { ok: false, status: 409, code: 'duplicate_name' }
  }

  const world = starterWorlds.find((w) => w.id === body.worldId)
  const skin = starterSkins.find((s) => s.id === body.skinId)
  if (!world || !skin) {
    return { ok: false, status: 400, code: 'validation' }
  }

  const character: Character = {
    id: crypto.randomUUID(),
    displayName: body.displayName.trim(),
    worldId: world.id,
    worldName: world.name,
    skinId: skin.id,
    skinName: skin.name,
    skinImageUrl: skin.imageUrl,
    createdAt: new Date().toISOString(),
  }

  characters.push(character)
  existingKeys.set(idempotencyKey, character)
  idempotencyByUser.set(userId, existingKeys)

  return { ok: true, character }
}
