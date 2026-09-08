export type Peke = {
  id: string
  name: string
  /** National dex id (1–386 for gen 1–3). */
  dexId: number
  /** Static portrait for the HUD. */
  spriteUrl: string
  /** Animated Showdown GIF used as the world follower. */
  walkSpriteUrl: string
  hp: number
  maxHp: number
  bonus: number
  fainted: boolean
}
