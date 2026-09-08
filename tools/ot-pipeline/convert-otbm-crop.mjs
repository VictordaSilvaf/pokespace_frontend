#!/usr/bin/env node
/**
 * Convert a crop of forgotten.otbm into starter.tmx for the web client.
 *
 * Usage:
 *   pnpm ot:map
 *   pnpm ot:map -- --x 320 --y 320 --w 64 --h 64 --z 7
 *   pnpm ot:map -- --scan   # write used-ids.json only (no TMX)
 */
import fs from 'node:fs'
import path from 'node:path'
import { OTBMReader, OTBM_NODE_TYPE } from '@v0rt4c/otbm'

import {
  OT_SOURCE,
  OUT_MAPS,
  OUT_TILESETS,
  PIPELINE_CACHE,
  TILE_SIZE,
  ensureDirs,
  parseArgs,
  requireFile,
} from './paths.mjs'

const args = parseArgs(process.argv.slice(2))
const scanOnly = Boolean(args.scan)
const floorZ = args.z !== undefined ? Number(args.z) : 7
const cropW = args.w !== undefined ? Number(args.w) : 64
const cropH = args.h !== undefined ? Number(args.h) : 64

const otbmPath = requireFile(
  path.join(OT_SOURCE, 'forgotten.otbm'),
  'forgotten.otbm',
)

ensureDirs()

console.log('Reading OTBM…')
const buffer = new Uint8Array(fs.readFileSync(otbmPath))
const reader = new OTBMReader(buffer)
const root = reader.getRootNode()

const TILE_TYPES = new Set([
  OTBM_NODE_TYPE.OTBM_TILE,
  OTBM_NODE_TYPE.OTBM_HOUSETILE,
])

/** @type {Map<string, { x: number, y: number, z: number, groundId: number | null, itemIds: number[] }>} */
const tiles = new Map()
const usedIds = new Set()

function walk(node) {
  if (TILE_TYPES.has(node.type)) {
    const x = node.realX
    const y = node.realY
    const z = node.z
    if (z === floorZ && Number.isFinite(x) && Number.isFinite(y)) {
      const groundId =
        typeof node.attributes?.tileId === 'number' ? node.attributes.tileId : null
      const itemIds = []
      for (const child of node.children ?? []) {
        if (child.type === OTBM_NODE_TYPE.OTBM_ITEM && typeof child.id === 'number') {
          itemIds.push(child.id)
        }
      }
      if (groundId != null) usedIds.add(groundId)
      for (const id of itemIds) usedIds.add(id)
      tiles.set(`${x},${y},${z}`, { x, y, z, groundId, itemIds })
    }
  }
  for (const child of node.children ?? []) walk(child)
}

walk(root)
console.log(`Found ${tiles.size} tiles on z=${floorZ}; ${usedIds.size} unique item IDs`)

const usedIdsPath = path.join(PIPELINE_CACHE, 'used-ids.json')
fs.writeFileSync(
  usedIdsPath,
  JSON.stringify({ z: floorZ, ids: [...usedIds].sort((a, b) => a - b) }, null, 2),
)
console.log(`Wrote ${usedIdsPath}`)

if (scanOnly) {
  console.log('Scan complete (--scan). Run pnpm ot:extract -- --only-used next.')
  process.exit(0)
}

const metaPath = path.join(OUT_TILESETS, 'overworld.json')
if (!fs.existsSync(metaPath)) {
  throw new Error(
    `Missing ${metaPath}. Run pnpm ot:extract first (optionally after --scan).`,
  )
}
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
const tileMeta = meta.tiles

function atlasGid(clientId) {
  const entry = tileMeta[String(clientId)]
  if (!entry) return 0
  return entry.atlasIndex + 1 // firstgid = 1
}

function isSolidId(clientId) {
  return Boolean(tileMeta[String(clientId)]?.solid)
}

let minX = Infinity
let minY = Infinity
let maxX = -Infinity
let maxY = -Infinity
for (const t of tiles.values()) {
  minX = Math.min(minX, t.x)
  minY = Math.min(minY, t.y)
  maxX = Math.max(maxX, t.x)
  maxY = Math.max(maxY, t.y)
}

if (!Number.isFinite(minX)) {
  throw new Error(`No tiles found on floor z=${floorZ}`)
}

