import React from 'react';
import { Image as SvgImage } from 'react-native-svg';
import { FurnitureDef } from '../engine/types';
import { TILE_W, TILE_H } from '../engine/IsoGrid';

// ─── PNG asset imports ───────────────────────────────
const ASSETS: Record<string, any> = {
  bed: require('../../../assets/furniture/bed.png'),
  bookshelf: require('../../../assets/furniture/bookshelf.png'),
  chair_blue: require('../../../assets/furniture/chair_blue.png'),
  chaise_longue: require('../../../assets/furniture/chaise_longue.png'),
  coffee_table: require('../../../assets/furniture/coffee_table.png'),
  dresser: require('../../../assets/furniture/dresser.png'),
  fireplace: require('../../../assets/furniture/fireplace.png'),
  mirror: require('../../../assets/furniture/mirror.png'),
  nightstand: require('../../../assets/furniture/nightstand.png'),
  sofa_blue_L: require('../../../assets/furniture/sofa_blue_L.png'),
  sofa_red: require('../../../assets/furniture/sofa_red.png'),
  sofa_red_back: require('../../../assets/furniture/sofa_red_back.png'),
  tv_stand: require('../../../assets/furniture/tv_stand.png'),
  vanity: require('../../../assets/furniture/vanity.png'),
  wall_shelf: require('../../../assets/furniture/wall_shelf.png'),
  wardrobe: require('../../../assets/furniture/wardrobe.png'),
  armchair_red_set: require('../../../assets/furniture/armchair_red_set.png'),
};

/**
 * Compute the actual visual height (pixels above the floor) for a PNG furniture
 * sprite, using the real tile dimensions. This ensures the SVG viewBox is never
 * too small and avoids clipping.
 */
function computeVisualHeight(
  imgW: number, imgH: number,
  gridW: number, gridH: number,
  scale: number, offsetY: number,
): number {
  const footprintW = (gridW + gridH) * (TILE_W / 2);
  const displayW = footprintW * scale;
  const displayH = displayW * (imgH / imgW);
  const floorH = (gridW + gridH) * (TILE_H / 2);
  return Math.ceil(displayH - floorH - offsetY);
}

/**
 * Helper: creates a render function that draws a PNG sprite
 * positioned so that the bottom of the image sits at the isometric floor level.
 *
 * The image is scaled so its width matches the isometric footprint width.
 * @param assetKey  key in ASSETS
 * @param imgW      original image width (px)
 * @param imgH      original image height (px)
 * @param gridW     furniture footprint width (tiles)
 * @param gridH     furniture footprint depth (tiles)
 * @param scale     extra scale factor (default 1)
 * @param offsetX   manual x tweak (px in iso space)
 * @param offsetY   manual y tweak (px in iso space)
 */
function pngRender(
  assetKey: string,
  imgW: number,
  imgH: number,
  gridW: number,
  gridH: number,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
): FurnitureDef['render'] {
  return (tileW: number, tileH: number) => {
    // The isometric footprint width in pixels
    const footprintW = (gridW + gridH) * (tileW / 2);
    const displayW = footprintW * scale;
    const displayH = displayW * (imgH / imgW);

    // Position: center horizontally on footprint, bottom-aligned to floor
    const floorH = (gridW + gridH) * (tileH / 2);
    const x = -gridH * (tileW / 2) + (footprintW - displayW) / 2 + offsetX;
    const y = -displayH + floorH + offsetY;

    return React.createElement(SvgImage, {
      href: ASSETS[assetKey],
      x,
      y,
      width: displayW,
      height: displayH,
      preserveAspectRatio: 'xMidYMid meet',
    });
  };
}

/**
 * Furniture catalog — all furniture with PNG sprites.
 */
