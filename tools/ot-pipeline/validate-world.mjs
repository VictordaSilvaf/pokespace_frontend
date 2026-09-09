#!/usr/bin/env node
/**
 * Validate PokeSpace world map artifacts (TMX / OTBM crop metadata).
 *
 *   pnpm world:validate
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const MAPS = path.join(ROOT, 'public/assets/world/maps')
const errors = []

function check(file, pred, msg) {
  if (!pred) errors.push(`${file}: ${msg}`)
}

const starter = path.join(MAPS, 'starter.tmx')
check('starter.tmx', fs.existsSync(starter), 'missing playable starter.tmx')
if (fs.existsSync(starter)) {
  const text = fs.readFileSync(starter, 'utf8')
  check('starter.tmx', text.includes('<map'), 'not a TMX map')
  check(
    'starter.tmx',
    /tilewidth="32"/.test(text),
    'expected PokeTibia OT map (tilewidth=32)',
  )
  check('starter.tmx', text.includes('overworld'), 'expected overworld tileset')
  check(
    'starter.tmx',
    text.includes('player_spawn') || text.includes('Collision'),
    'expected spawn or Collision layer',
  )
}

const otbm = path.join(MAPS, 'starter-otbm.tmx')
if (fs.existsSync(otbm)) {
  const text = fs.readFileSync(otbm, 'utf8')
  check('starter-otbm.tmx', text.includes('<map'), 'invalid TMX')
}

const tileset = path.join(ROOT, 'public/assets/world/tilesets/overworld.json')
if (fs.existsSync(tileset)) {
  const meta = JSON.parse(fs.readFileSync(tileset, 'utf8'))
  check('overworld.json', meta.tileSize > 0, 'invalid tileSize')
  check('overworld.json', meta.tiles && typeof meta.tiles === 'object', 'missing tiles')
}

if (errors.length) {
  console.error(`world:validate FAILED (${errors.length})`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log('world:validate OK')