let originX
let originY
if (args.x !== undefined && args.y !== undefined) {
  originX = Number(args.x)
  originY = Number(args.y)
} else {
  const centerX = Math.floor((minX + maxX) / 2)
  const centerY = Math.floor((minY + maxY) / 2)
  originX = centerX - Math.floor(cropW / 2)
  originY = centerY - Math.floor(cropH / 2)
}

console.log(
  `Crop origin=(${originX},${originY}) size=${cropW}x${cropH} bounds=[${minX},${minY}]-[${maxX},${maxY}]`,
)

const ground = new Array(cropW * cropH).fill(0)
const objects = new Array(cropW * cropH).fill(0)
const collision = new Array(cropW * cropH).fill(0)

let painted = 0
for (let ly = 0; ly < cropH; ly++) {
  for (let lx = 0; lx < cropW; lx++) {
    const wx = originX + lx
    const wy = originY + ly
    const tile = tiles.get(`${wx},${wy},${floorZ}`)
    if (!tile) {
      // Empty SQM → solid void
      collision[ly * cropW + lx] = 1
      continue
    }
    painted++
    const idx = ly * cropW + lx
    if (tile.groundId != null) {
      ground[idx] = atlasGid(tile.groundId)
      if (isSolidId(tile.groundId)) collision[idx] = 1
    } else {
      collision[idx] = 1
    }
    if (tile.itemIds.length > 0) {
      const top = tile.itemIds[tile.itemIds.length - 1]
      objects[idx] = atlasGid(top)
      if (tile.itemIds.some(isSolidId)) collision[idx] = 1
    }
  }
}

console.log(`Painted ${painted}/${cropW * cropH} SQMs in crop`)

// Collision layer uses a dedicated 1-tile marker: reuse atlas index 0 if solid,
// else write any solid gid. Simplest: use gid 1 (first atlas tile) as marker when solid.
const collisionMarkerGid = 1
for (let i = 0; i < collision.length; i++) {
  collision[i] = collision[i] ? collisionMarkerGid : 0
}

function layerCsv(arr) {
  const lines = []
  for (let y = 0; y < cropH; y++) {
    const row = []
    for (let x = 0; x < cropW; x++) {
      row.push(String(arr[y * cropW + x]))
    }
    lines.push(row.join(','))
  }
  return lines.join(',\n')
}

// Find walkable spawn near center
let spawnX = Math.floor(cropW / 2)
let spawnY = Math.floor(cropH / 2)
let foundSpawn = false
const cx = spawnX
const cy = spawnY
outer: for (let r = 0; r < Math.max(cropW, cropH); r++) {
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const x = cx + dx
      const y = cy + dy
      if (x < 0 || y < 0 || x >= cropW || y >= cropH) continue
      if (collision[y * cropW + x] === 0 && ground[y * cropW + x] !== 0) {
        spawnX = x
        spawnY = y
        foundSpawn = true
        break outer
      }
    }
  }
}

const spawnPxX = spawnX * TILE_SIZE
const spawnPxY = spawnY * TILE_SIZE

const tmx = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.10" tiledversion="1.10.2" orientation="orthogonal" renderorder="right-down" width="${cropW}" height="${cropH}" tilewidth="${TILE_SIZE}" tileheight="${TILE_SIZE}" infinite="0" nextlayerid="5" nextobjectid="2">
 <tileset firstgid="1" source="overworld.tsx"/>
 <layer id="1" name="Ground" width="${cropW}" height="${cropH}">
  <data encoding="csv">
${layerCsv(ground)}
</data>
 </layer>
 <layer id="2" name="Objects" width="${cropW}" height="${cropH}">
  <data encoding="csv">
${layerCsv(objects)}
</data>
 </layer>
 <layer id="3" name="Collision" width="${cropW}" height="${cropH}">
  <data encoding="csv">
${layerCsv(collision)}
</data>
 </layer>
 <objectgroup id="4" name="Spawns">
  <object id="1" name="player_spawn" type="player_spawn" x="${spawnPxX}" y="${spawnPxY}" width="${TILE_SIZE}" height="${TILE_SIZE}"/>
 </objectgroup>
</map>
`

const outPath = path.join(OUT_MAPS, 'starter.tmx')
fs.writeFileSync(outPath, tmx)
console.log(`Wrote ${outPath}`)
console.log(
  foundSpawn
    ? `player_spawn at tile (${spawnX},${spawnY}) px (${spawnPxX},${spawnPxY})`
    : `Warning: no walkable spawn found; placed at center (${spawnX},${spawnY})`,
)
