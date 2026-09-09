#!/usr/bin/env node
/**
 * Discover + extract first sprite frame of each thing as PNG.
 *
 *   pnpm assets:extract
 *   pnpm assets:extract -- --max 50
 */
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

import { parseDatFile, parseSprFile } from '../parser/index.mjs'
import { buildManifest } from '../manifest/build-manifest.mjs'
import {
  MANIFEST_DIR,
  TILE_SIZE,
  WEB_OUT,
  parseArgs,
  resolveInputDir,
} from './paths.mjs'

const args = parseArgs(process.argv.slice(2))
const inputDir = resolveInputDir(args)
const max = args.max ? Number(args.max) : Infinity

const datPath = path.join(inputDir, 'Tibia.dat')
const sprPath = path.join(inputDir, 'Tibia.spr')

for (const [p, label] of [
  [datPath, 'Tibia.dat'],
  [sprPath, 'Tibia.spr'],
]) {
  if (!fs.existsSync(p)) {
    throw new Error(
      `Missing ${label}: ${p}\nSee tools/client-assets/README.md`,
    )
  }
}

console.log('Parsing DAT…')
const { signature, things: allThings } = parseDatFile(datPath)
console.log('Parsing SPR…')
const sprites = parseSprFile(sprPath)

let things = allThings
if (Number.isFinite(max) && max > 0) {
  const per = { item: 0, creature: 0, effect: 0, missile: 0 }
  things = things.filter((t) => {
    if (per[t.category] >= max) return false
    per[t.category] += 1
    return true
  })
}

const dirFor = {
  item: 'items',
  creature: 'creatures',
  effect: 'effects',
  missile: 'missiles',
}

let written = 0
let missingSpr = 0
for (const thing of things) {
  const folder = dirFor[thing.category]
  const outDir = path.join(WEB_OUT, folder)
  fs.mkdirSync(outDir, { recursive: true })
  const spriteId = thing.spriteIds[0]
  if (spriteId == null) continue
  const sprite = sprites.get(spriteId)
  if (!sprite) {
    missingSpr += 1
    continue
  }
  const png = new PNG({ width: TILE_SIZE, height: TILE_SIZE, colorType: 6 })
  const src = Buffer.from(sprite.pixels)
  const copy = Math.min(src.length, png.data.length)
  src.copy(png.data, 0, 0, copy)
  fs.writeFileSync(path.join(outDir, `${thing.id}.png`), PNG.sync.write(png))
  written += 1
}

const manifest = buildManifest({ signature, things, source: 'client' })
fs.mkdirSync(MANIFEST_DIR, { recursive: true })
fs.writeFileSync(
  path.join(MANIFEST_DIR, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
)

console.log(
  `Extracted ${written} PNGs → ${WEB_OUT} (missing sprites: ${missingSpr})`,
)
console.log(`Manifest → ${path.join(MANIFEST_DIR, 'manifest.json')}`)
