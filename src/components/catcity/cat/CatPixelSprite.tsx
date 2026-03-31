import React from 'react';
import { darken, lighten } from './colorUtils';
import { CatSpriteProps, DerivedColors } from './types';
import { StandingPixel } from './pixel';

export default function CatPixelSprite({
  appearance,
  size = 60,
  direction = 'right',
  pose = 'standing',
}: CatSpriteProps) {
  const { furColor, eyeColor, pattern, secondaryColor } = appearance;

  const w = size;
  const h = size * 1.3;
  const flipTransform = direction === 'left' ? 'flip' : '';

  const colors: DerivedColors = {
    furColor,
    eyeColor,
    pattern,
    secondaryColor,
    earInner: '#FFA0B4',
    noseColor: '#FF8888',
    darker: darken(furColor, 35),
    ol: darken(furColor, 120),
    lighter: lighten(furColor, 40),
    belly: secondaryColor || lighten(furColor, 40),
    blush: '#FF90A0',
  };

  const props = { colors, w, h, flipTransform, direction };

  // For now only standing is available in pixel art
  // Other poses fall back to standing pixel
  switch (pose) {
    // case 'sleeping': return <SleepingPixel {...props} />;
    // case 'sitting':  return <SittingPixel {...props} />;
    // case 'licking':  return <LickingPixel {...props} />;
    default:         return <StandingPixel {...props} />;
  }
}
