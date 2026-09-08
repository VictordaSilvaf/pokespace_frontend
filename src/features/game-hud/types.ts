export type Peke = {
  id: string
  name: string
  /** National dex id (1–386 for gen 1–3). */
  dexId: number
  /** Local portrait for the HUD. */
  spriteUrl: string
  /** Follower sprite (portrait until creature walk sheets are mapped). */
  walkSpriteUrl: string
  hp: number
  maxHp: number
  bonus: number
  fainted: boolean
}
