/** Tiled flip / rotate flags packed into GIDs. */
export const FLIPPED_HORIZONTALLY = 0x80000000
export const FLIPPED_VERTICALLY = 0x40000000
export const FLIPPED_DIAGONALLY = 0x20000000
const GID_MASK = ~(FLIPPED_HORIZONTALLY | FLIPPED_VERTICALLY | FLIPPED_DIAGONALLY)

export type TilesetDef = {
  firstGid: number
  name: string
  tileWidth: number
  tileHeight: number
  columns: number
  spacing: number
  margin: number
  tilecount: number
  imageSource: string
  imageWidth: number
  imageHeight: number
  /** Local tile ids marked solid=true in the tileset. */
  solidLocalIds: Set<number>
  image: HTMLImageElement | null
}

export type TileGid = {
  raw: number
  /** GID without flip flags (0 when empty). */
  gid: number
  /** Local tileset index (0-based), or -1 when empty. */
  localId: number
  /** Index into TileMap.tilesets, or -1 when empty. */
  tilesetIndex: number
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

export type MapObject = {
  id: number
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
  properties: Record<string, string | number | boolean>
}

export type TileMap = {
  width: number
  height: number
  tileWidth: number
  tileHeight: number
  layers: MapLayer[]
  /** Layers that should be drawn (excludes Collision). */
  drawLayers: MapLayer[]
  tilesets: TilesetDef[]
  objects: MapObject[]
}

function resolveUrl(baseUrl: string, relative: string): string {
  return new URL(relative, baseUrl).toString()
}

function dirnameUrl(url: string): string {
  const i = url.lastIndexOf('/')
  return i >= 0 ? url.slice(0, i + 1) : url
}

function parseProperties(el: Element | null): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  if (!el) return out
  for (const prop of el.querySelectorAll(':scope > properties > property, :scope > property')) {
    const name = prop.getAttribute('name')
    if (!name) continue
    const type = prop.getAttribute('type') ?? 'string'
    const raw = prop.getAttribute('value') ?? prop.textContent ?? ''
    if (type === 'bool') out[name] = raw === 'true'
    else if (type === 'int' || type === 'float') out[name] = Number(raw)
    else out[name] = raw
  }
  return out
}

function findTilesetIndex(tilesets: TilesetDef[], gid: number): number {
  let best = -1
  for (let i = 0; i < tilesets.length; i++) {
    if (gid >= tilesets[i].firstGid) best = i
  }
  return best
}

export function decodeGid(raw: number, tilesets: TilesetDef[]): TileGid {
  if (raw === 0) {
    return {
      raw: 0,
      gid: 0,
      localId: -1,
      tilesetIndex: -1,
      flipH: false,
      flipV: false,
      flipD: false,
    }
  }

  const gid = raw & GID_MASK
  const tilesetIndex = findTilesetIndex(tilesets, gid)
  const firstGid = tilesetIndex >= 0 ? tilesets[tilesetIndex].firstGid : 1
  return {
    raw,
    gid,
    localId: tilesetIndex >= 0 ? gid - firstGid : -1,
    tilesetIndex,
    flipH: (raw & FLIPPED_HORIZONTALLY) !== 0,
    flipV: (raw & FLIPPED_VERTICALLY) !== 0,
    flipD: (raw & FLIPPED_DIAGONALLY) !== 0,
  }
}

function parseCsvLayer(
  csv: string,
  width: number,
  height: number,
  name: string,
  tilesets: TilesetDef[],
): MapLayer {
  // Tiled CSV is comma-separated; rows may use newlines with or without a
  // trailing comma. Treat commas and whitespace as separators so a missing
  // comma between rows does not glue two GIDs into one cell.
  const tiles = csv
    .trim()
    .split(/[,\s]+/)
    .filter((cell) => cell.length > 0)
    .map((cell) => decodeGid(Number(cell), tilesets))

  if (tiles.length !== width * height) {
    throw new Error(
      `Layer "${name}" expected ${width * height} tiles, got ${tiles.length}`,
    )
  }

  return { name, width, height, tiles }
}

