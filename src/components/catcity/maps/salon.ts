import { MapDef } from '../engine/types';

/**
 * Salon — the default cozy living room.
 * Grid is 8x8 tiles. Furniture placed around walls.
 */
export const salonMap: MapDef = {
  id: 'salon',
  name: 'Le Salon',
  gridW: 8,
  gridH: 8,
  wall: {
    backColor: '#E8DDD0',
    sideColor: '#DDD0C0',
    height: 90,
  },
  floor: {
    color1: '#DEB887',
    color2: '#D2A870',
  },
  defaultFurniture: [
    { id: 'sofa_red-1', defId: 'sofa_red', pos: { gx: 0, gy: 1 } },
    { id: 'bookshelf-1', defId: 'bookshelf', pos: { gx: 0, gy: 4 } },
    { id: 'coffee_table-1', defId: 'coffee_table', pos: { gx: 3, gy: 3 } },
    { id: 'chair_blue-1', defId: 'chair_blue', pos: { gx: 5, gy: 1 } },
    { id: 'nightstand-1', defId: 'nightstand', pos: { gx: 7, gy: 0 } },
    { id: 'wall_shelf-1', defId: 'wall_shelf', pos: { gx: 6, gy: 6 } },
  ],
};
