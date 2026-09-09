import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const ROOT = path.resolve(__dirname, '../..')
export const CLIENT_ASSETS = path.resolve(__dirname, '..')
export const DEFAULT_OT_SOURCE = path.join(ROOT, 'tools/ot-source')
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
  return DEFAULT_OT_SOURCE
}