function parseTilesetElement(tilesetEl: Element, mapDir: string): TilesetDef {
  const firstGid = Number(tilesetEl.getAttribute('firstgid') ?? 1)
  const name = tilesetEl.getAttribute('name') ?? 'tileset'
  const tileWidth = Number(tilesetEl.getAttribute('tilewidth') ?? 16)
  const tileHeight = Number(tilesetEl.getAttribute('tileheight') ?? 16)
  const tilecount = Number(tilesetEl.getAttribute('tilecount') ?? 0)
  const columnsAttr = Number(tilesetEl.getAttribute('columns') ?? 0)
  const spacing = Number(tilesetEl.getAttribute('spacing') ?? 0)
  const margin = Number(tilesetEl.getAttribute('margin') ?? 0)

  const imageEl = tilesetEl.querySelector('image')
  const imageSourceRel = imageEl?.getAttribute('source') ?? ''
  const imageWidth = Number(imageEl?.getAttribute('width') ?? 0)
  const imageHeight = Number(imageEl?.getAttribute('height') ?? 0)
  const imageSource = imageSourceRel ? resolveUrl(mapDir, imageSourceRel) : ''

  const columns =
    columnsAttr ||
    (imageWidth > 0
      ? Math.floor((imageWidth - margin + spacing) / (tileWidth + spacing))
      : 1)

  const solidLocalIds = new Set<number>()
  for (const tileEl of tilesetEl.querySelectorAll(':scope > tile')) {
    const id = Number(tileEl.getAttribute('id') ?? -1)
    if (id < 0) continue
    const props = parseProperties(tileEl)
    if (props.solid === true || props.solid === 'true') {
      solidLocalIds.add(id)
    }
  }

  return {
    firstGid,
    name,
    tileWidth,
    tileHeight,
    columns: Math.max(1, columns),
    spacing,
    margin,
    tilecount,
    imageSource,
    imageWidth,
    imageHeight,
    solidLocalIds,
    image: null,
  }
}

async function loadExternalTileset(
  sourceUrl: string,
  firstGid: number,
): Promise<TilesetDef> {
  const response = await fetch(sourceUrl)
  if (!response.ok) {
    throw new Error(`Failed to load tileset ${sourceUrl}: ${response.status}`)
  }
  const xml = await response.text()
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const tilesetEl = doc.querySelector('tileset')
  if (!tilesetEl) {
    throw new Error(`Invalid TSX: missing <tileset> in ${sourceUrl}`)
  }
  // Inject firstgid from the map reference (external TSX does not include it).
  tilesetEl.setAttribute('firstgid', String(firstGid))
  return parseTilesetElement(tilesetEl, dirnameUrl(sourceUrl))
}

