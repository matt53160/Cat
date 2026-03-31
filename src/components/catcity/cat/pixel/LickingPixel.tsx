import React from 'react';
import { PoseProps } from '../types';
import PixelRenderer from './PixelRenderer';
import { LICKING_GRID, LICKING_GRID_W, LICKING_GRID_H } from './lickingGrid';

export default function LickingPixel({ colors, w, h, flipTransform }: PoseProps) {
  return (
    <PixelRenderer
      grid={LICKING_GRID}
      gridW={LICKING_GRID_W}
      gridH={LICKING_GRID_H}
      colors={colors}
      w={w}
      h={h}
      flipTransform={flipTransform}
    />
  );
}
