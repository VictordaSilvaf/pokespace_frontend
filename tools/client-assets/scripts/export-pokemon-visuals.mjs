#!/usr/bin/env node
/**
 * Export curated PokemonVisual map for backend registry sync.
 *
 *   node ./tools/client-assets/scripts/export-pokemon-visuals.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

/** Mirrors src/features/game-data/creature-map.ts DEX_CREATURE_ID */
const DEX_CREATURE_ID = {
  3: 40056,
  7: 40036,
  9: 40040,
  52: 40037,
  107: 40368,
  114: 40052,
}

const visuals = Object.entries(DEX_CREATURE_ID).map(([dex, creatureId]) => {
  const id = Number(creatureId)
  const ref = { category: 'creature', id }
  return {
    dexId: Number(dex),
    portrait: ref,
    walk: ref,
    shinyWalk: null,
    effects: [],
    missiles: [],
  }
})

const outDir = path.join(ROOT, 'tools/client-assets/output/manifests')
fs.mkdirSync(outDir, { recursive: true })
const outPath = path.join(outDir, 'pokemon-visuals.json')
fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      version: 1,
      note: 'dexId is identity; creature id is AssetReference only',
      visuals,
    },
    null,
    2,
  ),
)
console.log(`Wrote ${outPath} (${visuals.length} dex entries)`)

// Also copy into backend assets registry contract folder when sibling exists
const beOut = path.join(
  ROOT,
  '../pokespace_backend/assets/registry/pokemon-visuals.json',
)
try {
  fs.mkdirSync(path.dirname(beOut), { recursive: true })
  fs.copyFileSync(outPath, beOut)
  console.log(`Synced → ${beOut}`)
} catch (err) {
  console.warn('Backend sync skipped:', err instanceof Error ? err.message : err)
}
