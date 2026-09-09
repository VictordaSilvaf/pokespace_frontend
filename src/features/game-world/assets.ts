/** Public paths for game-world assets. Official map = DarkXPoke OTBM crop. */

export const GAME_BASE = '/assets/world'
export const OT_MAP_URL = `${GAME_BASE}/maps/starter.tmx`
export const OT_TILESET_IMAGE = `${GAME_BASE}/tilesets/overworld.png`
export const OT_TILESET_META_URL = `${GAME_BASE}/tilesets/overworld.json`

export const OT_TILE_SIZE = 32
export const TILE_SIZE = OT_TILE_SIZE
export const TILESET_COLUMNS = 12
export const TILESET_SPACING = 1
export const TILESET_FIRST_GID = 1

/** @deprecated Prefer resolveWorldAssets() */
export const SAMPLE_MAP_URL = OT_MAP_URL
/** @deprecated Prefer resolveWorldAssets() */
export const TILESET_IMAGE = OT_TILESET_IMAGE

export type WorldAssets = {
  mapUrl: string
  useOt: boolean
  fallbackTilesetImage: string
  preferredScale: number
  playerSize: number
}

/** Always prefer the PokeTibia/DarkXPoke starter map from ./server + ./client. */
export async function resolveWorldAssets(): Promise<WorldAssets> {
  try {
    const res = await fetch(OT_MAP_URL, { method: 'GET', cache: 'no-cache' })
    if (res.ok) {
      const text = await res.text()
      if (text.includes('<map') && /tilewidth="32"/.test(text)) {
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

  throw new Error(
    'Missing PokeTibia starter map. Run: pnpm ot:map -- --x … --y … --w 96 --h 96 --z 7',
  )
}
