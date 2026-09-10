import { z } from 'zod'

import { ALL_TYPES   } from './types'
import type {PokeType, PokedexEntry} from './types';
import { pokemonPortraitUrl } from '#/features/game-data'
import { resolveAssetPath } from '#/features/game-data/urls'

const pokeTypeSchema = z.string().transform((value, ctx) => {
  const t = value.toLowerCase()
  if ((ALL_TYPES as string[]).includes(t)) return t as PokeType
  ctx.addIssue({ code: 'custom', message: `unknown type ${value}` })
  return z.NEVER
})

export const spriteAssetSchema = z.object({
  assetKey: z.string(),
  path: z.string(),
  frameWidth: z.number(),
  frameHeight: z.number(),
  frameCount: z.number(),
  lookType: z.number().optional(),
})

export const pokemonAssetsSchema = z
  .object({
    portrait: spriteAssetSchema.optional(),
    walk: spriteAssetSchema.optional(),
    shinyWalk: spriteAssetSchema.optional(),
    megaWalk: spriteAssetSchema.optional(),
  })
  .optional()

export const pokemonListItemSchema = z.object({
  dexId: z.number().int().positive(),
  name: z.string(),
  types: z.array(z.string()),
  status: z.string(),
  lookType: z.number().nullable().optional(),
  assets: pokemonAssetsSchema,
})

export const pokemonListResultSchema = z.object({
  items: z.array(pokemonListItemSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
})

export const pokemonDetailSchema = z.object({
  id: z.string(),
  dexId: z.number().int().positive(),
  name: z.string(),
  types: z.array(z.string()),
  baseStats: z.object({
    hp: z.number(),
    attack: z.number(),
    defense: z.number(),
    specialAttack: z.number(),
    specialDefense: z.number(),
    speed: z.number(),
  }),
  status: z.string(),
  lookType: z.number().nullable().optional(),
  portraitId: z.number().nullable().optional(),
  flags: z
    .object({
      hasShiny: z.boolean(),
      hasMega: z.boolean(),
    })
    .optional(),
  ot: z
    .object({
      hp: z.number().nullable().optional(),
      speed: z.number().nullable().optional(),
      experience: z.number().nullable().optional(),
    })
    .optional(),
  source: z.string().optional(),
  assets: pokemonAssetsSchema,
})

export const pokedexProgressEntrySchema = z.object({
  dexId: z.number().int().positive(),
  seenAt: z.string(),
  caughtAt: z.string().nullable(),
})

export const characterPokedexSchema = z.object({
  totalCatalog: z.number().int().nonnegative(),
  seen: z.number().int().nonnegative(),
  caught: z.number().int().nonnegative(),
  entries: z.array(pokedexProgressEntrySchema),
})

export type SpriteAsset = z.infer<typeof spriteAssetSchema>
export type PokemonListItem = z.infer<typeof pokemonListItemSchema>
export type PokemonListResult = z.infer<typeof pokemonListResultSchema>
export type PokemonDetail = z.infer<typeof pokemonDetailSchema>
export type CharacterPokedex = z.infer<typeof characterPokedexSchema>

const knownTypes = new Set<string>(ALL_TYPES)

function asPokeTypes(types: string[]): PokeType[] {
  return types
    .map((t) => t.toLowerCase())
    .filter((t): t is PokeType => knownTypes.has(t))
}

/** Resolve API asset path → absolute CDN URL or static path. */
export function resolveSpriteUrl(path: string | null | undefined): string | null {
  if (!path) return null
  const cleaned = path.replace(/^\/+/, '')
  // Already absolute (API applied S3_PUBLIC_BASE_URL)
  if (/^https?:\/\//i.test(cleaned) || /^https?:\/\//i.test(path)) {
    return path.startsWith('http') ? path : cleaned
  }
  // Seed pack paths like sprites/pokemon/1/portrait.png are not on CDN
  if (/^sprites\/pokemon\//i.test(cleaned)) return null
  return resolveAssetPath(cleaned)
}

function spriteForDex(
  dexId: number,
  assets: z.infer<typeof pokemonAssetsSchema>,
): { spriteUrl: string; shinySpriteUrl: string | null; hasShiny: boolean } {
  const portraitPath =
    resolveSpriteUrl(assets?.portrait?.path) ??
    resolveSpriteUrl(assets?.walk?.path)
  const shinyPath = resolveSpriteUrl(assets?.shinyWalk?.path)
  return {
    spriteUrl: portraitPath ?? pokemonPortraitUrl(dexId),
    shinySpriteUrl: shinyPath,
    hasShiny: Boolean(assets?.shinyWalk),
  }
}

export function listItemToEntry(
  item: PokemonListItem,
  progress?: { seenAt: string; caughtAt: string | null },
): PokedexEntry {
  const types = asPokeTypes(item.types)
  const sprites = spriteForDex(item.dexId, item.assets)

  return {
    dexId: item.dexId,
    discovered: true,
    caught: progress?.caughtAt != null,
    name: item.name,
    types,
    lookType: item.lookType ?? null,
    ...sprites,
  }
}

export function detailToEntryFields(detail: PokemonDetail): Partial<PokedexEntry> {
  const types = asPokeTypes(detail.types)
  const sprites = spriteForDex(detail.dexId, detail.assets)

  const statsLines = [
    `HP ${detail.baseStats.hp}`,
    `Atk ${detail.baseStats.attack}`,
    `Def ${detail.baseStats.defense}`,
    `SpA ${detail.baseStats.specialAttack}`,
    `SpD ${detail.baseStats.specialDefense}`,
    `Spe ${detail.baseStats.speed}`,
  ]

  return {
    name: detail.name,
    types,
    lookType: detail.lookType ?? null,
    portraitId: detail.portraitId ?? null,
    ...sprites,
    hasShiny: Boolean(
      detail.assets?.shinyWalk ?? detail.flags?.hasShiny ?? sprites.hasShiny,
    ),
    baseStats: detail.baseStats,
    description: statsLines.join(' · '),
    level: detail.ot?.experience ?? undefined,
  }
}

export function parsePokeType(value: string): PokeType | null {
  const parsed = pokeTypeSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}
