import fs from 'node:fs'

/**
 * OTC / DarkXPoke DAT reader (things.otfi: extended U32 sprites, no frame-groups).
 *
 * Attribute payloads tuned for this pack (writable length is U8; opacity U8).
 * When the attr stream desyncs, resync by finding the next 0xFF + valid geometry
 * whose sprite ids exist in the SPR map (or are zero placeholders).
 */

const ThingLastAttr = 255

/** Known attr → payload size in bytes (or 'market'). Unknown attrs = 0. */
const ATTR_PAYLOAD = {
  0: 2, // Ground u16
  8: 1, // Writable maxLen as U8 in this pack
  9: 1, // WritableOnce
  21: 4, // Light
  24: 4, // Displacement
  25: 2, // Elevation
  28: 2, // MinimapColor
  29: 2, // LensHelp
  32: 2, // Cloth
  33: 'market',
  100: 1, // Opacity (OTC extra)
  251: 2, // DefaultAction
}

/**
 * @param {string} datPath
 * @param {{ sprites?: Map<number, unknown> }} [opts] SPR map for validation/resync
 */
export function parseDatFile(datPath, opts = {}) {
  const buffer = fs.readFileSync(datPath)
  const dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  const sprites = opts.sprites ?? null

  let offset = 0
  const readU8 = () => {
    const v = dv.getUint8(offset)
    offset += 1
    return v
  }
  const readU16 = () => {
    const v = dv.getUint16(offset, true)
    offset += 2
    return v
  }
  const readU32 = () => {
    const v = dv.getUint32(offset, true)
    offset += 4
    return v
  }
  const readString = () => {
    const len = readU16()
    if (offset + len > buffer.length) {
      throw new Error(`DAT string overruns at ${offset}`)
    }
    offset += len
  }

  const signature = readU32()
  const itemCount = readU16()
  const looktypeCount = readU16()
  const effectCount = readU16()
  const missileCount = readU16()

  /**
   * @param {number} geomAt
   * @returns {null | { next: number, spriteIds: number[], geometry: import('../models/types.mjs').ClientThingGeometry }}
   */
  const tryGeom = (geomAt) => {
    let o = geomAt
    if (o + 7 > buffer.length) return null
    const width = buffer[o++] || 1
    const height = buffer[o++] || 1
    if (width < 1 || height < 1 || width > 32 || height > 32) return null
    if (width > 1 || height > 1) {
      if (o >= buffer.length) return null
      o++ // realSize
    }
    const layers = buffer[o++] || 1
    const patternsX = buffer[o++] || 1
    const patternsY = buffer[o++] || 1
    const patternsZ = buffer[o++] || 1
    const phases = buffer[o++] || 1
    if (
      layers > 16 ||
      patternsX > 16 ||
      patternsY > 16 ||
      patternsZ > 8 ||
      phases > 255
    ) {
      return null
    }
    const total =
      width * height * layers * patternsX * patternsY * patternsZ * phases
    if (total < 1 || total > 4096) return null
    if (o + total * 4 > buffer.length) return null

    /** @type {number[]} */
    const spriteIds = []
    for (let i = 0; i < total; i++) {
      const id = dv.getUint32(o, true)
      o += 4
      spriteIds.push(id)
    }
    // Do not require SPR presence here — some ids fail decode but geometry is valid.
    // Extract step skips missing pixels.

    return {
      next: o,
      spriteIds,
      geometry: {
        width,
        height,
        layers,
        patternsX,
        patternsY,
        patternsZ,
        phases,
      },
    }
  }

  /**
   * @param {number} start
   */
  const readThingFrom = (start) => {
    // 1) Attr-aware
    let o = start
    const r8 = () => buffer[o++]
    const r16 = () => {
      const v = dv.getUint16(o, true)
      o += 2
      return v
    }
    const rStr = () => {
      const n = r16()
      o += n
    }
    try {
      for (let n = 0; n < 400; n++) {
        if (o >= buffer.length) break
        const raw = r8()
        if (raw === ThingLastAttr) {
          const g = tryGeom(o)
          if (g) return g
          break
        }
        const payload = ATTR_PAYLOAD[raw]
        if (payload === 'market') {
          r16()
          r16()
          r16()
          rStr()
          r16()
          r16()
        } else if (typeof payload === 'number') {
          o += payload
        }
      }
    } catch {
      // fall through to resync
    }

    // 2) Resync: next 0xFF + valid geometry within a window
    for (let attrLen = 1; attrLen <= 512; attrLen++) {
      const pos = start + attrLen - 1
      if (pos >= buffer.length) break
      if (buffer[pos] !== ThingLastAttr) continue
      const g = tryGeom(pos + 1)
      if (g) return g
    }
    return null
  }

  /** @type {import('../models/types.mjs').ClientThing[]} */
  const things = []
  let cursor = offset // after header (=12)

  const pushRange = (from, to, category) => {
    for (let id = from; id <= to; id++) {
      if (cursor >= buffer.length) {
        console.warn(
          `[parse-dat] EOF at ${category}:${id} (wanted through ${to})`,
        )
        break
      }
      const parsed = readThingFrom(cursor)
      if (!parsed) {
        console.warn(
          `[parse-dat] stop at ${category}:${id} offset=${cursor}`,
        )
        break
      }
      things.push({
        id,
        category,
        spriteIds: parsed.spriteIds,
        geometry: parsed.geometry,
      })
      cursor = parsed.next
    }
  }

  pushRange(100, itemCount, 'item')
  pushRange(1, looktypeCount, 'creature')
  pushRange(1, effectCount, 'effect')
  pushRange(1, missileCount, 'missile')

  return {
    signature,
    things,
    counts: {
      items: itemCount,
      looktypes: looktypeCount,
      effects: effectCount,
      missiles: missileCount,
    },
  }
}

