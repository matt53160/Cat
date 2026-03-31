import React, { useMemo } from 'react';
import Svg, { Rect, G } from 'react-native-svg';
import { DerivedColors } from '../types';

interface PixelRendererProps {
  grid: string[];
  gridW: number;
  gridH: number;
  colors: DerivedColors;
  w: number;
  h: number;
  flipTransform: string;
}

function roleToColor(role: string, colors: DerivedColors): string | null {
  switch (role) {
    case 'O': return colors.ol;
    case 'F': return colors.furColor;
    case 'S': return colors.darker;
    case 'L': return colors.lighter;
    case 'B': return colors.belly;
    default:  return null;
  }
}

/**
 * Merge adjacent horizontal pixels of the same role into single wider Rects.
 * This reduces ~3900 Rects down to ~600-800.
 */
function buildMergedRects(
  grid: string[],
  colors: DerivedColors,
): { x: number; y: number; w: number; color: string }[] {
  const result: { x: number; y: number; w: number; color: string }[] = [];

  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === '.') { x++; continue; }

      const color = roleToColor(ch, colors);
      if (!color) { x++; continue; }

      // Run-length: count consecutive same-role pixels
      let runLen = 1;
      while (x + runLen < row.length && row[x + runLen] === ch) {
        runLen++;
      }

      result.push({ x, y, w: runLen, color });
      x += runLen;
    }
  }

  return result;
}

export default function PixelRenderer({
  grid,
  gridW,
  gridH,
  colors,
  w,
  h,
  flipTransform,
}: PixelRendererProps) {
  const rects = useMemo(
    () => buildMergedRects(grid, colors),
    [grid, colors],
  );

  const flip = flipTransform
    ? `translate(${gridW}, 0) scale(-1, 1)`
    : undefined;

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${gridW} ${gridH}`}>
      <G transform={flip}>
        {rects.map((p, i) => (
          <Rect
            key={i}
            x={p.x}
            y={p.y}
            width={p.w}
            height={1}
            fill={p.color}
          />
        ))}
      </G>
    </Svg>
  );
}
