/**
 * @typedef {'item' | 'creature' | 'effect' | 'missile'} ThingCategory
 */

/**
 * @typedef {object} ClientSprite
 * @property {number} id
 * @property {number} width
 * @property {number} height
 * @property {Uint8Array | Buffer} pixels
 */

/**
 * @typedef {object} ClientThingGeometry
 * @property {number} width
 * @property {number} height
 * @property {number} layers
 * @property {number} patternsX
 * @property {number} patternsY
 * @property {number} patternsZ
 * @property {number} phases
 */

/**
 * @typedef {object} ClientThing
 * @property {number} id
 * @property {ThingCategory} category
 * @property {number[]} spriteIds
 * @property {ClientThingGeometry} geometry
 * @property {Record<string, unknown>} [flags]
 */

export {}
