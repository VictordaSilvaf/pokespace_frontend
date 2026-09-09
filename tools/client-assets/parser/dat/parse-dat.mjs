import fs from 'node:fs'
import { DatReader } from '@v0rt4c/dat'

/**
 * Force-parse with 755–772 layout. DarkXPoke DAT signature is custom;
 * structure is close enough for outfits/items when forced to 772.
 *
 * @param {string} datPath
 * @returns {{ signature: number, things: import('../models/types.mjs').ClientThing[] }}
 */
export function parseDatFile(datPath) {
  const buffer = new Uint8Array(fs.readFileSync(datPath))
  const signature =
    buffer[0] | (buffer[1] << 8) | (buffer[2] << 16) | (buffer[3] << 24)

  const log = console.log
  console.log = () => {}
  let container
  try {
    container = DatReader(buffer, 772).parse()
  } finally {
    console.log = log
  }

  /** @type {import('../models/types.mjs').ClientThing[]} */
  const things = []

  const pushAll = (list, category) => {
    for (const thing of list ?? []) {
      const tex = thing.texture ?? {}
      things.push({
        id: thing.id ?? thing.thingId,
        category,
        spriteIds: [...(thing.spriteIds ?? [])],
        geometry: {
          width: Number(tex.width) || 1,
          height: Number(tex.height) || 1,
          layers: Number(tex.layers) || 1,
          patternsX: Number(tex.patternX) || 1,
          patternsY: Number(tex.patternY) || 1,
          patternsZ: Number(tex.patternZ) || 1,
          phases: Number(tex.animations) || 1,
        },
      })
    }
  }

  pushAll(container.items, 'item')
  pushAll(container.outfits ?? container.creatures, 'creature')
  pushAll(container.effects, 'effect')
  pushAll(container.missiles, 'missile')

  return { signature, things }
}
