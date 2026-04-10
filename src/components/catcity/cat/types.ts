export interface CatAppearance {
  id: string;
  name: string;
  furColor: string;
  eyeColor: string;
  pattern?: 'solid' | 'tabby' | 'bicolor' | 'calico' | 'tuxedo';
  secondaryColor?: string;
}

export interface CatSpriteProps {
  appearance: CatAppearance;
  size?: number;
  direction?: 'left' | 'right';
  pose?: 'standing' | 'sitting' | 'sleeping' | 'licking';
}

export interface DerivedColors {
  furColor: string;
  eyeColor: string;
  pattern?: string;
  secondaryColor?: string;
  earInner: string;
  noseColor: string;
  darker: string;
  ol: string;
  lighter: string;
  belly: string;
  blush: string;
  eyeLight: string;
}

export interface PoseProps {
  colors: DerivedColors;
  w: number;
  h: number;
  flipTransform: string;
  direction: 'left' | 'right';
}
