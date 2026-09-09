#!/usr/bin/env node
/**
 * Convert a crop of an OTBM world into starter.tmx for the web client.
 *
 * Usage:
 *   pnpm ot:map
 *   pnpm ot:map -- --otbm server/data/world/DarkXPoke.otbm
 *   pnpm ot:map -- --x 1160 --y 574 --w 96 --h 96 --z 7
 *   pnpm ot:map -- --scan
 *   pnpm ot:map -- --scan --x 1160 --y 574 --w 96 --h 96
 */
import fs from 'node:fs'
import path from 'node:path'
import { OTBMReader, OTBM_NODE_TYPE } from '@v0rt4c/otbm'

import {
  OUT_MAPS,
  OUT_TILESETS,
  PIPELINE_CACHE,
  TILE_SIZE,
  ensureDirs,
  parseArgs,
  resolveOtbmPath,
} from './paths.mjs'

const args = parseArgs(process.argv.slice(2))
const scanOnly = Boolean(args.scan)
const floorZ = args.z !== undefined ? Number(args.z) : 7
const cropW = args.w !== undefined ? Number(args.w) : 96
const cropH = args.h !== undefined ? Number(args.h) : 96
const hasCropOrigin = args.x !== undefined && args.y !== undefined
const cropOriginX = hasCropOrigin ? Number(args.x) : null
const cropOriginY = hasCropOrigin ? Number(args.y) : null

const otbmPath = resolveOtbmPath(args)

ensureDirs()

console.log(`Reading OTBM… ${otbmPath}`)
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

function inScanBounds(x, y) {
  if (!hasCropOrigin) return true
  return (
    x >= cropOriginX &&
    y >= cropOriginY &&
    x < cropOriginX + cropW &&
    y < cropOriginY + cropH
  )
}

