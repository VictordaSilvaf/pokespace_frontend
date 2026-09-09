#!/usr/bin/env node
/**
 * Build overworld atlas from local padventures item sprites
 * (public/assets/sprites/item/{id}.png) — no Tibia.dat/spr required.
 *
 * OTBM / items.xml use *server* IDs. Sprites are keyed by *client* IDs from
 * items.otb — we resolve that mapping before slicing sheets.
 *
 * Usage:
 *   pnpm ot:extract:local
 *   pnpm ot:extract:local -- --only-used
 */
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'
import { OTBReader } from '@v0rt4c/otb'

import {
  OUT_MAPS,
  OUT_TILESETS,
  PIPELINE_CACHE,
  ROOT,
  SERVER_DATA,
  TILE_SIZE,
  ensureDirs,
  parseArgs,
} from './paths.mjs'

const args = parseArgs(process.argv.slice(2))
const onlyUsed = Boolean(args['only-used'])
const maxItems = args.max ? Number(args.max) : Infinity

const SPRITES_ITEM = path.join(ROOT, 'public/assets/sprites/item')
const ITEMS_XML = path.join(SERVER_DATA, 'items/items.xml')
const ITEMS_OTB = path.join(SERVER_DATA, 'items/items.otb')
const META_PATH = path.join(ROOT, 'public/assets/sprite-meta/metadata.json')

/** Fallback outdoor grass when the mapped client sprite is missing / creature-like. */
const FALLBACK_GRASS_ASSET = 2400
const FALLBACK_FLOOR_ASSET = 409

ensureDirs()

/** @type {Set<number> | null} */
let allowedIds = null
const usedIdsPath = path.join(PIPELINE_CACHE, 'used-ids.json')
if (onlyUsed) {
  if (!fs.existsSync(usedIdsPath)) {
    throw new Error(
      `--only-used requires ${usedIdsPath}. Run: pnpm ot:map -- --scan`,
    )
  }
  allowedIds = new Set(JSON.parse(fs.readFileSync(usedIdsPath, 'utf8')).ids)
  console.log(`Restricting to ${allowedIds.size} used IDs`)
}

const spriteMeta = fs.existsSync(META_PATH)
  ? JSON.parse(fs.readFileSync(META_PATH, 'utf8')).things
  : {}

/** @type {Map<number, number>} serverId → clientId */
const serverToClient = new Map()
if (fs.existsSync(ITEMS_OTB)) {
  const root = new OTBReader(new Uint8Array(fs.readFileSync(ITEMS_OTB))).parse()
  const probe = allowedIds
    ? [...allowedIds]
    : Array.from({ length: 40000 }, (_, i) => i + 1)
  let mapped = 0
  for (const sid of probe) {
    const item = root.getItemByServerId(sid)
    if (item && typeof item.clientId === 'number') {
      serverToClient.set(sid, item.clientId)
      mapped++
    }
  }
  console.log(`Loaded items.otb mappings: ${mapped}`)
} else {
  console.warn('No items.otb — using server IDs as sprite IDs (likely wrong)')
}

const itemNames = new Map()
const solidIds = new Set()
if (fs.existsSync(ITEMS_XML)) {
  const xml = fs.readFileSync(ITEMS_XML, 'utf8')
  const itemRe = /<item\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/item>)/g
  let match
  while ((match = itemRe.exec(xml))) {
    const attrs = match[1]
    const body = match[2] ?? ''
    const idMatch = /\bid="(\d+)"/.exec(attrs)
    const fromMatch = /\bfromid="(\d+)"/.exec(attrs)
    const toMatch = /\btoid="(\d+)"/.exec(attrs)
    const nameMatch = /\bname="([^"]*)"/.exec(attrs)
    const name = nameMatch?.[1] ?? ''
    const blocking =
      /key="blocking"\s+value="1"/.test(body) ||
      /key="blocksolid"\s+value="1"/.test(body) ||
      /\bblocksolid="1"/.test(attrs)

    const apply = (id) => {
      if (name) itemNames.set(id, name)
      if (blocking) solidIds.add(id)
    }

    if (idMatch) apply(Number(idMatch[1]))
    else if (fromMatch && toMatch) {
      const from = Number(fromMatch[1])
      const to = Number(toMatch[1])
      for (let id = from; id <= to; id++) apply(id)
    }
  }
  console.log(
    `Loaded ${itemNames.size} names, ${solidIds.size} blocking from items.xml`,
  )
}

