import React from 'react';
import { darken, lighten } from './colorUtils';
import { CatSpriteProps, DerivedColors } from './types';
import SleepingCat from './poses/SleepingCat';
import SittingCat from './poses/SittingCat';
import LickingCat from './poses/LickingCat';
import StandingCat from './poses/StandingCat';

export default function CatSprite({
  appearance,
  size = 60,
  direction = 'right',
  pose = 'standing',
}: CatSpriteProps) {
  const { furColor, eyeColor, pattern, secondaryColor } = appearance;

  const w = size;
  const h = size * 1.3;
  const flipTransform = direction === 'left' ? 'translate(104, 0) scale(-1, 1)' : '';

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

  switch (pose) {
    case 'sleeping': return <SleepingCat {...props} />;
    case 'sitting':  return <SittingCat {...props} />;
    case 'licking':  return <LickingCat {...props} />;
    default:         return <StandingCat {...props} />;
  }
}
