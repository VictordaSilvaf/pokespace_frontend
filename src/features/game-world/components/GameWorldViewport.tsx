import { useEffect, useRef, useState } from 'react'

import type { Peke } from '#/features/game-hud/types'

import { resolveWorldAssets } from '../assets'
import {
  drawTile,
  findSpawnPoint,
  loadImage,
  loadTmxMap,
  rectHitsSolid,
  type TileMap,
} from '../tmx'

type Player = {
  x: number
  y: number
}

type Follower = {
  x: number
  y: number
}

type GameWorldViewportProps = {
  followerPeke?: Peke | null
}

/** Scale so the map always covers the viewport (no letterboxing). */
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

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  facing: { x: number; y: number },
) {
  const cx = x + size / 2
  const cy = y + size / 2
  const eyeOffset = Math.max(2, size * 0.3)

  ctx.fillStyle = '#f2d27a'
  ctx.strokeStyle = '#2a2114'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(x, y, size, size, Math.max(2, size * 0.2))
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#2a2114'
  ctx.beginPath()
  ctx.arc(
    cx + facing.x * eyeOffset,
    cy + facing.y * eyeOffset,
    Math.max(1.5, size * 0.15),
    0,
    Math.PI * 2,
  )
  ctx.fill()
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

export function GameWorldViewport({
  followerPeke = null,
}: GameWorldViewportProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const mapCanvasRef = useRef<HTMLCanvasElement>(null)
  const playerCanvasRef = useRef<HTMLCanvasElement>(null)
  const followerImgRef = useRef<HTMLImageElement>(null)
  const followerPekeRef = useRef<Peke | null>(followerPeke)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    followerPekeRef.current = followerPeke
  }, [followerPeke])

  useEffect(() => {
    const root = rootRef.current
    const mapCanvas = mapCanvasRef.current
    const playerCanvas = playerCanvasRef.current
    const followerImg = followerImgRef.current
    if (!root || !mapCanvas || !playerCanvas || !followerImg) return

    let cancelled = false
    let raf = 0
    const keys = new Set<string>()

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
    let player: Player = { x: 0, y: 0 }
    let follower: Follower = { x: 0, y: 0 }
    let followerReady = false
    let facing = { x: 0, y: 1 }
    let preferredScale = 3
    let playerSize = 10
    let playerSpeed = 72
    let scale = preferredScale
    let viewW = 0
    let viewH = 0
    let lastTs = performance.now()
    let resizeRaf = 0
    let mapCtx: CanvasRenderingContext2D | null = mapCanvas.getContext('2d')
    let playerCtx: CanvasRenderingContext2D | null =
      playerCanvas.getContext('2d')
    let lastWalkSrc = ''

    const syncFollowerOverlay = (
      peke: Peke | null,
      camX: number,
      camY: number,
      followerSize: number,
    ) => {
      if (!peke || peke.fainted) {
        followerImg.hidden = true
        followerImg.removeAttribute('src')
        lastWalkSrc = ''
        return
      }

      if (lastWalkSrc !== peke.walkSpriteUrl) {
        lastWalkSrc = peke.walkSpriteUrl
        followerImg.src = peke.walkSpriteUrl
      }

      const screenX = (follower.x - camX) * scale
      const screenY = (follower.y - camY) * scale
      const screenSize = followerSize * scale
      const flipX = facing.x < 0

      followerImg.hidden = false
      followerImg.style.width = `${screenSize}px`
      followerImg.style.height = `${screenSize}px`
      followerImg.style.transform = `translate(${screenX}px, ${screenY}px) scaleX(${flipX ? -1 : 1})`
      followerImg.style.transformOrigin = 'center center'
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
      playerCtx = resizeCanvas(playerCanvas, viewW, viewH, dpr)

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
      const maxX = map.width * map.tileWidth - playerSize
      const maxY = map.height * map.tileHeight - playerSize

      const clampedX = Math.max(0, Math.min(maxX, nextX))
      const clampedY = Math.max(0, Math.min(maxY, nextY))

      if (!rectHitsSolid(map, clampedX, player.y, playerSize, playerSize)) {
        player.x = clampedX
      }
      if (!rectHitsSolid(map, player.x, clampedY, playerSize, playerSize)) {
        player.y = clampedY
      }
    }

    const frame = (ts: number) => {
      if (cancelled) return
      raf = requestAnimationFrame(frame)

      if (!mapCtx || !playerCtx || !map || viewW <= 0 || viewH <= 0) return

      const dt = Math.min(0.05, (ts - lastTs) / 1000)
      lastTs = ts

      let vx = 0
      let vy = 0
      if (keys.has('w') || keys.has('arrowup')) vy -= 1
      if (keys.has('s') || keys.has('arrowdown')) vy += 1
      if (keys.has('a') || keys.has('arrowleft')) vx -= 1
      if (keys.has('d') || keys.has('arrowright')) vx += 1

      const moving = vx !== 0 || vy !== 0
      if (moving) {
        const len = Math.hypot(vx, vy) || 1
        facing = { x: vx / len, y: vy / len }
        tryMove((vx / len) * playerSpeed * dt, (vy / len) * playerSpeed * dt)
      }

      const peke = followerPekeRef.current
      const followerSize = playerSize * 1.6
      const followDistance = playerSize * 1.5
      const playerCx = player.x + playerSize / 2
      const playerCy = player.y + playerSize / 2
      const targetX = playerCx - facing.x * followDistance - followerSize / 2
      const targetY = playerCy - facing.y * followDistance - followerSize / 2

      if (!followerReady) {
        follower.x = targetX
        follower.y = targetY
        followerReady = true
      } else {
        const lerp = 1 - Math.exp(-10 * dt)
        follower.x += (targetX - follower.x) * lerp
        follower.y += (targetY - follower.y) * lerp
      }

      const mapPxW = map.width * map.tileWidth
      const mapPxH = map.height * map.tileHeight
      const viewWorldW = viewW / scale
      const viewWorldH = viewH / scale

      let camX = player.x + playerSize / 2 - viewWorldW / 2
      let camY = player.y + playerSize / 2 - viewWorldH / 2
      camX = Math.max(0, Math.min(Math.max(0, mapPxW - viewWorldW), camX))
      camY = Math.max(0, Math.min(Math.max(0, mapPxH - viewWorldH), camY))

      mapCtx.clearRect(0, 0, viewW, viewH)
      mapCtx.fillStyle = '#0b1210'
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

      // GIF between map and player so it walks “behind” the avatar.
      syncFollowerOverlay(peke, camX, camY, followerSize)

      playerCtx.clearRect(0, 0, viewW, viewH)
      playerCtx.save()
      playerCtx.scale(scale, scale)
      playerCtx.translate(-camX, -camY)
      playerCtx.imageSmoothingEnabled = false
      drawPlayer(playerCtx, player.x, player.y, playerSize, facing)
      playerCtx.restore()
    }

    void (async () => {
      try {
        const assets = await resolveWorldAssets()
        if (cancelled) return

        preferredScale = assets.preferredScale
        playerSize = assets.playerSize
        playerSpeed = assets.useOt ? 96 : 72

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
          player = {
            x: spawn.x + (map.tileWidth - playerSize) / 2,
            y: spawn.y + (map.tileHeight - playerSize) / 2,
          }
        } else {
          player = {
            x: (map.tileWidth - playerSize) / 2,
            y: (map.tileHeight - playerSize) / 2,
          }
        }

        if (rectHitsSolid(map, player.x, player.y, playerSize, playerSize)) {
          const fallback = findSpawnPoint(map)
          if (fallback) {
            player = {
              x: fallback.x + 3,
              y: fallback.y + 3,
            }
          }
        }

        follower = {
          x: player.x - playerSize * 1.5,
          y: player.y,
        }
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

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 size-full touch-none select-none overflow-hidden"
    >
      <canvas
        ref={mapCanvasRef}
        className="absolute inset-0 block size-full max-h-none max-w-none [image-rendering:pixelated]"
        aria-label="Mundo inicial de testes"
      />
      <img
        ref={followerImgRef}
        alt=""
        draggable={false}
        hidden
        className="pointer-events-none absolute top-0 left-0 z-1 max-w-none [image-rendering:pixelated] will-change-transform"
      />
      <canvas
        ref={playerCanvasRef}
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
      {ready ? (
        <p className="pointer-events-none absolute right-3 bottom-3 z-3 m-0 rounded bg-black/45 px-2 py-1 text-[0.7rem] tracking-wide text-white/70">
          WASD / setas para andar
        </p>
      ) : null}
    </div>
  )
}
