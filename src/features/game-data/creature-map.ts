import { SPRITES_CREATURE_BASE } from './urls'
import catalogPokemon from './generated/pokemon.json' with { type: 'json' }
import catalogNpcs from './generated/npcs.json' with { type: 'json' }

/** OT-style sheet geometry used by local creature PNGs. */
export type SheetGeometry = {
  w: number
  h: number
  layers: number
  px: number
  py: number
  pz: number
  phases: number
}

/** Default walk sheet geometry until DAT geometry is loaded per id. */
export const DEFAULT_CREATURE_GEOMETRY: SheetGeometry = {
  w: 1,
  h: 1,
  layers: 1,
  px: 4,
  py: 1,
  pz: 1,
  phases: 3,
}

/**
 * dexId → creature lookType from ./server catalog.
 * Never assume dexId === lookType.
 */
export const DEX_CREATURE_ID: Record<number, number> = Object.fromEntries(
  catalogPokemon
    .filter((p) => p.dexId != null && p.lookType != null)
    .map((p) => [p.dexId as number, p.lookType as number]),
)

/** Player trainer lookType from server/data/XML/outfits.xml (male Trainer). */
export const PLAYER_CREATURE_ID = 510

/** World NPCs from server catalog (first few with looks). */
export const WORLD_NPC_DEFS = catalogNpcs
  .filter((n) => n.lookType != null && n.lookType > 0)
  .slice(0, 4)
  .map((n) => ({
    id: n.id,
    name: n.name,
    creatureId: n.lookType as number,
  }))

/** Geometry cache: start empty; callers fall back to DEFAULT_CREATURE_GEOMETRY. */
export const CREATURE_GEOMETRY: Record<number, SheetGeometry> = {}

export function creatureUrl(creatureId: number): string {
  return `${SPRITES_CREATURE_BASE}/${creatureId}.png`
}

export function creatureIdForDex(dexId: number): number | null {
  return DEX_CREATURE_ID[dexId] ?? null
}

export function geometryForCreature(creatureId: number): SheetGeometry {
  return CREATURE_GEOMETRY[creatureId] ?? DEFAULT_CREATURE_GEOMETRY
}
