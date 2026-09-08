/**
 * Build slim game-data catalogs from tools/server-data XML (declarative only).
 * Does not execute or translate Lua scripts.
 *
 * Usage: node ./tools/catalog/build-catalog.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const SERVER_DATA = path.join(ROOT, 'tools/server-data')
const OUT_DIR = path.join(ROOT, 'src/features/game-data/generated')

const SKIP_STEM_PREFIXES = ['shiny ', 'xmas ', 'mega ', 'dark ', 'crystal ']

function attr(tag, name) {
  const re = new RegExp(`\\b${name}="([^"]*)"`, 'i')
  const m = tag.match(re)
  return m ? m[1] : undefined
}

function flagValue(xml, key) {
  const re = new RegExp(
    `<flag\\s+${key}="([^"]*)"\\s*/>`,
    'i',
  )
  const m = xml.match(re)
  return m ? m[1] : undefined
}

function parseIntOrNull(v) {
  if (v == null || v === '') return null
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

function normalizeType(raw) {
  if (!raw || raw === 'none') return null
  return String(raw).trim().toLowerCase()
}

function shouldSkipMonsterFile(stem) {
  const lower = stem.toLowerCase()
  return SKIP_STEM_PREFIXES.some((p) => lower.startsWith(p))
}

function parseMonsterXml(filePath, fileName) {
  const xml = fs.readFileSync(filePath, 'utf8')
  const monsterOpen = xml.match(/<monster\b[^>]*>/i)
  if (!monsterOpen) return null

  const name = attr(monsterOpen[0], 'name')
  if (!name) return null

  const race = normalizeType(attr(monsterOpen[0], 'race'))
  const race2 = normalizeType(attr(monsterOpen[0], 'race2'))
  const types = [race, race2].filter(Boolean)

  const levelTag = xml.match(/<level\b[^/]*\/>/i)?.[0] ?? ''
  const healthTag = xml.match(/<health\b[^/]*\/>/i)?.[0] ?? ''
  const lookTag = xml.match(/<look\b[^/]*\/>/i)?.[0] ?? ''

  const moves = []
  const movesBlock = xml.match(/<moves>([\s\S]*?)<\/moves>/i)?.[1] ?? ''
  for (const m of movesBlock.matchAll(/<move\b[^/]*\/>/gi)) {
    const moveName = attr(m[0], 'name')
    if (!moveName) continue
    moves.push({
      name: moveName,
      interval: parseIntOrNull(attr(m[0], 'interval')),
      isTarget: attr(m[0], 'isTarget') === '1',
      range: parseIntOrNull(attr(m[0], 'range')),
    })
  }

  const evolutions = []
  const evoBlock = xml.match(/<evolutions>([\s\S]*?)<\/evolutions>/i)?.[1] ?? ''
  for (const m of evoBlock.matchAll(/<evolution\b[^/]*\/>/gi)) {
    const evoName = attr(m[0], 'name')
    if (!evoName) continue
    evolutions.push({
      name: evoName,
      level: parseIntOrNull(attr(m[0], 'level')),
      chance: parseIntOrNull(attr(m[0], 'chance')),
      itemName: attr(m[0], 'itemName') ?? null,
      count: parseIntOrNull(attr(m[0], 'count')),
    })
  }

  const flyable = parseIntOrNull(flagValue(xml, 'flyable'))
  const rideable = parseIntOrNull(flagValue(xml, 'rideable'))
  const surfable = parseIntOrNull(flagValue(xml, 'surfable'))

  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    file: `Pokes1/${fileName}`,
    dexId: parseIntOrNull(flagValue(xml, 'dexentry')),
    types,
    lookType: parseIntOrNull(attr(lookTag, 'type')),
    portraitId: parseIntOrNull(flagValue(xml, 'portraitid')),
    levelMin: parseIntOrNull(attr(levelTag, 'min')),
    levelMax: parseIntOrNull(attr(levelTag, 'max')),
    hp: parseIntOrNull(attr(healthTag, 'max')),
    experience: parseIntOrNull(attr(monsterOpen[0], 'experience')),
    speed: parseIntOrNull(attr(monsterOpen[0], 'speed')),
    hasShiny: flagValue(xml, 'hasshiny') === '1',
    hasMega: flagValue(xml, 'hasmega') === '1',
    flyable: flyable && flyable > 0 ? flyable : 0,
    rideable: rideable && rideable > 0 ? rideable : 0,
    surfable: surfable && surfable > 0 ? surfable : 0,
    catchChance: parseIntOrNull(flagValue(xml, 'catchchance')),
    moves,
    evolutions,
  }
}

function buildPokemon() {
  const dir = path.join(SERVER_DATA, 'monster/Pokes1')
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.xml'))
  const byDex = new Map()
  let skipped = 0

  for (const fileName of files) {
    const stem = path.basename(fileName, '.xml')
    if (shouldSkipMonsterFile(stem)) {
      skipped += 1
      continue
    }
    const entry = parseMonsterXml(path.join(dir, fileName), fileName)
    if (!entry || entry.dexId == null) {
      skipped += 1
      continue
    }
    const existing = byDex.get(entry.dexId)
    // Prefer exact filename match to base name (avoid duplicate dex collisions)
    if (!existing) {
      byDex.set(entry.dexId, entry)
      continue
    }
    const prefer =
      stem.toLowerCase() === entry.name.toLowerCase() ||
      (existing.file.includes(' ') && !fileName.includes(' '))
    if (prefer) byDex.set(entry.dexId, entry)
  }

  return {
    pokemon: [...byDex.values()].sort((a, b) => a.dexId - b.dexId),
    skipped,
    filesSeen: files.length,
  }
}

function buildMoves() {
  const spellsPath = path.join(SERVER_DATA, 'spells/spells.xml')
  const xml = fs.readFileSync(spellsPath, 'utf8')
  const moves = []

  const seen = new Set()

  function pushMove(kind, attrsSrc) {
    const name = attr(attrsSrc, 'name')
    if (!name) return
    const key = `${kind.toLowerCase()}::${name}`
    if (seen.has(key)) return
    seen.add(key)
    moves.push({
      name,
      kind: kind.toLowerCase(),
      group: attr(attrsSrc, 'group') ?? null,
      words: attr(attrsSrc, 'words') ?? null,
      script: attr(attrsSrc, 'script') ?? null,
      aggressive: attr(attrsSrc, 'aggressive') === '1',
      needLearn: attr(attrsSrc, 'needlearn') === '1',
      direction: attr(attrsSrc, 'direction') === '1',
      blockWalls: attr(attrsSrc, 'blockwalls') === '1',
    })
  }

  // Self-closing tags (script paths contain `/`, so do not use [^/]*)
  for (const m of xml.matchAll(/<(instant|rune|conjure)\b([^>]*)\/>/gi)) {
    pushMove(m[1], `<x ${m[2]}>`)
  }

  // Paired tags
  for (const m of xml.matchAll(
    /<(instant|rune|conjure)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
  )) {
    pushMove(m[1], `<x ${m[2]}>`)
  }

  moves.sort((a, b) => a.name.localeCompare(b.name))
  return moves
}

function buildNpcs() {
  const dir = path.join(SERVER_DATA, 'npc')
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.xml') && fs.statSync(path.join(dir, f)).isFile())

  const npcs = []
  for (const fileName of files) {
    const xml = fs.readFileSync(path.join(dir, fileName), 'utf8')
    const npcOpen = xml.match(/<npc\b[^>]*>/i)?.[0]
    if (!npcOpen) continue
    const name = attr(npcOpen, 'name')
    if (!name) continue
    const lookTag = xml.match(/<look\b[^/]*\/>/i)?.[0] ?? ''
    const params = {}
    for (const m of xml.matchAll(
      /<parameter\s+key="([^"]+)"\s+value="([^"]*)"\s*\/>/gi,
    )) {
      params[m[1]] = m[2]
    }
    npcs.push({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      file: fileName,
      lookType: parseIntOrNull(attr(lookTag, 'type')),
      greet: params.message_greet ?? null,
      decline: params.message_decline ?? null,
      script: attr(npcOpen, 'script') ?? null,
    })
  }

  npcs.sort((a, b) => a.name.localeCompare(b.name))
  return npcs
}

function writeJson(fileName, data) {
  const outPath = path.join(OUT_DIR, fileName)
  fs.writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  return outPath
}

function main() {
  if (!fs.existsSync(SERVER_DATA)) {
    throw new Error(`Missing server data at ${SERVER_DATA}`)
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const { pokemon, skipped, filesSeen } = buildPokemon()
  const moves = buildMoves()
  const npcs = buildNpcs()
  const generatedAt = new Date().toISOString()

  writeJson('pokemon.json', pokemon)
  writeJson('moves.json', moves)
  writeJson('npcs.json', npcs)
  writeJson('meta.json', {
    generatedAt,
    source: 'tools/server-data',
    counts: {
      pokemon: pokemon.length,
      moves: moves.length,
      npcs: npcs.length,
      monsterFilesSeen: filesSeen,
      monsterFilesSkipped: skipped,
    },
  })

  console.log(
    `catalog:build ok — pokemon=${pokemon.length} moves=${moves.length} npcs=${npcs.length} (skipped monsters=${skipped})`,
  )
}

main()
