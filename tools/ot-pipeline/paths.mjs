import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(__dirname, '../..')
export const CLIENT_THINGS = path.join(ROOT, 'client/data/things')
export const SERVER_DATA = path.join(ROOT, 'server/data')
export const DEFAULT_OTBM = path.join(SERVER_DATA, 'world/DarkXPoke.otbm')
export const OUT_TILESETS = path.join(ROOT, 'public/assets/world/tilesets')
export const OUT_MAPS = path.join(ROOT, 'public/assets/world/maps')
export const PIPELINE_CACHE = path.join(ROOT, 'tools/ot-pipeline/.cache')
export const PUBLIC_SPRITES = path.join(ROOT, 'public/assets/sprites')

export const TILE_SIZE = 32

export function resolveOtbmPath(args) {
  if (args.otbm) {
    const candidate = path.isAbsolute(args.otbm)
      ? args.otbm
      : path.join(ROOT, args.otbm)
    return requireFile(candidate, 'OTBM map')
  }
  return requireFile(DEFAULT_OTBM, 'DarkXPoke.otbm')
}

export function resolveDatSpr(args = {}) {
  const inputDir = args.input
    ? path.isAbsolute(args.input)
      ? args.input
      : path.join(ROOT, args.input)
    : CLIENT_THINGS
  for (const [datName, sprName] of [
    ['things.dat', 'things.spr'],
    ['Tibia.dat', 'Tibia.spr'],
  ]) {
    const datPath = path.join(inputDir, datName)
    const sprPath = path.join(inputDir, sprName)
    if (fs.existsSync(datPath) && fs.existsSync(sprPath)) {
      return { datPath, sprPath, inputDir }
    }
  }
  throw new Error(
    `Missing things.dat/things.spr in ${inputDir}\nSee client/data/things/`,
  )
}

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
