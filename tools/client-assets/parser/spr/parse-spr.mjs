import fs from 'node:fs'

const SPRITE_SIZE = 32
const SPRITE_BYTES = SPRITE_SIZE * SPRITE_SIZE * 4

/**
 * Read OTC extended SPR (U32 count) with optional alpha channel.
 * Matches client/data/things/things.otfi: extended + transparency.
 *
 * @param {string} sprPath
 * @returns {Map<number, import('../models/types.mjs').ClientSprite>}
 */
export function parseSprFile(sprPath) {
  const buffer = fs.readFileSync(sprPath)
  const dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  let offset = 0
  const signature = dv.getUint32(offset, true)
  offset += 4
  // Prefer U32 count (GameSpritesU32); fallback if absurd
  let spritesCount = dv.getUint32(offset, true)
  let countSize = 4
  if (spritesCount <= 0 || spritesCount > 5_000_000) {
    spritesCount = dv.getUint16(4, true)
    countSize = 2
  }
  offset = 4 + countSize
  const addressBase = offset

  /** @type {Map<number, import('../models/types.mjs').ClientSprite>} */
  const byId = new Map()

  for (let id = 1; id <= spritesCount; id++) {
    const addr = dv.getUint32(addressBase + (id - 1) * 4, true)
    if (!addr) continue
    const pixels = decodeSprite(buffer, dv, addr, true)
    if (!pixels) continue
    byId.set(id, {
      id,
      width: SPRITE_SIZE,
      height: SPRITE_SIZE,
      pixels,
      signature,
    })
  }
  return byId
}

/**
 * @param {Buffer} buffer
 * @param {DataView} dv
 * @param {number} addr
 * @param {boolean} alpha
 */
function decodeSprite(buffer, dv, addr, alpha) {
  let pos = addr
  if (pos + 5 > buffer.length) return null
  // color key
  pos += 3
  const pixelDataSize = dv.getUint16(pos, true)
  pos += 2
  const end = pos + pixelDataSize
  if (end > buffer.length) return null

  const pixels = new Uint8Array(SPRITE_BYTES)
  let writePos = 0
  let read = 0
  const coloredStride = alpha ? 4 : 3

  while (read < pixelDataSize && writePos < SPRITE_BYTES) {
    if (pos + 4 > end) break
    const transparentPixels = dv.getUint16(pos, true)
    pos += 2
    const coloredPixels = dv.getUint16(pos, true)
    pos += 2
    read += 4

    for (let i = 0; i < transparentPixels && writePos < SPRITE_BYTES; i++) {
      pixels[writePos++] = 0
      pixels[writePos++] = 0
      pixels[writePos++] = 0
      pixels[writePos++] = 0
    }

    for (let i = 0; i < coloredPixels && writePos < SPRITE_BYTES; i++) {
      if (pos + coloredStride > buffer.length) return pixels
      pixels[writePos++] = buffer[pos++]
      pixels[writePos++] = buffer[pos++]
      pixels[writePos++] = buffer[pos++]
      if (alpha) {
        pixels[writePos++] = buffer[pos++]
        read += 4
      } else {
        pixels[writePos++] = 255
        read += 3
      }
    }
  }

  while (writePos < SPRITE_BYTES) {
    pixels[writePos++] = 0
    pixels[writePos++] = 0
    pixels[writePos++] = 0
    pixels[writePos++] = 0
  }
  return pixels
}
