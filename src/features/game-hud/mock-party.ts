import type { Peke } from './types'

const SPRITE_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'

function pokeSprites(dexId: number) {
  return {
    dexId,
    spriteUrl: `${SPRITE_BASE}/${dexId}.png`,
    walkSpriteUrl: `${SPRITE_BASE}/other/showdown/${dexId}.gif`,
  }
}

/** Preview party for the floating HUD — gen 1–3 only (dex ≤ 386). */
export const mockParty: Peke[] = [
  {
    id: 'peke-1',
    name: 'Mewtwo',
    ...pokeSprites(150),
    hp: 100,
    maxHp: 100,
    bonus: 0,
    fainted: false,
  },
  {
    id: 'peke-2',
    name: 'Blastoise',
    ...pokeSprites(9),
    hp: 100,
    maxHp: 100,
    bonus: 0,
    fainted: false,
  },
  {
    id: 'peke-3',
    name: 'Vileplume',
    ...pokeSprites(45),
    hp: 72,
    maxHp: 100,
    bonus: 0,
    fainted: false,
  },
  {
    id: 'peke-4',
    name: 'Swampert',
    ...pokeSprites(260),
    hp: 41,
    maxHp: 100,
    bonus: 0,
    fainted: false,
  },
  {
    id: 'peke-5',
    name: 'Gengar',
    ...pokeSprites(94),
    hp: 0,
    maxHp: 100,
    bonus: 0,
    fainted: true,
  },
  {
    id: 'peke-6',
    name: 'Gardevoir',
    ...pokeSprites(282),
    hp: 88,
    maxHp: 100,
    bonus: 2,
    fainted: false,
  },
]
