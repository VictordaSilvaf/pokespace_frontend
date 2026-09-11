#!/usr/bin/env node
/** Validate the durable PokeSpace map-art contract. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const referenceDir = path.join(
  root,
  'public/assets/reference/pokespace-visual-guide',
)
const mapsDir = path.join(root, 'public/assets/world/maps')
const expectedReferences = [
  '01-visual-guide-complete.png',
  '02-sprite-library.png',
  '03-visual-guide-technical.png',
  '04-visual-style-guide.png',
]
const errors = []

for (const file of expectedReferences) {
  const source = path.join(referenceDir, file)
  if (!fs.existsSync(source) || fs.statSync(source).size === 0) {
    errors.push(`missing visual reference: ${file}`)
  }
}

const manifest = path.join(referenceDir, 'manifest.json')
if (!fs.existsSync(manifest)) {
  errors.push('missing visual reference manifest')
} else {
  try {
    const data = JSON.parse(fs.readFileSync(manifest, 'utf8'))
    if (data.tileSize !== 32) errors.push('manifest tileSize must be 32')
    if (data.rendering !== 'pixelated') {
      errors.push('manifest rendering must be pixelated')
    }
  } catch {
    errors.push('visual reference manifest is not valid JSON')
  }
}

for (const file of fs.readdirSync(mapsDir).filter((name) => name.endsWith('.tmx'))) {
  const map = fs.readFileSync(path.join(mapsDir, file), 'utf8')
  if (!/tilewidth="32"/.test(map) || !/tileheight="32"/.test(map)) {
    errors.push(`${file} must use 32×32 tiles`)
  }
}

if (errors.length > 0) {
  console.error(`world:style-check FAILED (${errors.length})`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

console.log('world:style-check OK')
