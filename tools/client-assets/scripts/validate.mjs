#!/usr/bin/env node
/**
 * Validate client-assets manifest (+ optional PNGs).
 *
 *   pnpm assets:validate
 *   pnpm assets:validate -- --require-png
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { MANIFEST_DIR, WEB_OUT, parseArgs } from './paths.mjs'

const args = parseArgs(process.argv.slice(2))
const requirePng = Boolean(args['require-png'])
const manifestPath = path.join(MANIFEST_DIR, 'manifest.json')
const scaffoldPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../manifests/scaffold.json',
)

if (!fs.existsSync(manifestPath)) {
  if (fs.existsSync(scaffoldPath)) {
    fs.mkdirSync(MANIFEST_DIR, { recursive: true })
    fs.copyFileSync(scaffoldPath, manifestPath)
    console.warn(
      'No manifest — copied scaffold (run assets:discover with DAT/SPR)',
    )
  } else {
    console.error(`Missing ${manifestPath}. Run pnpm assets:discover first.`)
    process.exit(1)
  }
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const errors = []

if (manifest.version !== '10.98') {
  errors.push(`Unexpected version: ${manifest.version}`)
}

const dirFor = {
  item: 'items',
  creature: 'creatures',
  effect: 'effects',
  missile: 'missiles',
}

for (const [bucket, category] of [
  ['items', 'item'],
  ['creatures', 'creature'],
  ['effects', 'effect'],
  ['missiles', 'missile'],
]) {
  const map = manifest[bucket] ?? {}
  const seen = new Set()
  for (const [key, entry] of Object.entries(map)) {
    if (seen.has(key)) errors.push(`Duplicate ${category} id ${key}`)
    seen.add(key)
    if (entry.id == null) errors.push(`${category} ${key}: missing id`)
    if (!Array.isArray(entry.sprites) || entry.sprites.length === 0) {
      errors.push(`${category} ${key}: empty sprites`)
    }
    const g = entry.geometry
    if (!g || !g.width || !g.height || !g.layers) {
      errors.push(`${category} ${key}: invalid geometry`)
    }
    if (requirePng) {
      const png = path.join(WEB_OUT, dirFor[category], `${entry.id}.png`)
      if (!fs.existsSync(png)) {
        errors.push(`${category} ${key}: missing PNG ${png}`)
      }
    }
  }
}

if (errors.length) {
  console.error(`assets:validate FAILED (${errors.length} issues)`)
  for (const e of errors.slice(0, 40)) console.error(`  - ${e}`)
  if (errors.length > 40) console.error(`  … +${errors.length - 40} more`)
  process.exit(1)
}

console.log(
  `assets:validate OK — items=${manifest.counts?.items ?? 0} creatures=${manifest.counts?.creatures ?? 0} effects=${manifest.counts?.effects ?? 0} missiles=${manifest.counts?.missiles ?? 0}`,
)
