/** Public paths for game-world assets. PokeTibia/OT primary, Kenney last-resort. */

export const GAME_BASE = '/assets/world'
/** Playable default: blank placeholder (96×96) until maps are drawn. OT crop kept in starter-otbm.tmx. */
export const OT_MAP_URL = `${GAME_BASE}/maps/starter.tmx`
export const OT_TILESET_IMAGE = `${GAME_BASE}/tilesets/overworld.png`
export const OT_TILESET_META_URL = `${GAME_BASE}/tilesets/overworld.json`

/** Kenney Tiny Town / Tiny Dungeon — offline fallback only. */
export const KENNEY_BASE = '/assets/world/kenney'
export const KENNEY_MAP_URL = `${KENNEY_BASE}/tiled/sampleMap.tmx`
export const KENNEY_TILESET_IMAGE = `${KENNEY_BASE}/tilemap/tilemap.png`
export const KENNEY_STARTER_URL = `${GAME_BASE}/maps/starter-kenney.tmx`

/** @deprecated Prefer resolveWorldAssets(); kept for callers that need a static URL. */
export const SAMPLE_MAP_URL = OT_MAP_URL
/** @deprecated Prefer resolveWorldAssets(). */
export const TILESET_IMAGE = OT_TILESET_IMAGE

export const OT_TILE_SIZE = 32
export const KENNEY_TILE_SIZE = 16
export const TILE_SIZE = OT_TILE_SIZE
export const TILESET_COLUMNS = 12
export const TILESET_SPACING = 1
export const TILESET_FIRST_GID = 1

export type WorldAssets = {
  mapUrl: string
  /** True when PokeTibia/OT starter map is in use. */
  useOt: boolean
  /** Fallback tileset image when the TMX does not load its own. */
  fallbackTilesetImage: string
  preferredScale: number
  playerSize: number
}

function isOtMapXml(text: string): boolean {
  return (
    text.includes('<map') &&
    (/tilewidth="32"/.test(text) || /tilewidth='32'/.test(text)) &&
    (text.includes('overworld') || text.includes('Collision'))
  )
}

/** Prefer PokeTibia OT crop; Kenney only if OT map/tileset missing. */
export async function resolveWorldAssets(): Promise<WorldAssets> {
  try {
    const res = await fetch(OT_MAP_URL, { method: 'GET', cache: 'no-cache' })
    if (res.ok) {
      const text = await res.text()
      if (isOtMapXml(text)) {
        return {
          mapUrl: OT_MAP_URL,
          useOt: true,
          fallbackTilesetImage: OT_TILESET_IMAGE,
          preferredScale: 2,
          playerSize: 20,
        }
      }
    }
  } catch {
    // fall through
  }

  for (const url of [KENNEY_STARTER_URL, KENNEY_MAP_URL]) {
    try {
      const res = await fetch(url, { method: 'GET', cache: 'no-cache' })
      if (res.ok) {
        const text = await res.text()
        if (text.includes('<map')) {
          return {
            mapUrl: url,
            useOt: false,
            fallbackTilesetImage: KENNEY_TILESET_IMAGE,
            preferredScale: 3,
            playerSize: 10,
          }
        }
      }
    } catch {
      // try next
    }
  }

  return {
    mapUrl: KENNEY_MAP_URL,
    useOt: false,
    fallbackTilesetImage: KENNEY_TILESET_IMAGE,
    preferredScale: 3,
    playerSize: 10,
  }
}
