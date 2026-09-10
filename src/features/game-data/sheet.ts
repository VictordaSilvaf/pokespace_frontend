import type { SheetGeometry } from './creature-map'

export type FacingDir = 0 | 1 | 2 | 3 // N E S W

/** Map movement vector to OT direction row (0=N, 1=E, 2=S, 3=W). */
export function facingFromVector(vx: number, vy: number): FacingDir {
  if (Math.abs(vx) > Math.abs(vy)) {
    return vx > 0 ? 1 : 3
  }
  if (vy < 0) return 0
  return 2
}

export type FrameRect = {
  sx: number
  sy: number
  sw: number
  sh: number
}

/**
 * Frame rect for a directional walk sheet.
 * Layout: columns = phases, rows = px directions (when py=pz=layers=1).
 */
export function frameRect(
  image: HTMLImageElement,
  geometry: SheetGeometry,
  dir: FacingDir,
  phase: number,
): FrameRect {
  const phases = Math.max(1, geometry.phases)
  const dirs = Math.max(1, geometry.px)
  const layerCols = Math.max(1, geometry.layers)

  const cellW = image.naturalWidth / (phases * geometry.w * layerCols)
  const cellH = image.naturalHeight / (dirs * geometry.h * Math.max(1, geometry.py))

  const fw = cellW * geometry.w
  const fh = cellH * geometry.h

  const phaseIndex = ((phase % phases) + phases) % phases
  const dirIndex = Math.min(dir, dirs - 1)

  // Draw base layer only (layer 0) when multiple layers exist.
  return {
    sx: phaseIndex * fw,
    sy: dirIndex * fh,
    sw: fw,
    sh: fh,
  }
}

export function drawCreatureFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  geometry: SheetGeometry,
  dir: FacingDir,
  phase: number,
  dx: number,
  dy: number,
  drawW: number,
  drawH: number,
) {
  if (!image.complete || image.naturalWidth === 0) return

  // Single-tile extracts (32×32) or 1-frame geometry: draw the full image.
  const isSingleTile =
    (geometry.phases <= 1 && geometry.px <= 1) ||
    (image.naturalWidth <= 64 && image.naturalHeight <= 64)

  if (isSingleTile) {
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, dx, dy, drawW, drawH)
    return
  }

  const rect = frameRect(image, geometry, dir, phase)
  ctx.drawImage(
    image,
    rect.sx,
    rect.sy,
    rect.sw,
    rect.sh,
    dx,
    dy,
    drawW,
    drawH,
  )
}
