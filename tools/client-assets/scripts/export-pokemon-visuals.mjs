#!/usr/bin/env node
/**
 * Export PokemonVisual map from generated catalog (server lookType / portraitId).
 *
 *   node ./tools/client-assets/scripts/export-pokemon-visuals.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const catalogPath = path.join(
  ROOT,
  'src/features/game-data/generated/pokemon.json',
)

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))

const visuals = catalog
  .filter((p) => p.dexId != null && p.lookType != null)
  .map((p) => {
    const lookType = p.lookType
    const hasPortrait = p.portraitId != null && p.portraitId > 0
    const walk = { category: 'creature', id: lookType }
    const portrait = hasPortrait
      ? { category: 'item', id: p.portraitId }
      : walk
    return {
      dexId: p.dexId,
      portrait,
      walk,
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
      source: 'server/data + client lookTypes',
      note: 'dexId is identity; lookType/portraitId are AssetReferences',
      visuals,
    },
    null,
    2,
  ),
)
console.log(`Wrote ${outPath} (${visuals.length} dex entries)`)

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
