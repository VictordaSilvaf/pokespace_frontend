export type TeamMember = {
  id: string
  name: string
  level: number
  spriteId: number
  power: number
  hp: number
  maxHp: number
}

export type ActionMenuItem = {
  id: string
  label: string
  badge?: string
  tone: 'gold' | 'sky' | 'energy' | 'gem' | 'bag' | 'boost' | 'alert'
}

export const player = {
  name: 'Otaka',
  level: 1,
  avatarId: 25,
  hp: 220,
  maxHp: 230,
  gold: 13973,
  premium: 133.53,
}

export const team: Array<TeamMember | null> = [
  {
    id: '1',
    name: 'Pikachu',
    level: 1,
    spriteId: 25,
    power: 1320,
    hp: 72,
    maxHp: 80,
  },
  {
    id: '2',
    name: 'Squirtle',
    level: 1,
    spriteId: 7,
    power: 980,
    hp: 90,
    maxHp: 90,
  },
  {
    id: '3',
    name: 'Charmander',
    level: 1,
    spriteId: 4,
    power: 1100,
    hp: 65,
    maxHp: 70,
  },
  {
    id: '4',
    name: 'Bulbasaur',
    level: 1,
    spriteId: 1,
    power: 1050,
    hp: 80,
    maxHp: 85,
  },
  null,
]

export const actionMenu: ActionMenuItem[] = [
  { id: 'shop', label: 'Loja', tone: 'gold' },
  { id: 'explore', label: 'Explorar', tone: 'sky' },
  { id: 'energy', label: 'Energia', tone: 'energy' },
  { id: 'gems', label: 'Gemas', tone: 'gem' },
  { id: 'bag-a', label: 'Mochila', badge: '40', tone: 'bag' },
  { id: 'bag-b', label: 'Itens', badge: '20', tone: 'bag' },
  { id: 'boost', label: 'Boost', badge: 'x2', tone: 'boost' },
]

export const mapUnits = [
  { id: 'u1', spriteId: 19, x: 18, y: 42, hp: 0.7 },
  { id: 'u2', spriteId: 16, x: 38, y: 28, hp: 0.9 },
  { id: 'u3', spriteId: 10, x: 52, y: 48, hp: 0.45 },
  { id: 'u4', spriteId: 27, x: 68, y: 34, hp: 0.8 },
  { id: 'u5', spriteId: 37, x: 78, y: 58, hp: 0.6 },
]

export function spriteUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

export function formatGold(value: number) {
  return value.toLocaleString('pt-BR')
}

export function formatPremium(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