function walk(node) {
  if (TILE_TYPES.has(node.type)) {
    const x = node.realX
    const y = node.realY
    const z = node.z
    if (
      z === floorZ &&
      Number.isFinite(x) &&
      Number.isFinite(y) &&
      inScanBounds(x, y)
    ) {
      const groundId =
        typeof node.attributes?.tileId === 'number'
          ? node.attributes.tileId
          : null
      const itemIds = []
      for (const child of node.children ?? []) {
        if (
          child.type === OTBM_NODE_TYPE.OTBM_ITEM &&
          typeof child.id === 'number'
        ) {
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
console.log(
  `Found ${tiles.size} tiles on z=${floorZ}; ${usedIds.size} unique item IDs`,
)

const usedIdsPath = path.join(PIPELINE_CACHE, 'used-ids.json')
fs.writeFileSync(
  usedIdsPath,
  JSON.stringify(
    {
      z: floorZ,
      otbm: path.relative(process.cwd(), otbmPath),
      crop: hasCropOrigin
        ? { x: cropOriginX, y: cropOriginY, w: cropW, h: cropH }
        : null,
      ids: [...usedIds].sort((a, b) => a - b),
    },
    null,
    2,
  ),
)
console.log(`Wrote ${usedIdsPath}`)

if (scanOnly) {
  console.log('Scan only — done.')
  process.exit(0)
}

const metaPath = path.join(OUT_TILESETS, 'overworld.json')
if (!fs.existsSync(metaPath)) {
  throw new Error(
    `Missing ${metaPath}. Build atlas from client SPR (extract-to-public + atlas) then re-run ot:map.`,
  )
}
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
const tileMeta = meta.tiles

/**
 * OTClient ThingType::getSpriteIndex order:
 * (((((phase * pz + z) * py + y) * px + x) * layers + layer) * h + hy) * w + wx
 */
function localSpriteIndex(g, wx, hy, layer, patX, patY, patZ, phase) {
  return (
    (((((phase * g.pz + patZ) * g.py + patY) * g.px + patX) * g.layers +
      layer) *
      g.h +
      hy) *
      g.w +
    wx
  )
}

function getEntry(clientId) {
  return tileMeta[String(clientId)] ?? null
}

function atlasGidForSprite(entry, localIndex) {
  if (!entry) return 0
  const sprites = entry.sprites
  if (Array.isArray(sprites) && sprites.length > 0) {
    const atlas =
      sprites[Math.max(0, Math.min(localIndex, sprites.length - 1))]
    return atlas + 1
  }
  return (entry.atlasIndex ?? 0) + 1
}

/** Pattern-aware GID for a 1×1 cell (grounds / simple objects). */
function atlasGid(clientId, worldX = 0, worldY = 0) {
  const entry = getEntry(clientId)
  if (!entry) return 0
  const g = entry.g ?? { w: 1, h: 1, layers: 1, px: 1, py: 1, pz: 1, phases: 1 }
  const patX = ((worldX % g.px) + g.px) % g.px
  const patY = ((worldY % g.py) + g.py) % g.py
  // Multi-tile grounds: use SE part (richest / least empty)
  const wx = Math.max(0, g.w - 1)
  const hy = Math.max(0, g.h - 1)
  const local = localSpriteIndex(g, wx, hy, 0, patX, patY, 0, 0)
  return atlasGidForSprite(entry, local)
}

function isSolidId(clientId) {
  return Boolean(getEntry(clientId)?.solid)
}

/**
 * Paint an item onto the objects layer, expanding multi-tile footprints
 * (anchor = SE tile, matching OT draw offsets).
 */
function paintItem(objectsLayer, clientId, lx, ly, worldX, worldY) {
  const entry = getEntry(clientId)
  if (!entry) return
  const g = entry.g ?? { w: 1, h: 1, layers: 1, px: 1, py: 1, pz: 1, phases: 1 }
  const patX = ((worldX % g.px) + g.px) % g.px
  const patY = ((worldY % g.py) + g.py) % g.py

  for (let hy = 0; hy < g.h; hy++) {
    for (let wx = 0; wx < g.w; wx++) {
      const tx = lx - (g.w - 1) + wx
      const ty = ly - (g.h - 1) + hy
      if (tx < 0 || ty < 0 || tx >= cropW || ty >= cropH) continue
      const local = localSpriteIndex(g, wx, hy, 0, patX, patY, 0, 0)
      const gid = atlasGidForSprite(entry, local)
      if (gid === 0) continue
      // Do not stamp fully-empty multi-tile parts over neighbors
      const sprites = entry.sprites
      if (Array.isArray(sprites)) {
        const atlasIndex = sprites[Math.max(0, Math.min(local, sprites.length - 1))]
        // atlasIndex  reserved — empty cells still get a gid; skip if name marks empty
        // Heuristic: only overwrite when this part is the SE anchor or prior is empty
        const isAnchor = wx === g.w - 1 && hy === g.h - 1
        const prev = objectsLayer[ty * cropW + tx]
        if (!isAnchor && prev !== 0 && g.w * g.h > 1) {
          // keep existing furniture/walls unless this is the main SE tile
          continue
        }
        void atlasIndex
      }
      objectsLayer[ty * cropW + tx] = gid
    }
  }
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
if (hasCropOrigin) {
  originX = cropOriginX
  originY = cropOriginY
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
      collision[ly * cropW + lx] = 1
      continue
    }
    painted++
    const idx = ly * cropW + lx
    if (tile.groundId != null) {
      ground[idx] = atlasGid(tile.groundId, wx, wy)
      if (isSolidId(tile.groundId)) collision[idx] = 1
    } else {
      collision[idx] = 1
    }
    for (const itemId of tile.itemIds) {
      paintItem(objects, itemId, lx, ly, wx, wy)
      if (isSolidId(itemId)) collision[idx] = 1
    }
  }
}

console.log(`Painted ${painted}/${cropW * cropH} SQMs in crop`)

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

const outOtbm = path.join(OUT_MAPS, 'starter-otbm.tmx')
const outStarter = path.join(OUT_MAPS, 'starter.tmx')
fs.writeFileSync(outOtbm, tmx)
fs.writeFileSync(outStarter, tmx)
console.log(`Wrote ${outOtbm}`)
console.log(`Wrote ${outStarter} (playable default)`)
console.log(
  foundSpawn
    ? `player_spawn at tile (${spawnX},${spawnY}) px (${spawnPxX},${spawnPxY})`
    : `Warning: no walkable spawn found; placed at center (${spawnX},${spawnY})`,
)
