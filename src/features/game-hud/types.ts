export type Peke = {
  id: string
  name: string
  /** National dex id (1–386 for gen 1–3). */
  dexId: number
  /** Local creature sheet id when known. */
  creatureId: number | null
  /** Sheet URL (full walk sheet PNG). */
  spriteUrl: string
  /** Same sheet used for world follower animation. */
  walkSpriteUrl: string
  hp: number
  maxHp: number
  bonus: number
  fainted: boolean
}