/**
 * OTClient ThingType::getSpriteIndex:
 * (((((phase * pz + z) * py + y) * px + x) * layers + layer) * h + hy) * w + wx
 */
function spriteIndex(g, wx, hy, layer, patX, patY, patZ, phase) {
  return (
    (((((phase * g.pz + patZ) * g.py + patY) * g.px + patX) * g.layers +
      layer) *
      g.h +
      hy) *
      g.w +
    wx
  )
}

function defaultGeometry(png) {
  const cols = Math.max(1, Math.floor(png.width / TILE_SIZE))
  const rows = Math.max(1, Math.floor(png.height / TILE_SIZE))
  return {
    type: 0,
    w: 1,
    h: 1,
    layers: 1,
    px: Math.min(cols, 8),
    py: Math.min(rows, 8),
    pz: 1,
    phases: 1,
    realSize: null,
    animator: null,
    nSprites: Math.min(cols * rows, 64),
  }
}

function readCell(png, cellIndex) {
  const cols = Math.max(1, Math.floor(png.width / TILE_SIZE))
  const col = cellIndex % cols
  const row = Math.floor(cellIndex / cols)
  const ox = col * TILE_SIZE
  const oy = row * TILE_SIZE
  const rgba = Buffer.alloc(TILE_SIZE * TILE_SIZE * 4)
  for (let y = 0; y < TILE_SIZE; y++) {
    for (let x = 0; x < TILE_SIZE; x++) {
      const sx = ox + x
      const sy = oy + y
      const di = (y * TILE_SIZE + x) * 4
      if (sx >= png.width || sy >= png.height) continue
      const si = (sy * png.width + sx) * 4
      rgba[di] = png.data[si]
      rgba[di + 1] = png.data[si + 1]
      rgba[di + 2] = png.data[si + 2]
      rgba[di + 3] = png.data[si + 3]
    }
  }
  return rgba
}

function cellOpaqueCount(rgba) {
  let n = 0
  for (let i = 3; i < rgba.length; i += 4) {
    if (rgba[i] > 8) n++
  }
  return n
}

/** Creature walk-sheets are wide/short with sparse first frames. */
function looksLikeCreatureSheet(png) {
  if (png.width < 256 || png.height > 96) return false
  const first = readCell(png, 0)
  const opaque = cellOpaqueCount(first)
  return opaque > 0 && opaque < 450
}

function listCandidateIds() {
  if (allowedIds) return [...allowedIds].sort((a, b) => a - b)
  return fs
    .readdirSync(SPRITES_ITEM)
    .filter((f) => f.endsWith('.png'))
    .map((f) => Number.parseInt(f, 10))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)
}

/**
 * Resolve which PNG + metadata asset id to use for a server item id.
 */
