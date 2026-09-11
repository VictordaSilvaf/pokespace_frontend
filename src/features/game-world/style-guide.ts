/**
 * Non-negotiable visual rules for maps rendered by GameWorldViewport.
 *
 * The source boards live in /public/assets/reference/pokespace-visual-guide.
 * Keep this module deliberately data-only so map builders and UI code can
 * share the same vocabulary without importing any image at runtime.
 */
export const WORLD_STYLE_GUIDE = {
  tileSize: 32,
  rendering: 'pixelated',
  scale: {
    player: 1,
    creature: 1,
    largeCreature: 2,
    tree: 2,
  },
  palette: {
    grass: ['#2f7138', '#4d9a3e', '#79af43', '#a9d65b'],
    earth: ['#80512f', '#b47b43', '#d29a55', '#e4b56a'],
    water: ['#13538a', '#2381aa', '#5ec8d1', '#a3e5df'],
    stone: ['#45443d', '#777b76', '#a7b5a3', '#d5e0cc'],
    wood: ['#5c3826', '#70442c', '#a46a3c', '#c49358'],
    interface: ['#101018', '#f5f5f7', '#f9bc01', '#3fd46c', '#e24b4b'],
  },
  rules: [
    'Use 32×32 terrain tiles and integer scale only.',
    'Keep image smoothing disabled; never blur, anti-alias, or stretch pixel art.',
    'Build terrain in layers: base, transition, detail, and collision.',
    'Use natural transitions between grass, earth, stone, sand, and water; avoid hard rectangular terrain cuts.',
    'Use vegetation, rocks, paths, water edges, bridges, props, and landmarks as deliberate composition elements.',
    'Keep gameplay routes readable: decoration cannot obscure paths, collisions, actors, or interaction points.',
    'Match object outlines, shadow direction, saturation, and visual scale to the approved sprite library.',
    'Use the game HUD palette only for interface and interaction states, never as terrain decoration.',
  ],
  assetRoots: [
    '/assets/world/tilesets',
    '/assets/sprites/player',
    '/assets/sprites/creature',
    '/assets/sprites/item',
    '/assets/ui',
  ],
  references: [
    '/assets/reference/pokespace-visual-guide/01-visual-guide-complete.png',
    '/assets/reference/pokespace-visual-guide/02-sprite-library.png',
    '/assets/reference/pokespace-visual-guide/03-visual-guide-technical.png',
    '/assets/reference/pokespace-visual-guide/04-visual-style-guide.png',
  ],
} as const

export type WorldStyleGuide = typeof WORLD_STYLE_GUIDE
