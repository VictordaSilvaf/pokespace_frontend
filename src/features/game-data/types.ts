export type CatalogMoveRef = {
  name: string
  interval: number | null
  isTarget: boolean
  range: number | null
}

export type CatalogEvolution = {
  name: string
  level: number | null
  chance: number | null
  itemName: string | null
  count: number | null
}

export type CatalogPokemon = {
  id: string
  name: string
  file: string
  dexId: number
  types: string[]
  lookType: number | null
  portraitId: number | null
  levelMin: number | null
  levelMax: number | null
  hp: number | null
  experience: number | null
  speed: number | null
  hasShiny: boolean
  hasMega: boolean
  flyable: number
  rideable: number
  surfable: number
  catchChance: number | null
  moves: CatalogMoveRef[]
  evolutions: CatalogEvolution[]
}

export type CatalogSpell = {
  name: string
  kind: string
  group: string | null
  words: string | null
  script: string | null
  aggressive: boolean
  needLearn: boolean
  direction: boolean
  blockWalls: boolean
}

export type CatalogNpc = {
  id: string
  name: string
  file: string
  lookType: number | null
  greet: string | null
  decline: string | null
  script: string | null
}