function resolveAsset(serverId) {
  const name = itemNames.get(serverId) ?? ''
  const clientId = serverToClient.get(serverId) ?? serverId
  const clientPath = path.join(SPRITES_ITEM, `${clientId}.png`)
  const serverPath = path.join(SPRITES_ITEM, `${serverId}.png`)

  let assetId = clientId
  let filePath = null

  if (fs.existsSync(clientPath)) {
    filePath = clientPath
    assetId = clientId
  } else if (/grass|jungle/i.test(name)) {
    const grass = path.join(SPRITES_ITEM, `${FALLBACK_GRASS_ASSET}.png`)
    if (fs.existsSync(grass)) {
      filePath = grass
      assetId = FALLBACK_GRASS_ASSET
    }
  }

  if (!filePath && fs.existsSync(serverPath)) {
    filePath = serverPath
    assetId = serverId
  }

  if (!filePath) return null

  // If the mapped sheet is clearly a creature, swap to terrain fallback
  try {
    const probe = PNG.sync.read(fs.readFileSync(filePath))
    if (looksLikeCreatureSheet(probe)) {
      const isOutdoor = /grass|dirt|sand|rock|water|mountain|floor|pavement/i.test(
        name,
      )
      const fbId = isOutdoor || !name ? FALLBACK_GRASS_ASSET : FALLBACK_FLOOR_ASSET
      const fbPath = path.join(SPRITES_ITEM, `${fbId}.png`)
      if (fs.existsSync(fbPath)) {
        return { filePath: fbPath, assetId: fbId, clientId, substituted: true }
      }
    }
  } catch {
    // keep original
  }

  return { filePath, assetId, clientId, substituted: false }
}

/** @type {{ rgba: Buffer, clientId: number, solid: boolean, ground: boolean, name: string }[]} */
const entries = []
/** @type {Record<string, object>} */
const tilesMeta = {}
let missing = 0
let substituted = 0
let emptyCells = 0

for (const serverId of listCandidateIds()) {
  if (Object.keys(tilesMeta).length >= maxItems) break

  const resolved = resolveAsset(serverId)
  if (!resolved) {
    missing += 1
    continue
  }
  if (resolved.substituted) substituted += 1

  try {
    const png = PNG.sync.read(fs.readFileSync(resolved.filePath))
    const metaEntry = spriteMeta[String(resolved.assetId)]
    const g = metaEntry?.g ? { ...metaEntry.g } : defaultGeometry(png)

    g.w = Math.max(1, Number(g.w) || 1)
    g.h = Math.max(1, Number(g.h) || 1)
    g.layers = Math.max(1, Number(g.layers) || 1)
    g.px = Math.max(1, Number(g.px) || 1)
    g.py = Math.max(1, Number(g.py) || 1)
    g.pz = Math.max(1, Number(g.pz) || 1)
    g.phases = Math.max(1, Number(g.phases) || 1)

    // Cap huge animation strips — map only needs a static frame set
    const maxPhases = 4
    if (g.phases > maxPhases) g.phases = maxPhases

    const expected =
      g.w * g.h * g.layers * g.px * g.py * g.pz * g.phases
    const sheetCells =
      Math.max(1, Math.floor(png.width / TILE_SIZE)) *
      Math.max(1, Math.floor(png.height / TILE_SIZE))
    const nSprites = Math.min(
      Number(g.nSprites) || expected,
      sheetCells,
      expected,
    )

    const name = itemNames.get(serverId) ?? ''
    const solid =
      solidIds.has(serverId) ||
      /\b(wall|door|rock|tree|fence|statue|pillar|building)\b/i.test(name)

    /** @type {number[]} */
    const spriteAtlas = []
    for (let i = 0; i < nSprites; i++) {
      const rgba = readCell(png, i)
      const atlasIndex = entries.length
      entries.push({
        rgba,
        clientId: serverId,
        solid,
        ground: false,
        name: i === 0 ? name : `${name}#${i}`,
      })
      spriteAtlas.push(atlasIndex)
      if (cellOpaqueCount(rgba) === 0) emptyCells += 1
    }

    let defaultLocal = 0
    for (let i = 0; i < spriteAtlas.length; i++) {
      if (cellOpaqueCount(entries[spriteAtlas[i]].rgba) > 0) {
        defaultLocal = i
        break
      }
    }
    if (g.w > 1 || g.h > 1) {
      const se = spriteIndex(g, g.w - 1, g.h - 1, 0, 0, 0, 0, 0)
      if (
        se < spriteAtlas.length &&
        cellOpaqueCount(entries[spriteAtlas[se]].rgba) > 0
      ) {
        defaultLocal = se
      }
    }

    tilesMeta[String(serverId)] = {
      atlasIndex: spriteAtlas[defaultLocal] ?? 0,
      solid,
      ground: false,
      name,
      clientId: resolved.clientId,
      assetId: resolved.assetId,
      g: {
        w: g.w,
        h: g.h,
        layers: g.layers,
        px: g.px,
        py: g.py,
        pz: g.pz,
        phases: g.phases,
      },
      sprites: spriteAtlas,
    }
  } catch (err) {
    console.warn(
      `Skip ${serverId}:`,
      err instanceof Error ? err.message : err,
    )
  }
}