function parseObjectGroups(mapEl: Element): MapObject[] {
  const objects: MapObject[] = []
  for (const group of mapEl.querySelectorAll('objectgroup')) {
    for (const obj of group.querySelectorAll(':scope > object')) {
      objects.push({
        id: Number(obj.getAttribute('id') ?? 0),
        name: obj.getAttribute('name') ?? '',
        type: obj.getAttribute('type') ?? obj.getAttribute('class') ?? '',
        x: Number(obj.getAttribute('x') ?? 0),
        y: Number(obj.getAttribute('y') ?? 0),
        width: Number(obj.getAttribute('width') ?? 0),
        height: Number(obj.getAttribute('height') ?? 0),
        properties: parseProperties(obj),
      })
    }
  }
  return objects
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

export async function loadTmxMap(url: string): Promise<TileMap> {
  const absoluteUrl = new URL(url, window.location.origin).toString()
  const response = await fetch(absoluteUrl, { cache: 'no-cache' })
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
  const tileWidth = Number(mapEl.getAttribute('tilewidth') ?? 16)
  const tileHeight = Number(mapEl.getAttribute('tileheight') ?? 16)
  const mapDir = dirnameUrl(absoluteUrl)

  const tilesets: TilesetDef[] = []
  for (const tilesetEl of mapEl.querySelectorAll(':scope > tileset')) {
    const firstGid = Number(tilesetEl.getAttribute('firstgid') ?? 1)
    const source = tilesetEl.getAttribute('source')
    if (source) {
      tilesets.push(await loadExternalTileset(resolveUrl(mapDir, source), firstGid))
    } else {
      tilesets.push(parseTilesetElement(tilesetEl, mapDir))
    }
  }

  await Promise.all(
    tilesets.map(async (ts) => {
      if (!ts.imageSource) return
      ts.image = await loadImage(ts.imageSource)
    }),
  )

  const layers: MapLayer[] = []
  for (const layerEl of mapEl.querySelectorAll(':scope > layer')) {
    const name = layerEl.getAttribute('name') ?? 'layer'
    const dataEl = layerEl.querySelector('data')
    if (!dataEl?.textContent) continue
    if (dataEl.getAttribute('encoding') !== 'csv') {
      throw new Error(`Unsupported encoding on layer "${name}"`)
    }
    layers.push(
      parseCsvLayer(dataEl.textContent, width, height, name, tilesets),
    )
  }

  const objects = parseObjectGroups(mapEl)
  const drawLayers = layers.filter(
    (layer) => layer.name.toLowerCase() !== 'collision',
  )

  return {
    width,
    height,
    tileWidth,
    tileHeight,
    layers,
    drawLayers,
    tilesets,
    objects,
  }
}

export function tilesetSourceRect(
  tileset: TilesetDef,
  localId: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const col = localId % tileset.columns
  const row = Math.floor(localId / tileset.columns)
  const strideX = tileset.tileWidth + tileset.spacing
  const strideY = tileset.tileHeight + tileset.spacing
  return {
    sx: tileset.margin + col * strideX,
    sy: tileset.margin + row * strideY,
    sw: tileset.tileWidth,
    sh: tileset.tileHeight,
  }
}

export function drawTile(
  ctx: CanvasRenderingContext2D,
  map: TileMap,
  tile: TileGid,
  dx: number,
  dy: number,
  size?: number,
) {
  if (tile.localId < 0 || tile.tilesetIndex < 0) return
  const tileset = map.tilesets[tile.tilesetIndex]
  if (!tileset?.image) return

  const drawSize = size ?? map.tileWidth
  const { sx, sy, sw, sh } = tilesetSourceRect(tileset, tile.localId)
  ctx.save()
  ctx.translate(dx + drawSize / 2, dy + drawSize / 2)

  if (tile.flipD) {
    ctx.rotate(Math.PI / 2)
    ctx.scale(1, -1)
  }
  if (tile.flipH) ctx.scale(-1, 1)
  if (tile.flipV) ctx.scale(1, -1)

  ctx.drawImage(
    tileset.image,
    sx,
    sy,
    sw,
    sh,
    -drawSize / 2,
    -drawSize / 2,
    drawSize,
    drawSize,
  )
  ctx.restore()
}

/** Floor / bridge local IDs — Kenney Tiny Dungeon only (no Collision layer). */
const LEGACY_KENNEY_WALKABLE = new Set([
  36, 37, 38, 42, 48, 49, 50, 51, 52, 53,
])

function hasSolidMetadata(map: TileMap): boolean {
  return map.tilesets.some((ts) => ts.solidLocalIds.size > 0)
}

function collisionLayer(map: TileMap): MapLayer | undefined {
  return map.layers.find((layer) => layer.name.toLowerCase() === 'collision')
}

export function isSolidAt(map: TileMap, tileX: number, tileY: number): boolean {
  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return true
  }

  const index = tileY * map.width + tileX
  const collision = collisionLayer(map)
  if (collision) {
    const tile = collision.tiles[index]
    return Boolean(tile && tile.localId >= 0)
  }

  if (hasSolidMetadata(map)) {
    for (const layer of map.drawLayers) {
      const tile = layer.tiles[index]
      if (!tile || tile.localId < 0 || tile.tilesetIndex < 0) continue
      const ts = map.tilesets[tile.tilesetIndex]
      if (ts?.solidLocalIds.has(tile.localId)) return true
    }
    return false
  }

  // Legacy Kenney sample: walkable floors on "Dungeon" layer.
  const dungeon = map.layers.find((layer) => layer.name === 'Dungeon')
  if (!dungeon) return false
  const tile = dungeon.tiles[index]
  if (!tile || tile.localId < 0) return true
  return !LEGACY_KENNEY_WALKABLE.has(tile.localId)
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

export function findSpawnPoint(
  map: TileMap,
): { x: number; y: number } | null {
  const spawn = map.objects.find(
    (obj) =>
      obj.name === 'player_spawn' ||
      obj.type === 'player_spawn' ||
      obj.properties.spawn === true,
  )
  if (spawn) {
    return { x: spawn.x, y: spawn.y }
  }

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (!isSolidAt(map, x, y)) {
        return {
          x: x * map.tileWidth,
          y: y * map.tileHeight,
        }
      }
    }
  }
  return null
}
