import { useEffect, useRef } from 'react'

import {
  CREATURE_GEOMETRY,
  creatureUrl,
  type SheetGeometry,
} from './creature-map'
import { drawCreatureFrame } from './sheet'
import { EMPTY_SPRITE_URL } from './urls'

type CreaturePortraitProps = {
  creatureId: number | null | undefined
  className?: string
  /** Pixel size of the canvas (CSS can scale further). */
  size?: number
  alt?: string
}

/** Draws the south-facing idle frame of a creature sheet into a canvas. */
export function CreaturePortrait({
  creatureId,
  className,
  size = 64,
  alt = '',
}: CreaturePortraitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, size, size)

    if (creatureId == null) {
      const fallback = new Image()
      fallback.decoding = 'async'
      fallback.onload = () => {
        ctx.clearRect(0, 0, size, size)
        ctx.drawImage(fallback, 0, 0, size, size)
      }
      fallback.src = EMPTY_SPRITE_URL
      return
    }

    const geometry: SheetGeometry | undefined = CREATURE_GEOMETRY[creatureId]
    const img = new Image()
    img.decoding = 'async'
    let cancelled = false

    img.onload = () => {
      if (cancelled || !ctx) return
      ctx.clearRect(0, 0, size, size)
      if (geometry) {
        drawCreatureFrame(ctx, img, geometry, 2, Math.floor(geometry.phases / 2), 0, 0, size, size)
      } else {
        ctx.drawImage(img, 0, 0, size, size)
      }
    }
    img.src = creatureUrl(creatureId)

    return () => {
      cancelled = true
    }
  }, [creatureId, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={alt}
    />
  )
}
