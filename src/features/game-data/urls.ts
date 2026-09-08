export const UI_SKINS_BASE = '/assets/ui/skins'
export const SPRITES_ITEM_BASE = '/assets/sprites/item'
export const SPRITES_CREATURE_BASE = '/assets/sprites/creature'

export const EMPTY_SPRITE_URL = `${UI_SKINS_BASE}/None.png`

/** Local portrait sheet for a catalog portrait item id. */
export function portraitUrl(portraitId: number | null | undefined): string {
  if (portraitId == null || portraitId <= 0) return EMPTY_SPRITE_URL
  return `${SPRITES_ITEM_BASE}/${portraitId}.png`
}
