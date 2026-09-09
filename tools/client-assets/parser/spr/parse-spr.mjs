import fs from 'node:fs'
import { read as readSpr } from '@v0rt4c/spr'

/**
 * @param {string} sprPath
 * @returns {Map<number, import('../models/types.mjs').ClientSprite>}
 */
export function parseSprFile(sprPath) {
  const buffer = new Uint8Array(fs.readFileSync(sprPath))
  const container = readSpr(buffer)
  /** @type {Map<number, import('../models/types.mjs').ClientSprite>} */
  const byId = new Map()
  for (const sprite of container.sprites ?? []) {
    const pixels = sprite.rgba
    if (!pixels) continue
    byId.set(sprite.id, {
      id: sprite.id,
      width: 32,
      height: 32,
      pixels,
    })
  }
  return byId
}
