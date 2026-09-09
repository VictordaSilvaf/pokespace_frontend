#!/usr/bin/env node
/**
 * Extract sprites from client SPR into public/assets/sprites.
 *
 * DarkXPoke DAT is extended beyond @v0rt4c/dat; we map lookType/itemId →
 * SPR id 1:1 as a first-pass heuristic (works for most outfits / many tiles).
 *
 *   node ./tools/client-assets/scripts/extract-to-public.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

import { parseSprFile } from '../parser/spr/parse-spr.mjs'
import { DEFAULT_CLIENT_THINGS, ROOT, TILE_SIZE } from './paths.mjs'

const catalog = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'src/features/game-data/generated/pokemon.json'),
    'utf8',
  ),
)

const sprPath = path.join(DEFAULT_CLIENT_THINGS, 'things.spr')
console.log(`SPR ${sprPath}`)
const sprites = parseSprFile(sprPath)
console.log(`sprites loaded=${sprites.size}`)

const lookTypes = new Set(
  catalog.map((p) => p.lookType).filter((id) => Number.isFinite(id) && id > 0),
)
lookTypes.add(510)
lookTypes.add(511)

const creatureOut = path.join(ROOT, 'public/assets/sprites/creature')
fs.mkdirSync(creatureOut, { recursive: true })

function writePng(dir, id, pixels) {
  const png = new PNG({ width: TILE_SIZE, height: TILE_SIZE, colorType: 6 })
  Buffer.from(pixels).copy(png.data)
  fs.writeFileSync(path.join(dir, `${id}.png`), PNG.sync.write(png))
}

let creatures = 0
let creatureMiss = 0
for (const id of lookTypes) {
  const s = sprites.get(id)
  if (!s) {
    creatureMiss += 1
    continue
  }
  writePng(creatureOut, id, s.pixels)
  creatures += 1
}

const usedIdsPath = path.join(ROOT, 'tools/ot-pipeline/.cache/used-ids.json')
const usedItemIds = fs.existsSync(usedIdsPath)
  ? JSON.parse(fs.readFileSync(usedIdsPath, 'utf8')).ids ?? []
  : []

const itemOut = path.join(ROOT, 'public/assets/sprites/item')
fs.mkdirSync(itemOut, { recursive: true })
let items = 0
let itemMiss = 0
for (const id of usedItemIds) {
  const s = sprites.get(id)
  if (!s) {
    itemMiss += 1
    continue
  }
  writePng(itemOut, id, s.pixels)
  items += 1
}

console.log(
  `extract-to-public ok — creatures=${creatures} miss=${creatureMiss} items=${items} miss=${itemMiss}`,
)
