import { GridPos, ScreenPos } from './types';

// Standard isometric tile dimensions
export const TILE_W = 64;
export const TILE_H = 32;

/**
 * Convert grid coordinates to screen (pixel) coordinates.
 * Origin is at the top-center of the iso grid.
 */
export function gridToScreen(
  gx: number,
  gy: number,
  originX: number,
  originY: number,
): ScreenPos {
  return {
    x: originX + (gx - gy) * (TILE_W / 2),
    y: originY + (gx + gy) * (TILE_H / 2),
  };
}

/**
 * Convert screen coordinates back to floating-point grid coordinates.
 */
export function screenToGrid(
  sx: number,
  sy: number,
  originX: number,
  originY: number,
): GridPos {
  const rx = sx - originX;
  const ry = sy - originY;
  return {
    gx: Math.round((rx / (TILE_W / 2) + ry / (TILE_H / 2)) / 2),
    gy: Math.round((ry / (TILE_H / 2) - rx / (TILE_W / 2)) / 2),
  };
}

/**
 * Snap a screen position to the nearest valid grid cell within bounds.
 */
export function snapToGrid(
  sx: number,
  sy: number,
  originX: number,
  originY: number,
  gridW: number,
  gridH: number,
): GridPos {
  const raw = screenToGrid(sx, sy, originX, originY);
  return {
    gx: Math.max(0, Math.min(gridW - 1, raw.gx)),
    gy: Math.max(0, Math.min(gridH - 1, raw.gy)),
  };
}

/**
 * Z-order for sorting: higher value = rendered later = appears in front.
 */
export function zOrder(gx: number, gy: number): number {
  return gx + gy;
}

/**
 * Calculate the pixel bounds needed to display the full iso grid.
 */
export function gridPixelSize(gridW: number, gridH: number) {
  return {
    width: (gridW + gridH) * (TILE_W / 2),
    height: (gridW + gridH) * (TILE_H / 2),
  };
}

/**
 * Check if placing a furniture of size (w x h) at (gx, gy) would overlap
 * any existing non-walkable furniture (excluding one by id).
 */
export function canPlaceFurniture(
  gx: number,
  gy: number,
  w: number,
  h: number,
  gridW: number,
  gridH: number,
  existing: Array<{ id: string; pos: GridPos; gridW: number; gridH: number; walkable?: boolean }>,
  excludeId?: string,
): boolean {
  // Check grid bounds
  if (gx < 0 || gy < 0 || gx + w > gridW || gy + h > gridH) return false;

  // Check overlap with non-walkable furniture
  return !existing.some(f => {
    if (f.id === excludeId) return false;
    if (f.walkable) return false;
    const overlapX = gx < f.pos.gx + f.gridW && gx + w > f.pos.gx;
    const overlapY = gy < f.pos.gy + f.gridH && gy + h > f.pos.gy;
    return overlapX && overlapY;
  });
}
