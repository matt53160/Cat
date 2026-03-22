/**
 * Compute the 4 base corners of an isometric box footprint in LOCAL coords.
 * Uses the standard iso rule: +gx moves (+tileW/2, +tileH/2), +gy moves (-tileW/2, +tileH/2).
 *
 * Returns corners in render order: back, right, front, left.
 * The "front" corner is the closest to the viewer.
 */
export function isoBoxCorners(
  gridW: number,
  gridH: number,
  tileW: number,
  tileH: number,
) {
  const hx = tileW / 2;
  const hy = tileH / 2;

  // 4 grid corners at (0,0), (gw,0), (gw,gh), (0,gh) in screen offsets
  const back = { x: 0, y: 0 };
  const right = { x: gridW * hx, y: gridW * hy };
  const front = { x: (gridW - gridH) * hx, y: (gridW + gridH) * hy };
  const left = { x: -gridH * hx, y: gridH * hy };

  return { back, right, front, left };
}

/**
 * Draw an isometric box (3 visible faces: left, right, top).
 * Returns SVG path strings for each face.
 * `height` is the pixel height of the box above the floor.
 */
export function isoBoxPaths(
  gridW: number,
  gridH: number,
  tileW: number,
  tileH: number,
  height: number,
) {
  const { back, right, front, left } = isoBoxCorners(gridW, gridH, tileW, tileH);

  // Left visible face: left -> front -> front-height -> left-height
  const leftFace = `M ${left.x} ${left.y} L ${front.x} ${front.y} L ${front.x} ${front.y - height} L ${left.x} ${left.y - height} Z`;

  // Right visible face: right -> front -> front-height -> right-height
  const rightFace = `M ${right.x} ${right.y} L ${front.x} ${front.y} L ${front.x} ${front.y - height} L ${right.x} ${right.y - height} Z`;

  // Top face: all 4 corners shifted up by height
  const topFace = `M ${back.x} ${back.y - height} L ${right.x} ${right.y - height} L ${front.x} ${front.y - height} L ${left.x} ${left.y - height} Z`;

  return { leftFace, rightFace, topFace, back, right, front, left };
}
