import { SPRITES_CREATURE_BASE } from './urls'

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

/**
 * Curated national-dex → creature sprite id (padventures pack).
 * Server lookType/portraitId do not match this pack.
 */
export const DEX_CREATURE_ID: Record<number, number> = {
  3: 40056, // Venusaur
  7: 40036, // Squirtle
  9: 40040, // Blastoise
  52: 40037, // Meowth
  107: 40368, // Hitmonchan
  114: 40052, // Tangela
}

/** Player trainer walk sheet. */
export const PLAYER_CREATURE_ID = 42492

/** World NPCs (creature sheet ids + labels). */
export const WORLD_NPC_DEFS = [
  { id: 'npc-balloons', name: 'Vendedor', creatureId: 41779 },
  { id: 'npc-festive', name: 'Ajudante', creatureId: 44909 },
  { id: 'npc-cat', name: 'Miyagi', creatureId: 43209 },
  { id: 'npc-hat', name: 'Viajante', creatureId: 43965 },
] as const

/** Geometry for every creature id we render (avoids loading 8MB metadata.json). */
export const CREATURE_GEOMETRY: Record<number, SheetGeometry> = {
  40036: { w: 1, h: 1, layers: 1, px: 4, py: 1, pz: 1, phases: 3 },
  40037: { w: 2, h: 2, layers: 1, px: 4, py: 1, pz: 1, phases: 3 },
  40040: { w: 1, h: 1, layers: 1, px: 4, py: 1, pz: 1, phases: 3 },
  40052: { w: 1, h: 1, layers: 1, px: 4, py: 1, pz: 1, phases: 3 },
  40056: { w: 2, h: 2, layers: 1, px: 4, py: 1, pz: 1, phases: 3 },
  40368: { w: 1, h: 2, layers: 1, px: 4, py: 1, pz: 1, phases: 3 },
  41779: { w: 1, h: 2, layers: 1, px: 4, py: 1, pz: 1, phases: 4 },
  42492: { w: 1, h: 2, layers: 1, px: 4, py: 1, pz: 1, phases: 4 },
  43209: { w: 1, h: 2, layers: 1, px: 4, py: 1, pz: 1, phases: 3 },
  43965: { w: 1, h: 2, layers: 1, px: 4, py: 1, pz: 1, phases: 3 },
  44909: { w: 1, h: 2, layers: 1, px: 4, py: 1, pz: 1, phases: 3 },
}

export function creatureUrl(creatureId: number): string {
  return `${SPRITES_CREATURE_BASE}/${creatureId}.png`
}

export function creatureIdForDex(dexId: number): number | null {
  return DEX_CREATURE_ID[dexId] ?? null
}
