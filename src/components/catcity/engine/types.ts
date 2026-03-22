import React from 'react';

// ─── Grid ────────────────────────────────────────────
export interface GridPos {
  gx: number; // grid X
  gy: number; // grid Y
}

export interface ScreenPos {
  x: number;
  y: number;
}

// ─── Furniture ───────────────────────────────────────
export interface FurnitureDef {
  id: string;
  name: string;
  /** Footprint width in grid cells (along X axis) */
  gridW: number;
  /** Footprint depth in grid cells (along Y axis) */
  gridH: number;
  /** Visual height in pixels above the floor */
  visualHeight: number;
  /** Can a cat sit/sleep on this? */
  catSpot?: {
    offsetX: number; // pixel offset from furniture anchor
    offsetY: number;
    pose: 'sitting' | 'sleeping';
  };
  /** Is this walkable (cat can walk over it)? e.g. rug */
  walkable?: boolean;
  /** Render function — receives tileW, tileH for scaling */
  render: (tileW: number, tileH: number) => React.ReactNode;
}

export interface PlacedFurniture {
  id: string;         // unique instance id
  defId: string;      // references FurnitureDef.id
  pos: GridPos;       // position on grid
}

// ─── Map ─────────────────────────────────────────────
export interface WallConfig {
  backColor: string;
  sideColor: string;
  height: number; // wall height in pixels
}

export interface FloorConfig {
  color1: string;
  color2: string; // checkerboard second color
}

export interface MapDef {
  id: string;
  name: string;
  gridW: number;   // grid width (number of tiles along X)
  gridH: number;   // grid height (number of tiles along Y)
  wall: WallConfig;
  floor: FloorConfig;
  defaultFurniture: PlacedFurniture[];
}

// ─── Cat (in-game state) ─────────────────────────────
export interface CatState {
  id: string;
  name: string;
  furColor: string;
  eyeColor: string;
  pattern: 'solid' | 'tabby' | 'bicolor' | 'calico' | 'tuxedo';
  secondaryColor?: string;
  pos: GridPos;
  pose: 'standing' | 'sitting' | 'sleeping' | 'walking';
  direction: 'left' | 'right';
}
