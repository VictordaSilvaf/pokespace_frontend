import fs from 'node:fs'
import { DatReader } from '@v0rt4c/dat'

/**
 * @param {string} datPath
 * @returns {{ signature: number, things: import('../models/types.mjs').ClientThing[] }}
 */
export function parseDatFile(datPath) {
  const buffer = new Uint8Array(fs.readFileSync(datPath))
  const container = DatReader(buffer).parse()

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
        flags: thing.flags ? { ...thing.flags } : {},
      })
    }
  }

  pushAll(container.items, 'item')
  pushAll(container.looktypes, 'creature')
  pushAll(container.effects, 'effect')
  pushAll(container.missiles, 'missile')

  return {
    signature: container.signature,
    things,
  }
}
