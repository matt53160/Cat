import React, { useMemo } from 'react';
import { View } from 'react-native';
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
    case 'E': return colors.eyeColor;
    case 'R': return colors.eyeLight;
    default:  return null;
  }
}

/**
 * Merge adjacent horizontal pixels of the same role into single wider blocks.
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

  const pixelW = w / gridW;
  const pixelH = h / gridH;
  const shouldFlip = !!flipTransform;

  return (
    <View style={{
      width: w,
      height: h,
      ...(shouldFlip ? { transform: [{ scaleX: -1 }] } : {}),
    }}>
      {rects.map((p, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: p.x * pixelW,
            top: p.y * pixelH,
            width: p.w * pixelW + 0.5,
            height: pixelH + 0.5,
            backgroundColor: p.color,
          }}
        />
      ))}
    </View>
  );
}
