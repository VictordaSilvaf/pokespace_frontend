import {
  POKEDEX_TOTAL,
  type PokedexEntry,
  type PokeType,
} from './types'

type Seed = {
  dexId: number
  name: string
  types: PokeType[]
  category: string
  heightM: number
  weightKg: number
  level: number
  abilities: string[]
  moves: { id: string; name: string; type: PokeType }[]
  evolution: string
  description: string
}

/** Discovered entries for the preview Pokédex (gen 1–3). */
const DISCOVERED: Seed[] = [
  {
    dexId: 1,
    name: 'Bulbasaur',
    types: ['grass', 'poison'],
    category: 'Seed',
    heightM: 0.7,
    weightKg: 6.9,
    level: 12,
    abilities: ['Overgrow'],
    moves: [
      { id: 'm1', name: 'Tackle', type: 'normal' },
      { id: 'm2', name: 'Vine Whip', type: 'grass' },
      { id: 'm3', name: 'Leech Seed', type: 'grass' },
    ],
    evolution: 'Ivysaur → Venusaur',
    description: 'A strange seed was planted on its back at birth.',
  },
  {
    dexId: 2,
    name: 'Ivysaur',
    types: ['grass', 'poison'],
    category: 'Seed',
    heightM: 1.0,
    weightKg: 13.0,
    level: 24,
    abilities: ['Overgrow'],
    moves: [
      { id: 'm1', name: 'Razor Leaf', type: 'grass' },
      { id: 'm2', name: 'Poison Powder', type: 'poison' },
      { id: 'm3', name: 'Sleep Powder', type: 'grass' },
    ],
    evolution: 'Venusaur',
    description: 'The bud on its back grows by drawing energy.',
  },
  {
    dexId: 3,
    name: 'Venusaur',
    types: ['grass', 'poison'],
    category: 'Seed',
    heightM: 2.0,
    weightKg: 100.0,
    level: 80,
    abilities: ['Ride', 'Cut', 'Light'],
    moves: [
      { id: 'm1', name: 'Solar Beam', type: 'grass' },
      { id: 'm2', name: 'Poison Powder', type: 'poison' },
      { id: 'm3', name: 'Earthquake', type: 'ground' },
      { id: 'm4', name: 'Sludge Bomb', type: 'poison' },
      { id: 'm5', name: 'Sleep Powder', type: 'grass' },
      { id: 'm6', name: 'Synthesis', type: 'grass' },
    ],
    evolution: '—',
    description: 'Its plant blooms when it is absorbing solar energy.',
  },
  {
    dexId: 4,
    name: 'Charmander',
    types: ['fire'],
    category: 'Lizard',
    heightM: 0.6,
    weightKg: 8.5,
    level: 10,
    abilities: ['Blaze'],
    moves: [
      { id: 'm1', name: 'Scratch', type: 'normal' },
      { id: 'm2', name: 'Ember', type: 'fire' },
    ],
    evolution: 'Charmeleon → Charizard',
    description: 'The flame on its tip indicates its life force.',
  },
  {
    dexId: 6,
    name: 'Charizard',
    types: ['fire', 'flying'],
    category: 'Flame',
    heightM: 1.7,
    weightKg: 90.5,
    level: 55,
    abilities: ['Blaze', 'Fly'],
    moves: [
      { id: 'm1', name: 'Flamethrower', type: 'fire' },
      { id: 'm2', name: 'Wing Attack', type: 'flying' },
      { id: 'm3', name: 'Dragon Claw', type: 'dragon' },
    ],
    evolution: '—',
    description: 'It spits fire hot enough to melt boulders.',
  },
  {
    dexId: 7,
    name: 'Squirtle',
    types: ['water'],
    category: 'Tiny Turtle',
    heightM: 0.5,
    weightKg: 9.0,
    level: 11,
    abilities: ['Torrent'],
    moves: [
      { id: 'm1', name: 'Tackle', type: 'normal' },
      { id: 'm2', name: 'Water Gun', type: 'water' },
    ],
    evolution: 'Wartortle → Blastoise',
    description: 'It shelters in its shell then strikes back.',
  },
  {
    dexId: 9,
    name: 'Blastoise',
    types: ['water'],
    category: 'Shellfish',
    heightM: 1.6,
    weightKg: 85.5,
    level: 60,
    abilities: ['Torrent', 'Surf'],
    moves: [
      { id: 'm1', name: 'Hydro Pump', type: 'water' },
      { id: 'm2', name: 'Ice Beam', type: 'ice' },
      { id: 'm3', name: 'Bite', type: 'dark' },
    ],
    evolution: '—',
    description: 'It crushes foes with pressurized water jets.',
  },
  {
    dexId: 25,
    name: 'Pikachu',
    types: ['electric'],
    category: 'Mouse',
    heightM: 0.4,
    weightKg: 6.0,
    level: 32,
    abilities: ['Static'],
    moves: [
      { id: 'm1', name: 'Thunderbolt', type: 'electric' },
      { id: 'm2', name: 'Quick Attack', type: 'normal' },
      { id: 'm3', name: 'Iron Tail', type: 'steel' },
    ],
    evolution: 'Raichu',
    description: 'Its cheeks store electricity for shocks.',
  },
  {
    dexId: 39,
    name: 'Jigglypuff',
    types: ['normal', 'fairy'],
    category: 'Balloon',
    heightM: 0.5,
    weightKg: 5.5,
    level: 18,
    abilities: ['Cute Charm'],
    moves: [
      { id: 'm1', name: 'Sing', type: 'normal' },
      { id: 'm2', name: 'Pound', type: 'normal' },
    ],
    evolution: 'Wigglytuff',
    description: 'Its song puts anyone who hears it to sleep.',
  },
  {
    dexId: 94,
    name: 'Gengar',
    types: ['ghost', 'poison'],
    category: 'Shadow',
    heightM: 1.5,
    weightKg: 40.5,
    level: 48,
    abilities: ['Cursed Body'],
    moves: [
      { id: 'm1', name: 'Shadow Ball', type: 'ghost' },
      { id: 'm2', name: 'Sludge Bomb', type: 'poison' },
      { id: 'm3', name: 'Hypnosis', type: 'psychic' },
    ],
    evolution: '—',
    description: 'It hides in shadows and steals heat from prey.',
  },
  {
    dexId: 130,
    name: 'Gyarados',
    types: ['water', 'flying'],
    category: 'Atrocious',
    heightM: 6.5,
    weightKg: 235.0,
    level: 42,
    abilities: ['Intimidate'],
    moves: [
      { id: 'm1', name: 'Hyper Beam', type: 'normal' },
      { id: 'm2', name: 'Aqua Tail', type: 'water' },
      { id: 'm3', name: 'Dragon Dance', type: 'dragon' },
    ],
    evolution: '—',
    description: 'Once it appears, it rampages destructively.',
  },
  {
    dexId: 143,
    name: 'Snorlax',
    types: ['normal'],
    category: 'Sleeping',
    heightM: 2.1,
    weightKg: 460.0,
    level: 40,
    abilities: ['Immunity', 'Thick Fat'],
    moves: [
      { id: 'm1', name: 'Body Slam', type: 'normal' },
      { id: 'm2', name: 'Rest', type: 'psychic' },
      { id: 'm3', name: 'Earthquake', type: 'ground' },
    ],
    evolution: '—',
    description: 'It is not satisfied unless it eats over 400 kg a day.',
  },
  {
    dexId: 150,
    name: 'Mewtwo',
    types: ['psychic'],
    category: 'Genetic',
    heightM: 2.0,
    weightKg: 122.0,
    level: 70,
    abilities: ['Pressure'],
    moves: [
      { id: 'm1', name: 'Psychic', type: 'psychic' },
      { id: 'm2', name: 'Aura Sphere', type: 'fighting' },
      { id: 'm3', name: 'Shadow Ball', type: 'ghost' },
    ],
    evolution: '—',
    description: 'A Pokémon created by genetic manipulation.',
  },
  {
    dexId: 254,
    name: 'Sceptile',
    types: ['grass'],
    category: 'Forest',
    heightM: 1.7,
    weightKg: 52.2,
    level: 52,
    abilities: ['Overgrow'],
    moves: [
      { id: 'm1', name: 'Leaf Blade', type: 'grass' },
      { id: 'm2', name: 'Dragon Claw', type: 'dragon' },
      { id: 'm3', name: 'X-Scissor', type: 'bug' },
    ],
    evolution: '—',
    description: 'The leaves on its arms are sharper than swords.',
  },
  {
    dexId: 260,
    name: 'Swampert',
    types: ['water', 'ground'],
    category: 'Mud Fish',
    heightM: 1.5,
    weightKg: 81.9,
    level: 50,
    abilities: ['Torrent'],
    moves: [
      { id: 'm1', name: 'Muddy Water', type: 'water' },
      { id: 'm2', name: 'Earthquake', type: 'ground' },
      { id: 'm3', name: 'Ice Beam', type: 'ice' },
    ],
    evolution: '—',
    description: 'It can predict storms by sensing subtle differences.',
  },
]

function buildCatalog(): PokedexEntry[] {
  const byId = new Map(DISCOVERED.map((entry) => [entry.dexId, entry]))
  const catalog: PokedexEntry[] = []

  for (let dexId = 1; dexId <= POKEDEX_TOTAL; dexId++) {
    const known = byId.get(dexId)
    if (known) {
      catalog.push({ ...known, discovered: true })
    } else {
      catalog.push({ dexId, discovered: false })
    }
  }

  return catalog
}

export const mockPokedexCatalog = buildCatalog()

export const mockPokedexDiscoveredCount = DISCOVERED.length
