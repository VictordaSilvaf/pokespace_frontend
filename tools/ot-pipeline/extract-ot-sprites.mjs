#!/usr/bin/env node
/**
 * Extract OT DAT/SPR (+ items.xml hints) into a Tiled-ready atlas.
 *
 * Usage:
 *   pnpm ot:extract
 *   pnpm ot:extract -- --only-used   # only IDs listed in used-ids.json (from ot:map --scan)
 *   pnpm ot:extract -- --max 4000
 */
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'
import { DatReader } from '@v0rt4c/dat'
import { read as readSpr } from '@v0rt4c/spr'

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
const maxItems = args.max ? Number(args.max) : Infinity
const onlyUsed = Boolean(args['only-used'])

const datPath = requireFile(path.join(OT_SOURCE, 'Tibia.dat'), 'Tibia.dat')
const sprPath = requireFile(path.join(OT_SOURCE, 'Tibia.spr'), 'Tibia.spr')
const itemsXmlPath = path.join(OT_SOURCE, 'items.xml')

ensureDirs()

console.log('Reading DAT…')
const datBuffer = new Uint8Array(fs.readFileSync(datPath))
const dat = DatReader(datBuffer).parse()

console.log('Reading SPR…')
const sprBuffer = new Uint8Array(fs.readFileSync(sprPath))
const spr = readSpr(sprBuffer)
const sprById = new Map(spr.sprites.map((s) => [s.id, s.rgba]))

/** Optional allow-list of client/server item IDs. */
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

/** Parse items.xml for names (solid still comes from DAT). */
const itemNames = new Map()
if (fs.existsSync(itemsXmlPath)) {
  const xml = fs.readFileSync(itemsXmlPath, 'utf8')
  const itemRe =
    /<item\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/item>)/g
  let match
  while ((match = itemRe.exec(xml))) {
    const attrs = match[1]
    const idMatch = /\bid="(\d+)"/.exec(attrs)
    const fromMatch = /\bfromid="(\d+)"/.exec(attrs)
    const toMatch = /\btoid="(\d+)"/.exec(attrs)
    const nameMatch = /\bname="([^"]*)"/.exec(attrs)
    const name = nameMatch?.[1] ?? ''
    if (idMatch) {
      itemNames.set(Number(idMatch[1]), name)
    } else if (fromMatch && toMatch) {
      const from = Number(fromMatch[1])
      const to = Number(toMatch[1])
      for (let id = from; id <= to; id++) itemNames.set(id, name)
    }
  }
  console.log(`Loaded ${itemNames.size} names from items.xml`)
}

function blitSprite(dst, dstW, dx, dy, rgba) {
  if (!rgba || rgba.byteLength < TILE_SIZE * TILE_SIZE * 4) return false
  for (let y = 0; y < TILE_SIZE; y++) {
    for (let x = 0; x < TILE_SIZE; x++) {
      const si = (y * TILE_SIZE + x) * 4
      const di = ((dy + y) * dstW + (dx + x)) * 4
      dst[di] = rgba[si]
      dst[di + 1] = rgba[si + 1]
      dst[di + 2] = rgba[si + 2]
      dst[di + 3] = rgba[si + 3]
    }
  }
  return true
}

const entries = []
for (const thing of dat.items) {
  const id = thing.id ?? thing.thingId
  if (allowedIds && !allowedIds.has(id)) continue
  if (entries.length >= maxItems) break

  const spriteId = thing.spriteIds?.[0]
  if (!spriteId) continue
  const rgba = sprById.get(spriteId)
  if (!rgba) continue

  const solid = Boolean(thing.flags?.unpassable)
  const ground = Boolean(thing.flags?.ground)
  entries.push({
    clientId: id,
    spriteId,
    solid,
    ground,
    name: itemNames.get(id) ?? '',
    rgba,
  })
}

if (entries.length === 0) {
  throw new Error('No items extracted. Check DAT/SPR compatibility / --only-used filter.')
}

const columns = Math.ceil(Math.sqrt(entries.length))
const rows = Math.ceil(entries.length / columns)
const atlasW = columns * TILE_SIZE
const atlasH = rows * TILE_SIZE
const png = new PNG({ width: atlasW, height: atlasH, colorType: 6 })
png.data.fill(0)

const tilesMeta = {}
for (let i = 0; i < entries.length; i++) {
  const entry = entries[i]
  const col = i % columns
  const row = Math.floor(i / columns)
  blitSprite(png.data, atlasW, col * TILE_SIZE, row * TILE_SIZE, entry.rgba)
  tilesMeta[String(entry.clientId)] = {
    atlasIndex: i,
    solid: entry.solid,
    ground: entry.ground,
    name: entry.name,
    spriteId: entry.spriteId,
  }
}

const pngPath = path.join(OUT_TILESETS, 'overworld.png')
const jsonPath = path.join(OUT_TILESETS, 'overworld.json')
const tsxPath = path.join(OUT_MAPS, 'overworld.tsx')

fs.writeFileSync(pngPath, PNG.sync.write(png))

const meta = {
  tileSize: TILE_SIZE,
  columns,
  tilecount: entries.length,
  image: '../tilesets/overworld.png',
  imageWidth: atlasW,
  imageHeight: atlasH,
  tiles: tilesMeta,
}
fs.writeFileSync(jsonPath, JSON.stringify(meta, null, 2))

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

console.log(`Wrote ${entries.length} tiles →`)
console.log(`  ${pngPath}`)
console.log(`  ${jsonPath}`)
console.log(`  ${tsxPath}`)
