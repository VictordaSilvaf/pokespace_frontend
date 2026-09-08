import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(__dirname, '../..')
export const OT_SOURCE = path.join(ROOT, 'tools/ot-source')
export const OUT_TILESETS = path.join(ROOT, 'public/assets/world/tilesets')
export const OUT_MAPS = path.join(ROOT, 'public/assets/world/maps')
export const PIPELINE_CACHE = path.join(ROOT, 'tools/ot-pipeline/.cache')

export const TILE_SIZE = 32

export function requireFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Missing ${label}: ${filePath}\nSee tools/ot-pipeline/README.md`,
    )
  }
  return filePath
}

export function ensureDirs() {
  fs.mkdirSync(OUT_TILESETS, { recursive: true })
  fs.mkdirSync(OUT_MAPS, { recursive: true })
  fs.mkdirSync(PIPELINE_CACHE, { recursive: true })
}

export function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const key = arg.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      out[key] = true
    } else {
      out[key] = next
      i++
    }
  }
  return out
}