const FURNITURE_CATALOG: FurnitureDef[] = [
  {
    id: 'sofa_red',
    name: 'Canapé rouge',
    gridW: 2,
    gridH: 1,
    visualHeight: computeVisualHeight(391, 347, 2, 1, 1.15, 2),
    catSpot: { offsetX: 10, offsetY: -15, pose: 'sitting' },
    render: pngRender('sofa_red', 391, 347, 2, 1, 1.15, -5, 2),
  },
  {
    id: 'sofa_red_back',
    name: 'Canapé rouge L',
    gridW: 2,
    gridH: 1,
    visualHeight: computeVisualHeight(109, 189, 2, 1, 1.1, 0),
    catSpot: { offsetX: 10, offsetY: -13, pose: 'sitting' },
    render: pngRender('sofa_red_back', 109, 189, 2, 1, 1.1, 0, 0),
  },
  {
    id: 'sofa_blue_L',
    name: 'Canapé bleu',
    gridW: 3,
    gridH: 2,
    visualHeight: computeVisualHeight(346, 343, 3, 2, 1.0, 2),
    catSpot: { offsetX: 15, offsetY: -13, pose: 'sitting' },
    render: pngRender('sofa_blue_L', 346, 343, 3, 2, 1.0, 0, 2),
  },
  {
    id: 'chaise_longue',
    name: 'Méridienne',
    gridW: 2,
    gridH: 1,
    visualHeight: computeVisualHeight(371, 355, 2, 1, 1.1, 0),
    catSpot: { offsetX: 8, offsetY: -10, pose: 'sleeping' },
    render: pngRender('chaise_longue', 371, 355, 2, 1, 1.1, -2, 0),
  },
  {
    id: 'armchair_red_set',
    name: 'Coin lecture',
    gridW: 2,
    gridH: 2,
    visualHeight: computeVisualHeight(319, 490, 2, 2, 1.0, 0),
    catSpot: { offsetX: 5, offsetY: -15, pose: 'sitting' },
    render: pngRender('armchair_red_set', 319, 490, 2, 2, 1.0, 0, 0),
  },
  {
    id: 'chair_blue',
    name: 'Fauteuil bleu',
    gridW: 1,
    gridH: 1,
    visualHeight: computeVisualHeight(236, 220, 1, 1, 1.15, 0),
    catSpot: { offsetX: 5, offsetY: -10, pose: 'sitting' },
    render: pngRender('chair_blue', 236, 220, 1, 1, 1.15, 0, 0),
  },
  {
    id: 'bed',
    name: 'Lit',
    gridW: 3,
    gridH: 2,
    visualHeight: computeVisualHeight(500, 523, 3, 2, 1.05, -2),
    catSpot: { offsetX: 15, offsetY: -15, pose: 'sleeping' },
    render: pngRender('bed', 500, 523, 3, 2, 1.05, 0, -2),
  },
  {
    id: 'coffee_table',
    name: 'Table basse',
    gridW: 2,
    gridH: 1,
    visualHeight: computeVisualHeight(287, 239, 2, 1, 1.1, 2),
    render: pngRender('coffee_table', 287, 239, 2, 1, 1.1, 0, 2),
  },
  {
    id: 'bookshelf',
    name: 'Bibliothèque',
    gridW: 1,
    gridH: 1,
    visualHeight: computeVisualHeight(196, 509, 1, 1, 1.1, -5),
    render: pngRender('bookshelf', 196, 509, 1, 1, 1.1, 0, -5),
  },
  {
    id: 'nightstand',
    name: 'Chevet',
    gridW: 1,
    gridH: 1,
    visualHeight: computeVisualHeight(195, 319, 1, 1, 1.0, 0),
    render: pngRender('nightstand', 195, 319, 1, 1, 1.0, 0, 0),
  },
  {
    id: 'dresser',
    name: 'Commode',
    gridW: 2,
    gridH: 1,
    visualHeight: computeVisualHeight(241, 345, 2, 1, 1.0, 0),
    render: pngRender('dresser', 241, 345, 2, 1, 1.0, 0, 0),
  },
  {
    id: 'wardrobe',
    name: 'Armoire',
    gridW: 2,
    gridH: 1,
    visualHeight: computeVisualHeight(370, 358, 2, 1, 1.0, -8),
    render: pngRender('wardrobe', 370, 358, 2, 1, 1.0, 0, -8),
  },
  {
    id: 'fireplace',
    name: 'Cheminée',
    gridW: 2,
    gridH: 1,
    visualHeight: computeVisualHeight(340, 632, 2, 1, 1.0, -5),
    render: pngRender('fireplace', 340, 632, 2, 1, 1.0, 0, -5),
  },
  {
    id: 'tv_stand',
    name: 'Home cinéma',
    gridW: 2,
    gridH: 1,
    visualHeight: computeVisualHeight(240, 317, 2, 1, 1.05, -2),
    render: pngRender('tv_stand', 240, 317, 2, 1, 1.05, 0, -2),
  },
  {
    id: 'mirror',
    name: 'Miroir',
    gridW: 1,
    gridH: 1,
    visualHeight: computeVisualHeight(195, 319, 1, 1, 1.0, -5),
    render: pngRender('mirror', 195, 319, 1, 1, 1.0, 0, -5),
  },
  {
    id: 'vanity',
    name: 'Coiffeuse',
    gridW: 2,
    gridH: 1,
    visualHeight: computeVisualHeight(255, 368, 2, 1, 1.05, 0),
    render: pngRender('vanity', 255, 368, 2, 1, 1.05, 0, 0),
  },
  {
    id: 'wall_shelf',
    name: 'Étagère murale',
    gridW: 1,
    gridH: 1,
    visualHeight: computeVisualHeight(182, 332, 1, 1, 1.0, -8),
    render: pngRender('wall_shelf', 182, 332, 1, 1, 1.0, 0, -8),
  },
];

/** Lookup a furniture definition by id */
export function getFurnitureDef(defId: string): FurnitureDef | undefined {
  return FURNITURE_CATALOG.find(f => f.id === defId);
}

/** Get the full catalog (for a shop/editor UI) */
export function getAllFurniture(): FurnitureDef[] {
  return FURNITURE_CATALOG;
}

export { FURNITURE_CATALOG };
