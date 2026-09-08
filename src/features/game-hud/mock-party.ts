import {
  creatureIdForDex,
  creatureUrl,
  getPokemonByDexId,
} from '#/features/game-data'

import type { Peke } from './types'

type PartySeed = {
  id: string
  dexId: number
  hp: number
  maxHp: number
  bonus: number
  fainted: boolean
}

/** Party seeds use dex ids that have curated creature sheet mappings. */
const PARTY_SEEDS: PartySeed[] = [
  { id: 'peke-1', dexId: 9, hp: 100, maxHp: 100, bonus: 0, fainted: false },
  { id: 'peke-2', dexId: 7, hp: 100, maxHp: 100, bonus: 0, fainted: false },
  { id: 'peke-3', dexId: 3, hp: 72, maxHp: 100, bonus: 0, fainted: false },
  { id: 'peke-4', dexId: 52, hp: 41, maxHp: 100, bonus: 0, fainted: false },
  { id: 'peke-5', dexId: 107, hp: 0, maxHp: 100, bonus: 0, fainted: true },
  { id: 'peke-6', dexId: 114, hp: 88, maxHp: 100, bonus: 2, fainted: false },
]

function toPeke(seed: PartySeed): Peke {
  const entry = getPokemonByDexId(seed.dexId)
  const creatureId = creatureIdForDex(seed.dexId)
  const sprite = creatureId != null ? creatureUrl(creatureId) : ''
  return {
    id: seed.id,
    name: entry?.name ?? `Dex ${seed.dexId}`,
    dexId: seed.dexId,
    creatureId,
    spriteUrl: sprite,
    walkSpriteUrl: sprite,
    hp: seed.hp,
    maxHp: seed.maxHp,
    bonus: seed.bonus,
    fainted: seed.fainted,
  }
}

/** Preview party for the floating HUD — gen 1–3 with local walk sheets. */
export const mockParty: Peke[] = PARTY_SEEDS.map(toPeke)
