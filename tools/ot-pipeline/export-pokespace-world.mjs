#!/usr/bin/env node
/**
 * Export OTBM crop → PokeSpace world folder (chunks + metadata + spawns).
 *
 *   node tools/ot-pipeline/export-pokespace-world.mjs \
 *     --otbm server/data/world/DarkXPoke.otbm \
 *     --out ../pokespace_backend/maps/darkxpoke-crop \
 *     --map-id darkxpoke-crop --x 1234 --y 844 --w 96 --h 96 --z 7 --chunk 32
 */
import fs from 'node:fs'
import path from 'node:path'
import { OTBMReader, OTBM_NODE_TYPE } from '@v0rt4c/otbm'

import {
  parseArgs,
  resolveOtbmPath,
  TILE_SIZE,
} from './paths.mjs'

const args = parseArgs(process.argv.slice(2))
const floorZ = args.z !== undefined ? Number(args.z) : 7
const cropW = args.w !== undefined ? Number(args.w) : 96
const cropH = args.h !== undefined ? Number(args.h) : 96
const chunkSize = args.chunk !== undefined ? Number(args.chunk) : 32
const mapId = args['map-id'] ?? 'imported'
const outDir = args.out
  ? path.isAbsolute(args.out)
    ? args.out
    : path.join(process.cwd(), args.out)
  : path.join(process.cwd(), 'tools/ot-pipeline/.cache/world', mapId)

const hasCrop = args.x !== undefined && args.y !== undefined
const originX = hasCrop ? Number(args.x) : 0
const originY = hasCrop ? Number(args.y) : 0

const otbmPath = resolveOtbmPath(args)
console.log(`Reading OTBM… ${otbmPath}`)
const buffer = new Uint8Array(fs.readFileSync(otbmPath))
const root = new OTBMReader(buffer).getRootNode()

const TILE_TYPES = new Set([
  OTBM_NODE_TYPE.OTBM_TILE,
  OTBM_NODE_TYPE.OTBM_HOUSETILE,
])

/** @type {Map<string, { x: number, y: number, z: number, groundId: number | null, itemIds: number[] }>} */
const tiles = new Map()

function inBounds(x, y) {
  if (!hasCrop) return true
  return (
    x >= originX &&
    y >= originY &&
    x < originX + cropW &&
    y < originY + cropH
  )
}

function walk(node) {
  if (TILE_TYPES.has(node.type)) {
    const x = node.realX
    const y = node.realY
    const z = node.z
    if (z === floorZ && Number.isFinite(x) && Number.isFinite(y) && inBounds(x, y)) {
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
      tiles.set(`${x},${y},${z}`, { x, y, z, groundId, itemIds })
    }
  }
  for (const child of node.children ?? []) walk(child)
}

walk(root)
console.log(`Tiles on z=${floorZ}: ${tiles.size}`)

const width = hasCrop ? cropW : 96
const height = hasCrop ? cropH : 96
const ox = hasCrop ? originX : 0
const oy = hasCrop ? originY : 0

fs.mkdirSync(path.join(outDir, 'chunks'), { recursive: true })

let chunkCount = 0
for (let cy = 0; cy * chunkSize < height; cy++) {
  for (let cx = 0; cx * chunkSize < width; cx++) {
    const chunkTiles = []
    for (let y = 0; y < chunkSize; y++) {
      const ly = cy * chunkSize + y
      if (ly >= height) break
      for (let x = 0; x < chunkSize; x++) {
        const lx = cx * chunkSize + x
        if (lx >= width) break
        const wx = ox + lx
        const wy = oy + ly
        const t = tiles.get(`${wx},${wy},${floorZ}`)
        const walkable = Boolean(t?.groundId != null)
        chunkTiles.push({
          x: lx,
          y: ly,
          z: floorZ,
          groundId: t?.groundId ?? null,
          objects: t?.itemIds ?? [],
          walkable,
          elevation: 0,
          blocked: walkable ? 0 : 1,
        })
      }
    }
    const payload = {
      mapId,
      chunkX: cx,
      chunkY: cy,
      floor: floorZ,
      chunkSize,
      tiles: chunkTiles,
    }
    fs.writeFileSync(
      path.join(outDir, 'chunks', `${cx}_${cy}_z${floorZ}.json`),
      `${JSON.stringify(payload)}\n`,
    )
    chunkCount += 1
  }
}

const spawnX = Math.floor(width / 2)
const spawnY = Math.floor(height / 2)
const spawns = [
  {
    id: `${mapId}-spawn-center`,
    x: spawnX,
    y: spawnY,
    z: floorZ,
  },
]

fs.writeFileSync(
  path.join(outDir, 'spawns.json'),
  JSON.stringify({ mapId, spawns }, null, 2),
)

const metadata = {
  mapId,
  displayName: mapId,
  version: '1',
  tileSize: TILE_SIZE,
  chunkSize,
  width,
  height,
  floorZ,
  sourceOtbm: path.relative(process.cwd(), otbmPath),
  crop: hasCrop ? { x: ox, y: oy, w: width, h: height, z: floorZ } : null,
  chunks: {
    count: chunkCount,
    pathPattern: 'chunks/{cx}_{cy}_z{z}.json',
  },
  spawnZones: [],
}

fs.writeFileSync(
  path.join(outDir, 'metadata.json'),
  `${JSON.stringify(metadata, null, 2)}\n`,
)

console.log(
  `Wrote ${chunkCount} chunks + metadata → ${outDir} (tileSize=${TILE_SIZE}, chunk=${chunkSize})`,
)