if (entries.length === 0) {
  throw new Error('No local item sprites extracted.')
}

const columns = Math.ceil(Math.sqrt(entries.length))
const rows = Math.ceil(entries.length / columns)
const atlasW = columns * TILE_SIZE
const atlasH = rows * TILE_SIZE
const png = new PNG({ width: atlasW, height: atlasH, colorType: 6 })
png.data.fill(0)

for (let i = 0; i < entries.length; i++) {
  const entry = entries[i]
  const col = i % columns
  const row = Math.floor(i / columns)
  const dx = col * TILE_SIZE
  const dy = row * TILE_SIZE
  for (let y = 0; y < TILE_SIZE; y++) {
    for (let x = 0; x < TILE_SIZE; x++) {
      const si = (y * TILE_SIZE + x) * 4
      const di = ((dy + y) * atlasW + (dx + x)) * 4
      png.data[di] = entry.rgba[si]
      png.data[di + 1] = entry.rgba[si + 1]
      png.data[di + 2] = entry.rgba[si + 2]
      png.data[di + 3] = entry.rgba[si + 3]
    }
  }
}

const pngPath = path.join(OUT_TILESETS, 'overworld.png')
const jsonPath = path.join(OUT_TILESETS, 'overworld.json')
const tsxPath = path.join(OUT_MAPS, 'overworld.tsx')

fs.writeFileSync(pngPath, PNG.sync.write(png))
fs.writeFileSync(
  jsonPath,
  JSON.stringify(
    {
      tileSize: TILE_SIZE,
      columns,
      tilecount: entries.length,
      image: '../tilesets/overworld.png',
      imageWidth: atlasW,
      imageHeight: atlasH,
      tiles: tilesMeta,
      source: 'local-sprites+otb',
    },
    null,
    2,
  ),
)

const tilePropsXml = Object.entries(tilesMeta)
  .map(([clientId, t]) => {
    const props = [
      `   <property name="clientId" type="int" value="${clientId}"/>`,
      `   <property name="solid" type="bool" value="${t.solid ? 'true' : 'false'}"/>`,
      `   <property name="ground" type="bool" value="${t.ground ? 'true' : 'false'}"/>`,
    ]
    if (t.name) {
      props.push(
        `   <property name="name" value="${String(t.name).replace(/"/g, '&quot;')}"/>`,
      )
    }
    return ` <tile id="${t.atlasIndex}">\n  <properties>\n${props.join('\n')}\n  </properties>\n </tile>`
  })
  .join('\n')

const tsx = `<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.10.2" name="overworld" tilewidth="${TILE_SIZE}" tileheight="${TILE_SIZE}" tilecount="${entries.length}" columns="${columns}">
 <image source="../tilesets/overworld.png" width="${atlasW}" height="${atlasH}"/>
${tilePropsXml}
</tileset>
`
fs.writeFileSync(tsxPath, tsx)

console.log(
  `Wrote ${entries.length} atlas cells for ${Object.keys(tilesMeta).length} items (missing: ${missing}, substituted: ${substituted}, empty cells: ${emptyCells}) →`,
)
console.log(`  ${pngPath}`)
console.log(`  ${jsonPath}`)
console.log(`  ${tsxPath}`)
