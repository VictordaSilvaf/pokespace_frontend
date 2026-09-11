import { useEffect, useRef, useState } from 'react'

import { loadActiveCharacterId } from '#/features/characters/active-character'
import {
  PLAYER_CREATURE_ID,
  WORLD_NPC_DEFS,
  creatureUrl,
  drawCreatureFrame,
  facingFromVector,
  geometryForCreature,
  type FacingDir,
} from '#/features/game-data'
import type { Peke } from '#/features/game-hud/types'

import { resolveWorldAssets } from '../assets'
import { useWorldRealtime } from '../realtime/use-world-realtime'
import {
  drawTile,
  findSpawnPoint,
  loadImage,
  loadTmxMap,
  rectHitsSolid,
  type TileMap,
} from '../tmx'

type Actor = {
  x: number
  y: number
  facing: FacingDir
  phase: number
  phaseT: number
  creatureId: number
  size: number
  label?: string
}

type GameWorldViewportProps = {
  followerPeke?: Peke | null
}

function coverScale(
  viewW: number,
  viewH: number,
  mapPxW: number,
  mapPxH: number,
  preferredScale: number,
) {
  const cover = Math.max(viewW / mapPxW, viewH / mapPxH)
  return Math.max(cover, preferredScale)
}

function resizeCanvas(
  canvas: HTMLCanvasElement,
  viewW: number,
  viewH: number,
  dpr: number,
) {
  const bufferW = Math.max(1, Math.round(viewW * dpr))
  const bufferH = Math.max(1, Math.round(viewH * dpr))
  if (canvas.width !== bufferW) canvas.width = bufferW
  if (canvas.height !== bufferH) canvas.height = bufferH
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = false
  }
  return ctx
}

function advanceWalkPhase(
  actor: Actor,
  moving: boolean,
  dt: number,
  frameRate = 8,
) {
  const geometry = geometryForCreature(actor.creatureId)
  const phases = geometry?.phases ?? 1
  if (!moving || phases <= 1) {
    actor.phase = Math.floor(phases / 2)
    actor.phaseT = 0
    return
  }
  actor.phaseT += dt * frameRate
  while (actor.phaseT >= 1) {
    actor.phaseT -= 1
    actor.phase = (actor.phase + 1) % phases
  }
}

