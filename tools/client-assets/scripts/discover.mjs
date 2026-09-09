#!/usr/bin/env node
/**
 * Discover local things.dat + things.spr and write manifests/manifest.json
 *
 *   pnpm assets:discover
 *   pnpm assets:discover -- --input client/data/things --max 100
 */
import fs from 'node:fs'
import path from 'node:path'

import { parseDatFile } from '../parser/index.mjs'
import { buildManifest } from '../manifest/build-manifest.mjs'
import {
  INPUT_DIR,
  MANIFEST_DIR,
  parseArgs,
  resolveDatSpr,
  resolveInputDir,
} from './paths.mjs'

const args = parseArgs(process.argv.slice(2))
const inputDir = resolveInputDir(args)
const max = args.max ? Number(args.max) : Infinity
const categoryFilter = args.category ?? 'all'

const { datPath, sprPath, sprExists } = resolveDatSpr(inputDir)

if (!fs.existsSync(datPath)) {
  throw new Error(
    `Missing DAT: ${datPath}\n` +
      `Expected client/data/things/things.dat\n` +
      `See tools/client-assets/README.md`,
  )
}

console.log(`DAT: ${datPath}`)
console.log(
  `SPR: ${sprExists ? sprPath : '(missing — discover continues without SPR)'}`,
)

const { signature, things: allThings } = parseDatFile(datPath)
let things = allThings
if (categoryFilter !== 'all') {
  const map = {
    items: 'item',
    creatures: 'creature',
    effects: 'effect',
    missiles: 'missile',
  }
  const cat = map[categoryFilter] ?? categoryFilter
  things = things.filter((t) => t.category === cat)
}
if (Number.isFinite(max) && max > 0) {
  const per = { item: 0, creature: 0, effect: 0, missile: 0 }
  things = things.filter((t) => {
    if (per[t.category] >= max) return false
    per[t.category] += 1
    return true
  })
}

const manifest = buildManifest({ signature, things, source: 'client' })
fs.mkdirSync(MANIFEST_DIR, { recursive: true })
fs.mkdirSync(INPUT_DIR, { recursive: true })
const outPath = path.join(MANIFEST_DIR, 'manifest.json')
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2))
console.log(
  `Wrote ${outPath} — items=${manifest.counts.items} creatures=${manifest.counts.creatures} effects=${manifest.counts.effects} missiles=${manifest.counts.missiles}`,
)
