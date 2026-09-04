import { z } from 'zod'

import {
  CHARACTER_MAX_PER_ACCOUNT,
  DISPLAY_NAME_MAX,
  DISPLAY_NAME_MIN,
  DISPLAY_NAME_PATTERN,
} from './config'

export const characterLimitsSchema = z.object({
  maxPerAccount: z.number().int().positive(),
  canCreate: z.boolean(),
  remaining: z.number().int().nonnegative(),
})

export const characterSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  worldId: z.string().min(1),
  worldName: z.string().min(1),
  skinId: z.string().min(1),
  skinName: z.string().min(1),
  skinImageUrl: z.string().min(1),
  createdAt: z.string().min(1),
})

export const charactersListSchema = z.object({
  characters: z.array(characterSchema),
  limits: characterLimitsSchema,
})

export const worldOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(['open', 'active', 'closed']).optional(),
})

export const skinOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().min(1),
})

export const creationOptionsSchema = z.object({
  worlds: z.array(worldOptionSchema),
  skins: z.array(skinOptionSchema),
  limits: characterLimitsSchema,
})

export const createCharacterBodySchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(DISPLAY_NAME_MIN)
    .max(DISPLAY_NAME_MAX)
    .regex(DISPLAY_NAME_PATTERN),
  worldId: z.string().min(1),
  skinId: z.string().min(1),
})

export const createCharacterInputSchema = createCharacterBodySchema.extend({
  idempotencyKey: z.string().uuid(),
})

export type Character = z.infer<typeof characterSchema>
export type CharacterLimits = z.infer<typeof characterLimitsSchema>
export type CharactersList = z.infer<typeof charactersListSchema>
export type WorldOption = z.infer<typeof worldOptionSchema>
export type SkinOption = z.infer<typeof skinOptionSchema>
export type CreationOptions = z.infer<typeof creationOptionsSchema>
export type CreateCharacterBody = z.infer<typeof createCharacterBodySchema>
export type CreateCharacterInput = z.infer<typeof createCharacterInputSchema>

export const defaultLimits = (
  count: number,
  max = CHARACTER_MAX_PER_ACCOUNT,
): CharacterLimits => ({
  maxPerAccount: max,
  canCreate: count < max,
  remaining: Math.max(0, max - count),
})
