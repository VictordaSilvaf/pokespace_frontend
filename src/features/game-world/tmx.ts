import {
  TILE_SIZE,
  TILESET_COLUMNS,
  TILESET_FIRST_GID,
  TILESET_SPACING,
} from './assets'

/** Tiled flip / rotate flags packed into GIDs. */
export const FLIPPED_HORIZONTALLY = 0x80000000
export const FLIPPED_VERTICALLY = 0x40000000
export const FLIPPED_DIAGONALLY = 0x20000000
const GID_MASK = ~(FLIPPED_HORIZONTALLY | FLIPPED_VERTICALLY | FLIPPED_DIAGONALLY)

export type TileGid = {
  raw: number
  /** Local tileset index (0-based), or -1 when empty. */
  localId: number
  flipH: boolean
  flipV: boolean
  flipD: boolean
}

export type MapLayer = {
  name: string
  width: number
  height: number
  tiles: TileGid[]
}

export type TileMap = {
  width: number
  height: number
  tileWidth: number
  tileHeight: number
  layers: MapLayer[]
}

export function decodeGid(raw: number): TileGid {
  if (raw === 0) {
    return { raw: 0, localId: -1, flipH: false, flipV: false, flipD: false }
  }

  const gid = raw & GID_MASK
  return {
    raw,
    localId: gid - TILESET_FIRST_GID,
    flipH: (raw & FLIPPED_HORIZONTALLY) !== 0,
    flipV: (raw & FLIPPED_VERTICALLY) !== 0,
    flipD: (raw & FLIPPED_DIAGONALLY) !== 0,
  }
}

function parseCsvLayer(csv: string, width: number, height: number, name: string): MapLayer {
  const tiles = csv
    .trim()
    .split(',')
    .map((cell) => decodeGid(Number(cell.trim())))

  if (tiles.length !== width * height) {
    throw new Error(
      `Layer "${name}" expected ${width * height} tiles, got ${tiles.length}`,
    )
  }

  return { name, width, height, tiles }
}

export async function loadTmxMap(url: string): Promise<TileMap> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load map ${url}: ${response.status}`)
  }

  const xml = await response.text()
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const mapEl = doc.querySelector('map')
  if (!mapEl) {
    throw new Error(`Invalid TMX: missing <map> in ${url}`)
  }

  const width = Number(mapEl.getAttribute('width'))
  const height = Number(mapEl.getAttribute('height'))
  const tileWidth = Number(mapEl.getAttribute('tilewidth') ?? TILE_SIZE)
  const tileHeight = Number(mapEl.getAttribute('tileheight') ?? TILE_SIZE)

  const layers: MapLayer[] = []
  for (const layerEl of mapEl.querySelectorAll('layer')) {
    const name = layerEl.getAttribute('name') ?? 'layer'
    const dataEl = layerEl.querySelector('data')
    if (!dataEl?.textContent) continue
    if (dataEl.getAttribute('encoding') !== 'csv') {
      throw new Error(`Unsupported encoding on layer "${name}"`)
    }
    layers.push(parseCsvLayer(dataEl.textContent, width, height, name))
  }

  return { width, height, tileWidth, tileHeight, layers }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image ${src}`))
    img.src = src
  })
}

export function tilesetSourceRect(localId: number): {
  sx: number
  sy: number
  sw: number
  sh: number
} {
  const col = localId % TILESET_COLUMNS
  const row = Math.floor(localId / TILESET_COLUMNS)
  const stride = TILE_SIZE + TILESET_SPACING
  return {
    sx: col * stride,
    sy: row * stride,
    sw: TILE_SIZE,
    sh: TILE_SIZE,
  }
}

export function drawTile(
  ctx: CanvasRenderingContext2D,
  tileset: HTMLImageElement,
  tile: TileGid,
  dx: number,
  dy: number,
  size: number = TILE_SIZE,
) {
  if (tile.localId < 0) return

  const { sx, sy, sw, sh } = tilesetSourceRect(tile.localId)
  ctx.save()
  ctx.translate(dx + size / 2, dy + size / 2)

  if (tile.flipD) {
    ctx.rotate(Math.PI / 2)
    ctx.scale(1, -1)
  }
  if (tile.flipH) ctx.scale(-1, 1)
  if (tile.flipV) ctx.scale(1, -1)

  ctx.drawImage(tileset, sx, sy, sw, sh, -size / 2, -size / 2, size, size)
  ctx.restore()
}

/** Floor / bridge local IDs in the Kenney Tiny Dungeon sample map. */
const WALKABLE_LOCAL_IDS = new Set([
  36, 37, 38, // wood bridge
  42, // floor accent
  48, 49, 50, 51, 52, 53, // stone / dirt floors
])

export function isSolidAt(map: TileMap, tileX: number, tileY: number): boolean {
  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return true
  }

  const dungeon = map.layers.find((layer) => layer.name === 'Dungeon')
  if (!dungeon) return false

  const tile = dungeon.tiles[tileY * map.width + tileX]
  if (!tile || tile.localId < 0) return true

  return !WALKABLE_LOCAL_IDS.has(tile.localId)
}

export function rectHitsSolid(
  map: TileMap,
  x: number,
  y: number,
  w: number,
  h: number,
): boolean {
  const left = Math.floor(x / map.tileWidth)
  const right = Math.floor((x + w - 0.001) / map.tileWidth)
  const top = Math.floor(y / map.tileHeight)
  const bottom = Math.floor((y + h - 0.001) / map.tileHeight)

  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      if (isSolidAt(map, tx, ty)) return true
    }
  }
  return false
}
