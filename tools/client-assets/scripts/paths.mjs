import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const ROOT = path.resolve(__dirname, '../../..')
export const CLIENT_ASSETS = path.resolve(__dirname, '..')
/** Official client things folder (things.dat / things.spr). */
export const DEFAULT_CLIENT_THINGS = path.join(ROOT, 'client/data/things')
export const INPUT_DIR = path.join(CLIENT_ASSETS, 'input')
export const OUTPUT_DIR = path.join(CLIENT_ASSETS, 'output')
export const MANIFEST_DIR = path.join(OUTPUT_DIR, 'manifests')
export const WEB_OUT = path.join(OUTPUT_DIR, 'client-10.98')
export const TILE_SIZE = 32

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

export function resolveInputDir(args) {
  if (args.input) {
    return path.isAbsolute(args.input)
      ? args.input
      : path.join(ROOT, args.input)
  }
  return DEFAULT_CLIENT_THINGS
}

/** Resolve DAT/SPR whether named things.* or Tibia.* */
export function resolveDatSpr(inputDir) {
  const candidates = [
    ['things.dat', 'things.spr'],
    ['Tibia.dat', 'Tibia.spr'],
  ]
  for (const [datName, sprName] of candidates) {
    const datPath = path.join(inputDir, datName)
    const sprPath = path.join(inputDir, sprName)
    if (fs.existsSync(datPath)) {
      return {
        datPath,
        sprPath,
        sprExists: fs.existsSync(sprPath),
      }
    }
  }
  return {
    datPath: path.join(inputDir, 'things.dat'),
    sprPath: path.join(inputDir, 'things.spr'),
    sprExists: false,
  }
}