/**
 * @param {import('../models/types.mjs').ClientThingGeometry} g
 * @param {{ w?: number, h?: number, layer?: number, x?: number, y?: number, z?: number, phase?: number }} sel
 */
export function spriteIndex(g, sel = {}) {
  const w = sel.w ?? 0
  const h = sel.h ?? 0
  const l = sel.layer ?? 0
  const x = sel.x ?? 0
  const y = sel.y ?? 0
  const z = sel.z ?? 0
  const a = sel.phase ?? 0
  return (
    ((((((a % g.phases) * g.patternsZ + z) * g.patternsY + y) * g.patternsX +
      x) *
      g.layers +
      l) *
      g.height +
      h) *
      g.width +
    w
  )
}

/**
 * Prefer south-facing idle tile(s) for portraits.
 * @param {import('../models/types.mjs').ClientThing} thing
 * @returns {number | null}
 */
export function pickPortraitSpriteId(thing) {
  const g = thing.geometry
  const southX = g.patternsX >= 3 ? 2 : 0
  for (let phase = 0; phase < g.phases; phase++) {
    for (let layer = 0; layer < g.layers; layer++) {
      for (let h = 0; h < g.height; h++) {
        for (let w = 0; w < g.width; w++) {
          const idx = spriteIndex(g, { w, h, layer, x: southX, phase })
          const id = thing.spriteIds[idx]
          if (id) return id
        }
      }
    }
  }
  return thing.spriteIds.find((s) => s > 0) ?? null
}

/**
 * Composite multi-tile outfit frame into one RGBA buffer (width*32 x height*32).
 * OT drawing order: sprite (w,h) is placed at pixel ((width-1-w)*32, (height-1-h)*32).
 *
 * @param {import('../models/types.mjs').ClientThing} thing
 * @param {Map<number, { pixels: Uint8Array|Buffer }>} sprites
 * @param {{ x?: number, phase?: number, layer?: number }} [facing]
 * @returns {{ width: number, height: number, pixels: Buffer } | null}
 */
export function composeOutfitFrame(thing, sprites, facing = {}) {
  const g = thing.geometry
  const x = facing.x ?? (g.patternsX >= 3 ? 2 : 0)
  const phase = facing.phase ?? 0
  const layer = facing.layer ?? 0
  const outW = g.width * 32
  const outH = g.height * 32
  const pixels = Buffer.alloc(outW * outH * 4)
  let any = false
  for (let h = 0; h < g.height; h++) {
    for (let w = 0; w < g.width; w++) {
      const idx = spriteIndex(g, { w, h, layer, x, phase })
      const sid = thing.spriteIds[idx]
      if (!sid) continue
      const spr = sprites.get(sid)
      if (!spr) continue
      any = true
      const dx = (g.width - 1 - w) * 32
      const dy = (g.height - 1 - h) * 32
      const src = Buffer.from(spr.pixels)
      for (let py = 0; py < 32; py++) {
        for (let px = 0; px < 32; px++) {
          const si = (py * 32 + px) * 4
          if (src[si + 3] === 0) continue
          const di = ((dy + py) * outW + (dx + px)) * 4
          src.copy(pixels, di, si, si + 4)
        }
      }
    }
  }
  if (!any) return null
  return { width: outW, height: outH, pixels }
}
