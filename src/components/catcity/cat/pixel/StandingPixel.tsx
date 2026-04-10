import React from 'react';
import { PoseProps } from '../types';
import PixelRenderer from './PixelRenderer';
import { STANDING_GRID, STANDING_GRID_W, STANDING_GRID_H } from './standingGrid';

export default function StandingPixel({ colors, w, h, flipTransform }: PoseProps) {
  return (
    <PixelRenderer
      grid={STANDING_GRID}
      gridW={STANDING_GRID_W}
      gridH={STANDING_GRID_H}
      colors={colors}
      w={w}
      h={h}
      flipTransform={flipTransform}
    />
  );
}
