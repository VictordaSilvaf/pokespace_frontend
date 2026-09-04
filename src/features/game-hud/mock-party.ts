import type { Peke } from './types'

/** Preview party for the floating HUD — replace with live API later. */
export const mockParty: Peke[] = [
  {
    id: 'peke-1',
    name: 'Mewtwo',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png',
    hp: 100,
    maxHp: 100,
    bonus: 0,
    fainted: false,
  },
  {
    id: 'peke-2',
    name: 'Blastoise',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png',
    hp: 100,
    maxHp: 100,
    bonus: 0,
    fainted: false,
  },
  {
    id: 'peke-3',
    name: 'Vileplume',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/45.png',
    hp: 72,
    maxHp: 100,
    bonus: 0,
    fainted: false,
  },
  {
    id: 'peke-4',
    name: 'Zeraora',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/807.png',
    hp: 41,
    maxHp: 100,
    bonus: 0,
    fainted: false,
  },
  {
    id: 'peke-5',
    name: 'Gengar',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png',
    hp: 0,
    maxHp: 100,
    bonus: 0,
    fainted: true,
  },
  {
    id: 'peke-6',
    name: 'Lucario',
    spriteUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png',
    hp: 88,
    maxHp: 100,
    bonus: 2,
    fainted: false,
  },
]
