import { MapDef } from '../engine/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const roomImage = require('../../../assets/room_salon.png');

/**
 * Salon — the default cozy living room.
 * Grid is 8x8 tiles. Pixel-art background from appart-v3.
 */
export const salonMap: MapDef = {
  id: 'salon',
  name: 'Le Salon',
  gridW: 16,
  gridH: 16,
  wall: {
    backColor: '#E8DDD0',
    sideColor: '#DDD0C0',
    height: 45,
  },
  floor: {
    color1: '#DEB887',
    color2: '#D2A870',
  },
  backgroundImage: {
    source: roomImage,
    width: 7168,
    height: 7168,
    offsetY: -85,
  },
  defaultFurniture: [],
};
