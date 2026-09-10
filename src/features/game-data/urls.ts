/** Public CDN / static base for game sprites (no trailing slash). */
export function assetsBaseUrl(): string {
  const fromEnv = (import.meta.env.VITE_ASSETS_BASE_URL as string | undefined)
    ?.trim()
    .replace(/\/+$/, '')
  if (fromEnv) return fromEnv
  // Local Vite public/ fallback when CDN env is unset (dev extract only).
  return '/assets'
}

/** Join CDN/static base with a registry-relative path (`sprites/creature/376.png`). */
export function resolveAssetPath(path: string): string {
  const cleaned = path.replace(/^\/+/, '')
  if (/^https?:\/\//i.test(cleaned)) return cleaned
  const base = assetsBaseUrl()
  if (base.startsWith('http://') || base.startsWith('https://')) {
    return `${base}/${cleaned}`
  }
  // base is `/assets` → `/assets/sprites/...`
  if (cleaned.startsWith('assets/')) return `/${cleaned}`
  return `${base}/${cleaned}`
}

export const UI_SKINS_BASE = '/assets/ui/skins'
export const SPRITES_ITEM_BASE = `${assetsBaseUrl()}/sprites/item`
export const SPRITES_CREATURE_BASE = `${assetsBaseUrl()}/sprites/creature`

export const EMPTY_SPRITE_URL = `${UI_SKINS_BASE}/None.png`

/** Local portrait sheet for a catalog portrait item id. */
export function portraitUrl(portraitId: number | null | undefined): string {
  if (portraitId == null || portraitId <= 0) return EMPTY_SPRITE_URL
  return resolveAssetPath(`sprites/item/${portraitId}.png`)
}
