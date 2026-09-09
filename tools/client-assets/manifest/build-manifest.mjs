/**
 * @param {object} opts
 * @param {number} opts.signature
 * @param {import('../parser/models/types.mjs').ClientThing[]} opts.things
 * @param {string} [opts.source]
 */
export function buildManifest({ signature, things, source = 'client' }) {
  /** @type {Record<string, object>} */
  const items = {}
  /** @type {Record<string, object>} */
  const creatures = {}
  /** @type {Record<string, object>} */
  const effects = {}
  /** @type {Record<string, object>} */
  const missiles = {}

  for (const thing of things) {
    const entry = {
      id: thing.id,
      category: thing.category,
      sprites: thing.spriteIds,
      geometry: {
        width: thing.geometry.width,
        height: thing.geometry.height,
        layers: thing.geometry.layers,
        patternsX: thing.geometry.patternsX,
        patternsY: thing.geometry.patternsY,
        patternsZ: thing.geometry.patternsZ,
        phases: thing.geometry.phases,
      },
    }
    const key = String(thing.id)
    if (thing.category === 'item') items[key] = entry
    else if (thing.category === 'creature') creatures[key] = entry
    else if (thing.category === 'effect') effects[key] = entry
    else if (thing.category === 'missile') missiles[key] = entry
  }

  return {
    version: '10.98',
    source,
    signature,
    generatedAt: new Date().toISOString(),
    counts: {
      items: Object.keys(items).length,
      creatures: Object.keys(creatures).length,
      effects: Object.keys(effects).length,
      missiles: Object.keys(missiles).length,
    },
    items,
    creatures,
    effects,
    missiles,
  }
}
