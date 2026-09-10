#!/usr/bin/env node
/**
 * Extract Pokémon sprites into public/assets/sprites/creature/{lookType}.png
 *
 * Primary: National Dex sprites (PokeAPI) keyed by dexId, saved under lookType
 * so runtime paths stay sprites/creature/{lookType}.png.
 *
 * Optional OT compose is attempted when DAT+SPR parse yields a frame, but
 * DarkXPoke DAT id alignment is still best-effort — PokeAPI guarantees
 * recognizable species art for the Pokédex/CDN.
 *
 *   pnpm assets:extract:public
 */
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

import {
  composeOutfitFrame,
  parseDatFile,
} from '../parser/dat/parse-dat.mjs'
import { parseSprFile } from '../parser/spr/parse-spr.mjs'
import { DEFAULT_CLIENT_THINGS, ROOT, TILE_SIZE } from './paths.mjs'

const catalog = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'src/features/game-data/generated/pokemon.json'),
    'utf8',
  ),
)

const creatureOut = path.join(ROOT, 'public/assets/sprites/creature')
const itemOut = path.join(ROOT, 'public/assets/sprites/item')
fs.mkdirSync(creatureOut, { recursive: true })
fs.mkdirSync(itemOut, { recursive: true })

const POKEAPI_SPRITE = (dexId) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexId}.png`

function writeRgbaPng(filePath, width, height, pixels) {
  const png = new PNG({ width, height, colorType: 6 })
  Buffer.from(pixels).copy(png.data)
  fs.writeFileSync(filePath, PNG.sync.write(png))
}

/** Scale any PNG buffer to 32×32 RGBA (nearest neighbor) for consistent FE tiles. */
function scaleToTile(pngBuf) {
  const src = PNG.sync.read(pngBuf)
  const out = new PNG({ width: TILE_SIZE, height: TILE_SIZE, colorType: 6 })
  for (let y = 0; y < TILE_SIZE; y++) {
    for (let x = 0; x < TILE_SIZE; x++) {
      const sx = Math.min(src.width - 1, Math.floor((x * src.width) / TILE_SIZE))
      const sy = Math.min(
        src.height - 1,
        Math.floor((y * src.height) / TILE_SIZE),
      )
      const si = (sy * src.width + sx) << 2
      const di = (y * TILE_SIZE + x) << 2
      out.data[di] = src.data[si]
      out.data[di + 1] = src.data[si + 1]
      out.data[di + 2] = src.data[si + 2]
      out.data[di + 3] = src.data[si + 3]
    }
  }
  return PNG.sync.write(out)
}

async function fetchDexSprite(dexId) {
  const res = await fetch(POKEAPI_SPRITE(dexId))
  if (!res.ok) return null
  const buf = Buffer.from(await res.arrayBuffer())
  return scaleToTile(buf)
}

function tryLoadOtCreatures() {
  try {
    const datPath = path.join(DEFAULT_CLIENT_THINGS, 'things.dat')
    const sprPath = path.join(DEFAULT_CLIENT_THINGS, 'things.spr')
    if (!fs.existsSync(datPath) || !fs.existsSync(sprPath)) return null
    const sprites = parseSprFile(sprPath)
    const dat = parseDatFile(datPath)
    const map = new Map(
      dat.things
        .filter((t) => t.category === 'creature')
        .map((t) => [t.id, t]),
    )
    return { sprites, map }
  } catch (err) {
    console.warn('[extract-to-public] OT DAT skipped:', err.message || err)
    return null
  }
}

async function main() {
  const ot = tryLoadOtCreatures()
  const lookTypes = new Map()
  for (const p of catalog) {
    if (p.lookType == null || p.dexId == null) continue
    if (!lookTypes.has(p.lookType)) lookTypes.set(p.lookType, p.dexId)
  }
  // Trainer outfits
  lookTypes.set(510, null)
  lookTypes.set(511, null)

  let fromApi = 0
  let fromOt = 0
  let miss = 0

  for (const [lookType, dexId] of lookTypes) {
    const outFile = path.join(creatureOut, `${lookType}.png`)
    let wrote = false

    // Prefer PokeAPI when we have a National Dex id (correct species art).
    if (dexId != null) {
      try {
        const png = await fetchDexSprite(dexId)
        if (png) {
          fs.writeFileSync(outFile, png)
          fromApi += 1
          wrote = true
        }
      } catch (err) {
        console.warn(`dex ${dexId} fetch failed:`, err.message || err)
      }
    }

    // OT compose fallback (trainers / API miss)
    if (!wrote && ot) {
      const thing = ot.map.get(lookType)
      if (thing) {
        const frame = composeOutfitFrame(thing, ot.sprites)
        if (frame) {
          // Downscale multi-tile sheets to a single tile for FE default geom
          const png = new PNG({
            width: frame.width,
            height: frame.height,
            colorType: 6,
          })
          frame.pixels.copy(png.data)
          const scaled = scaleToTile(PNG.sync.write(png))
          fs.writeFileSync(outFile, scaled)
          fromOt += 1
          wrote = true
        }
      }
    }

    if (!wrote) miss += 1
  }

  // Optional: keep used item tiles from SPR id heuristic (world props), not required for Pokédex
  const usedIdsPath = path.join(ROOT, 'tools/ot-pipeline/.cache/used-ids.json')
  let items = 0
  let itemMiss = 0
  if (ot && fs.existsSync(usedIdsPath)) {
    const usedItemIds = JSON.parse(fs.readFileSync(usedIdsPath, 'utf8')).ids ?? []
    for (const id of usedItemIds) {
      const s = ot.sprites.get(id)
      if (!s) {
        itemMiss += 1
        continue
      }
      writeRgbaPng(path.join(itemOut, `${id}.png`), TILE_SIZE, TILE_SIZE, s.pixels)
      items += 1
    }
  }

  const creatureTotal = lookTypes.size
  const missRate = creatureTotal ? miss / creatureTotal : 1
  console.log(
    `extract-to-public ok — creatures api=${fromApi} ot=${fromOt} miss=${miss}/${creatureTotal} items=${items} itemMiss=${itemMiss}`,
  )
  if (missRate > 0.05) {
    throw new Error(
      `Creature miss rate ${(missRate * 100).toFixed(1)}% exceeds 5% gate`,
    )
  }

  // Smoke: Bulbasaur lookType 376 and Pikachu 410 must exist
  for (const id of [376, 410]) {
    const p = path.join(creatureOut, `${id}.png`)
    if (!fs.existsSync(p)) throw new Error(`Smoke missing ${p}`)
  }
  console.log('smoke ok: creature/376.png and creature/410.png')
}

main().catch((err) => {
  console.error('[extract-to-public] failed:', err.message || err)
  process.exit(1)
})