export function GameWorldViewport({
  followerPeke = null,
}: GameWorldViewportProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const mapCanvasRef = useRef<HTMLCanvasElement>(null)
  const actorCanvasRef = useRef<HTMLCanvasElement>(null)
  const followerPekeRef = useRef<Peke | null>(followerPeke)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [characterId] = useState(() => loadActiveCharacterId())
  const realtime = useWorldRealtime({
    characterId,
    mapId: 'laboratory',
    enabled: Boolean(characterId),
  })
  const realtimeRef = useRef(realtime)
  realtimeRef.current = realtime

  useEffect(() => {
    followerPekeRef.current = followerPeke
  }, [followerPeke])

  useEffect(() => {
    const root = rootRef.current
    const mapCanvas = mapCanvasRef.current
    const actorCanvas = actorCanvasRef.current
    if (!root || !mapCanvas || !actorCanvas) return

    let cancelled = false
    let raf = 0
    const keys = new Set<string>()
    const imageCache = new Map<number, HTMLImageElement>()
    let lastServerStepAt = 0
    const serverStepMs = 140

    const ensureImage = (creatureId: number) => {
      let img = imageCache.get(creatureId)
      if (img) return img
      img = new Image()
      img.decoding = 'async'
      img.onerror = () => {
        // CDN miss (NPC lookTypes, etc.) — silence repeat errors
        img!.onerror = null
        img!.src = ''
      }
      img.src = creatureUrl(creatureId)
      imageCache.set(creatureId, img)
      return img
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (
        key === 'w' ||
        key === 'a' ||
        key === 's' ||
        key === 'd' ||
        key === 'arrowup' ||
        key === 'arrowdown' ||
        key === 'arrowleft' ||
        key === 'arrowright'
      ) {
        event.preventDefault()
        keys.add(key)
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      keys.delete(event.key.toLowerCase())
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    let map: TileMap | null = null
    let preferredScale = 3
    let playerSize = 16
    let playerSpeed = 72
    let clearColor = '#0b1210'
    let scale = preferredScale
    let viewW = 0
    let viewH = 0
    let lastTs = performance.now()
    let resizeRaf = 0
    let mapCtx: CanvasRenderingContext2D | null = mapCanvas.getContext('2d')
    let actorCtx: CanvasRenderingContext2D | null =
      actorCanvas.getContext('2d')

    const player: Actor = {
      x: 0,
      y: 0,
      facing: 2,
      phase: 1,
      phaseT: 0,
      creatureId: PLAYER_CREATURE_ID,
      size: playerSize,
    }

    const follower: Actor = {
      x: 0,
      y: 0,
      facing: 2,
      phase: 1,
      phaseT: 0,
      creatureId: 40040,
      size: playerSize * 1.35,
    }
    let followerReady = false

    const npcs: Actor[] = WORLD_NPC_DEFS.map((def) => ({
      x: 0,
      y: 0,
      facing: 2,
      phase: 1,
      phaseT: 0,
      creatureId: def.creatureId,
      size: playerSize * 1.5,
      label: def.name,
    }))

    const remotes = new Map<string, Actor>()

    ensureImage(PLAYER_CREATURE_ID)
    for (const npc of npcs) ensureImage(npc.creatureId)

    const facingFromServer = (dir?: string): FacingDir => {
      if (dir === 'UP') return 0
      if (dir === 'RIGHT') return 1
      if (dir === 'LEFT') return 3
      return 2
    }

    const tileToPx = (tx: number, ty: number, size: number) => {
      if (!map) return { x: 0, y: 0 }
      return {
        x: tx * map.tileWidth + (map.tileWidth - size) / 2,
        y: ty * map.tileHeight + (map.tileHeight - size) / 2,
      }
    }

    const applySize = () => {
      const nextW = Math.max(
        1,
        Math.round(
          root.clientWidth ||
            window.visualViewport?.width ||
            window.innerWidth,
        ),
      )
      const nextH = Math.max(
        1,
        Math.round(
          root.clientHeight ||
            window.visualViewport?.height ||
            window.innerHeight,
        ),
      )
      if (nextW === viewW && nextH === viewH) return

      viewW = nextW
      viewH = nextH

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      mapCtx = resizeCanvas(mapCanvas, viewW, viewH, dpr)
      actorCtx = resizeCanvas(actorCanvas, viewW, viewH, dpr)

      if (map) {
        scale = coverScale(
          viewW,
          viewH,
          map.width * map.tileWidth,
          map.height * map.tileHeight,
          preferredScale,
        )
      }
    }

    const scheduleResize = () => {
      if (resizeRaf) return
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0
        applySize()
      })
    }

    const tryMove = (dx: number, dy: number) => {
      if (!map) return
      const nextX = player.x + dx
      const nextY = player.y + dy
      const maxX = map.width * map.tileWidth - player.size
      const maxY = map.height * map.tileHeight - player.size

      const clampedX = Math.max(0, Math.min(maxX, nextX))
      const clampedY = Math.max(0, Math.min(maxY, nextY))

      if (!rectHitsSolid(map, clampedX, player.y, player.size, player.size)) {
        player.x = clampedX
      }
      if (!rectHitsSolid(map, player.x, clampedY, player.size, player.size)) {
        player.y = clampedY
      }
    }

    const drawActor = (ctx: CanvasRenderingContext2D, actor: Actor) => {
      const geometry = geometryForCreature(actor.creatureId)
      const img = ensureImage(actor.creatureId)
      if (!geometry || !img.complete || img.naturalWidth === 0) return
      drawCreatureFrame(
        ctx,
        img,
        geometry,
        actor.facing,
        actor.phase,
        actor.x,
        actor.y,
        actor.size,
        actor.size,
      )
    }

    const drawNpcLabel = (
      ctx: CanvasRenderingContext2D,
      actor: Actor,
      camX: number,
      camY: number,
    ) => {
      if (!actor.label) return
      const screenX = (actor.x - camX) * scale + (actor.size * scale) / 2
      const screenY = (actor.y - camY) * scale - 6
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.font = '600 11px ui-sans-serif, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      const w = ctx.measureText(actor.label).width + 10
      ctx.fillRect(screenX - w / 2, screenY - 12, w, 16)
      ctx.fillStyle = '#f6f0e4'
      ctx.fillText(actor.label, screenX, screenY)
      ctx.restore()
    }

    const syncFromServer = () => {
      const rt = realtimeRef.current
      if (!rt.connected || !map) return
      const selfId = rt.selfEntityId
      if (selfId) {
        const self = rt.entities.get(selfId)
        if (self?.position) {
          const px = tileToPx(self.position.x, self.position.y, player.size)
          player.x = px.x
          player.y = px.y
          player.facing = facingFromServer(self.direction)
        }
      }

      const seen = new Set<string>()
      for (const [id, entity] of rt.entities) {
        if (id === selfId) continue
        if (entity.type === 'npc' || id.startsWith('npc-')) {
          // server NPCs overlay local cosmetic NPCs by label later
          continue
        }
        if (entity.type === 'pokemon' || id.startsWith('pokemon-')) continue
        seen.add(id)
        let actor = remotes.get(id)
        if (!actor) {
          actor = {
            x: 0,
            y: 0,
            facing: 2,
            phase: 1,
            phaseT: 0,
            creatureId: PLAYER_CREATURE_ID,
            size: playerSize,
            label: 'Trainer',
          }
          remotes.set(id, actor)
          ensureImage(PLAYER_CREATURE_ID)
        }
        const px = tileToPx(entity.position.x, entity.position.y, actor.size)
        actor.x = px.x
        actor.y = px.y
        actor.facing = facingFromServer(entity.direction)
      }
      for (const id of remotes.keys()) {
        if (!seen.has(id)) remotes.delete(id)
      }

      // Align local cosmetic NPCs with server npc-* tiles when present
      for (const [id, entity] of rt.entities) {
        if (!id.startsWith('npc-')) continue
        const label = entity.visual?.assetKey?.split('/').pop()
        const match = npcs.find(
          (n) =>
            n.label?.toLowerCase().includes(label ?? '') ||
            id.includes((n.label ?? '').toLowerCase().replace(/\s+/g, '')),
        )
        if (match) {
          const px = tileToPx(entity.position.x, entity.position.y, match.size)
          match.x = px.x
          match.y = px.y
          match.facing = facingFromServer(entity.direction)
        }
      }
    }

    const frame = (ts: number) => {
      if (cancelled) return
      raf = requestAnimationFrame(frame)

      if (!mapCtx || !actorCtx || !map || viewW <= 0 || viewH <= 0) return

      const dt = Math.min(0.05, (ts - lastTs) / 1000)
      lastTs = ts

      let vx = 0
      let vy = 0
      if (keys.has('w') || keys.has('arrowup')) vy -= 1
      if (keys.has('s') || keys.has('arrowdown')) vy += 1
      if (keys.has('a') || keys.has('arrowleft')) vx -= 1
      if (keys.has('d') || keys.has('arrowright')) vx += 1

      const moving = vx !== 0 || vy !== 0
      const online = realtimeRef.current.connected
      const inBattle =
        realtimeRef.current.battle?.battle?.status === 'active' ||
        realtimeRef.current.battle?.type === 'battle.started'

      if (online) {
        syncFromServer()
        if (moving && !inBattle && ts - lastServerStepAt >= serverStepMs) {
          lastServerStepAt = ts
          const dir =
            Math.abs(vx) >= Math.abs(vy)
              ? vx < 0
                ? 'LEFT'
                : 'RIGHT'
              : vy < 0
                ? 'UP'
                : 'DOWN'
          player.facing = facingFromServer(dir)
          void realtimeRef.current.move(dir)
        }
      } else if (moving) {
        const len = Math.hypot(vx, vy) || 1
        const nx = vx / len
        const ny = vy / len
        player.facing = facingFromVector(nx, ny)
        tryMove(nx * playerSpeed * dt, ny * playerSpeed * dt)
      }
      advanceWalkPhase(player, moving && !inBattle, dt)

      const peke = followerPekeRef.current
      const followDistance = player.size * 1.6
      const playerCx = player.x + player.size / 2
      const playerCy = player.y + player.size / 2
      const facingVec =
        player.facing === 0
          ? { x: 0, y: -1 }
          : player.facing === 1
            ? { x: 1, y: 0 }
            : player.facing === 3
              ? { x: -1, y: 0 }
              : { x: 0, y: 1 }

      if (peke && !peke.fainted && peke.creatureId != null) {
        follower.creatureId = peke.creatureId
        follower.size = player.size * 1.35
        ensureImage(follower.creatureId)

        const targetX =
          playerCx - facingVec.x * followDistance - follower.size / 2
        const targetY =
          playerCy - facingVec.y * followDistance - follower.size / 2

        if (!followerReady) {
          follower.x = targetX
          follower.y = targetY
          followerReady = true
        } else {
          const prevX = follower.x
          const prevY = follower.y
          const lerp = 1 - Math.exp(-10 * dt)
          follower.x += (targetX - follower.x) * lerp
          follower.y += (targetY - follower.y) * lerp
          const fdx = follower.x - prevX
          const fdy = follower.y - prevY
          const followerMoving = Math.hypot(fdx, fdy) > 0.15
          if (followerMoving) {
            follower.facing = facingFromVector(fdx, fdy)
          } else {
            follower.facing = player.facing
          }
          advanceWalkPhase(follower, followerMoving, dt)
        }
      } else {
        followerReady = false
      }

      // Idle bob for NPCs
      for (const npc of npcs) {
        advanceWalkPhase(npc, true, dt * 0.35, 3)
      }
      for (const remote of remotes.values()) {
        advanceWalkPhase(remote, true, dt * 0.5, 6)
      }

      const mapPxW = map.width * map.tileWidth
      const mapPxH = map.height * map.tileHeight
      const viewWorldW = viewW / scale
      const viewWorldH = viewH / scale

      let camX = player.x + player.size / 2 - viewWorldW / 2
      let camY = player.y + player.size / 2 - viewWorldH / 2
      camX = Math.max(0, Math.min(Math.max(0, mapPxW - viewWorldW), camX))
      camY = Math.max(0, Math.min(Math.max(0, mapPxH - viewWorldH), camY))

      mapCtx.clearRect(0, 0, viewW, viewH)
      mapCtx.fillStyle = clearColor
      mapCtx.fillRect(0, 0, viewW, viewH)

      mapCtx.save()
      mapCtx.scale(scale, scale)
      mapCtx.translate(-camX, -camY)
      mapCtx.imageSmoothingEnabled = false

      for (const layer of map.drawLayers) {
        for (let y = 0; y < layer.height; y++) {
          for (let x = 0; x < layer.width; x++) {
            const tile = layer.tiles[y * layer.width + x]
            if (!tile || tile.localId < 0) continue
            drawTile(
              mapCtx,
              map,
              tile,
              x * map.tileWidth,
              y * map.tileHeight,
              map.tileWidth,
            )
          }
        }
      }
      mapCtx.restore()

      actorCtx.clearRect(0, 0, viewW, viewH)
      actorCtx.save()
      actorCtx.scale(scale, scale)
      actorCtx.translate(-camX, -camY)
      actorCtx.imageSmoothingEnabled = false

      const drawList: Actor[] = [...npcs, ...remotes.values()]
      if (peke && !peke.fainted && peke.creatureId != null && followerReady) {
        drawList.push(follower)
      }
      drawList.push(player)
      drawList.sort((a, b) => a.y + a.size - (b.y + b.size))

      for (const actor of drawList) {
        drawActor(actorCtx, actor)
      }
      actorCtx.restore()

      for (const npc of npcs) {
        drawNpcLabel(actorCtx, npc, camX, camY)
      }
      for (const remote of remotes.values()) {
        drawNpcLabel(actorCtx, remote, camX, camY)
      }
    }

    void (async () => {
      try {
        const assets = await resolveWorldAssets()
        if (cancelled) return

        preferredScale = assets.preferredScale
        clearColor = assets.clearColor
        playerSize = Math.max(16, assets.playerSize * 1.6)
        player.size = playerSize
        playerSpeed = assets.useOt ? 96 : 72
        for (const npc of npcs) npc.size = playerSize * 1.45
        follower.size = playerSize * 1.35

        const loadedMap = await loadTmxMap(assets.mapUrl)
        if (cancelled) return

        for (const ts of loadedMap.tilesets) {
          if (!ts.image && assets.fallbackTilesetImage) {
            ts.image = await loadImage(assets.fallbackTilesetImage)
          }
        }

        map = loadedMap

        const spawn = findSpawnPoint(map)
        if (spawn) {
          player.x = spawn.x + (map.tileWidth - player.size) / 2
          player.y = spawn.y + (map.tileHeight - player.size) / 2
        } else {
          player.x = (map.tileWidth - player.size) / 2
          player.y = (map.tileHeight - player.size) / 2
        }

        if (rectHitsSolid(map, player.x, player.y, player.size, player.size)) {
          const fallback = findSpawnPoint(map)
          if (fallback) {
            player.x = fallback.x + 3
            player.y = fallback.y + 3
          }
        }

        // Place NPCs around the spawn on open tiles (offline fallback)
        const offsets = [
          { x: 3, y: 0 },
          { x: -3, y: 1 },
          { x: 2, y: 3 },
          { x: -2, y: -2 },
        ]
        const tw = map.tileWidth
        const th = map.tileHeight
        npcs.forEach((npc, i) => {
          const off = offsets[i] ?? { x: i + 1, y: i }
          let nx = player.x + off.x * tw
          let ny = player.y + off.y * th
          nx = Math.max(0, Math.min(map!.width * tw - npc.size, nx))
          ny = Math.max(0, Math.min(map!.height * th - npc.size, ny))
          if (rectHitsSolid(map!, nx, ny, npc.size, npc.size)) {
            nx = player.x + (i + 1) * 12
            ny = player.y + 24
          }
          npc.x = nx
          npc.y = ny
          npc.facing = 2
        })

        follower.x = player.x - player.size * 1.5
        follower.y = player.y
        followerReady = true

        applySize()
        setReady(true)
        lastTs = performance.now()
        raf = requestAnimationFrame(frame)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load world')
        }
      }
    })()

    const observer = new ResizeObserver(scheduleResize)
    observer.observe(root)
    window.visualViewport?.addEventListener('resize', scheduleResize)
    window.visualViewport?.addEventListener('scroll', scheduleResize)
    window.addEventListener('orientationchange', scheduleResize)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      observer.disconnect()
      window.visualViewport?.removeEventListener('resize', scheduleResize)
      window.visualViewport?.removeEventListener('scroll', scheduleResize)
      window.removeEventListener('orientationchange', scheduleResize)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  const battle = realtime.battle?.battle
  const battleActive = battle?.status === 'active'
  const firstMove = battle?.playerMoves?.[0]

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 size-full touch-none select-none overflow-hidden"
    >
      <canvas
        ref={mapCanvasRef}
        className="absolute inset-0 block size-full max-h-none max-w-none [image-rendering:pixelated]"
        aria-label="Mundo PokeTibia"
      />
      <canvas
        ref={actorCanvasRef}
        className="pointer-events-none absolute inset-0 z-2 block size-full max-h-none max-w-none [image-rendering:pixelated]"
        aria-hidden
      />
      {!ready && !error ? (
        <p className="absolute inset-0 z-3 m-0 grid place-items-center text-[0.85rem] font-bold tracking-[0.12em] text-hud-ink/45 uppercase">
          Carregando mundo…
        </p>
      ) : null}
      {error ? (
        <p className="absolute inset-0 z-3 m-0 grid place-items-center px-6 text-center text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {battleActive && battle ? (
        <div className="absolute bottom-14 left-1/2 z-4 w-[min(92%,22rem)] -translate-x-1/2 rounded bg-black/70 px-3 py-2 text-[0.75rem] text-white/90">
          <p className="m-0 mb-1 font-semibold">
            Wild {battle.wild?.name ?? 'Pokémon'} (HP {battle.wild?.hp}/
            {battle.wild?.maxHp})
          </p>
          <p className="m-0 mb-2 text-white/65">
            Your {battle.player?.name ?? 'Pokémon'} (HP {battle.player?.hp}/
            {battle.player?.maxHp})
            {firstMove?.missileAssetKey
              ? ` · fx ${firstMove.missileAssetKey}`
              : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded bg-emerald-700/90 px-2 py-1 text-[0.7rem]"
              onClick={() =>
                void realtime.battleAction({
                  action: 'move',
                  moveId: firstMove?.id ?? 'tackle',
                })
              }
            >
              Attack
            </button>
            <button
              type="button"
              className="rounded bg-sky-800/90 px-2 py-1 text-[0.7rem]"
              onClick={() =>
                void realtime.battleAction({ action: 'capture', ballBonus: 1 })
              }
            >
              Catch
            </button>
            <button
              type="button"
              className="rounded bg-stone-600/90 px-2 py-1 text-[0.7rem]"
              onClick={() => void realtime.battleAction({ action: 'flee' })}
            >
              Flee
            </button>
          </div>
        </div>
      ) : null}
      {ready ? (
        <p className="pointer-events-none absolute right-3 bottom-3 z-3 m-0 rounded bg-black/45 px-2 py-1 text-[0.7rem] tracking-wide text-white/70">
          WASD / setas para andar
          {characterId
            ? realtime.connected
              ? ` · lab online (${realtime.entities.size} entidades)`
              : ' · lab offline'
            : ' · selecione um personagem'}
        </p>
      ) : null}
      {realtime.error ? (
        <p className="pointer-events-none absolute top-3 left-3 z-3 m-0 max-w-[min(90%,24rem)] rounded bg-black/55 px-2 py-1 text-[0.65rem] text-amber-200/90">
          WS: {realtime.error}
        </p>
      ) : null}
    </div>
  )
}
