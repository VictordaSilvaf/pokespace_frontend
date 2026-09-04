#!/usr/bin/env node
/**
 * Ensures every locale message file has the same keys as the base locale (en).
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const messagesDir = path.join(root, 'messages')
const baseLocale = 'en'

const files = (await readdir(messagesDir)).filter((f) => f.endsWith('.json'))
const basePath = path.join(messagesDir, `${baseLocale}.json`)
const base = JSON.parse(await readFile(basePath, 'utf8'))
const baseKeys = Object.keys(base)
  .filter((k) => k !== '$schema')
  .sort()

let failed = false

for (const file of files) {
  const locale = file.replace(/\.json$/, '')
  if (locale === baseLocale) continue

  const data = JSON.parse(await readFile(path.join(messagesDir, file), 'utf8'))
  const keys = Object.keys(data)
    .filter((k) => k !== '$schema')
    .sort()

  const missing = baseKeys.filter((k) => !keys.includes(k))
  const extra = keys.filter((k) => !baseKeys.includes(k))

  if (missing.length || extra.length) {
    failed = true
    console.error(`i18n mismatch for locale "${locale}":`)
    if (missing.length) console.error(`  missing: ${missing.join(', ')}`)
    if (extra.length) console.error(`  extra: ${extra.join(', ')}`)
  }
}

if (failed) {
  process.exit(1)
}

console.log(
  `check:i18n ok — ${baseKeys.length} keys across ${files.length} locales`,
)
