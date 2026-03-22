import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { MapDef, PlacedFurniture, CatState } from './engine/types';
import { gridToScreen, zOrder, TILE_W, TILE_H, gridPixelSize } from './engine/IsoGrid';
import { getFurnitureDef } from './furniture';
import CatSprite from './CatSprite';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface IsoRoomProps {
  map: MapDef;
  furniture: PlacedFurniture[];
  cats: CatState[];
  selectedFurnitureId?: string | null;
  onFurnitureTap?: (id: string) => void;
}

function floorCorners(gridW: number, gridH: number, originX: number, originY: number) {
  const c00 = gridToScreen(0, 0, originX, originY);
  const A = { x: c00.x, y: c00.y - TILE_H / 2 };
  const cW0 = gridToScreen(gridW - 1, 0, originX, originY);
  const B = { x: cW0.x + TILE_W / 2, y: cW0.y };
  const cWH = gridToScreen(gridW - 1, gridH - 1, originX, originY);
  const C = { x: cWH.x, y: cWH.y + TILE_H / 2 };
  const c0H = gridToScreen(0, gridH - 1, originX, originY);
  const D = { x: c0H.x - TILE_W / 2, y: c0H.y };
  return { A, B, C, D };
}

function IsoTile({ gx, gy, originX, originY, color }: {
  gx: number; gy: number; originX: number; originY: number; color: string;
}) {
  const { x, y } = gridToScreen(gx, gy, originX, originY);
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;
  return (
    <Path
      d={`M ${x} ${y - hh} L ${x + hw} ${y} L ${x} ${y + hh} L ${x - hw} ${y} Z`}
      fill={color} stroke="#C9A86C" strokeWidth={0.5} opacity={0.9}
    />
  );
}

function IsoWalls({ map, originX, originY }: { map: MapDef; originX: number; originY: number }) {
  const { wall, gridW, gridH } = map;
  const wallH = wall.height;
  const { A, B, D } = floorCorners(gridW, gridH, originX, originY);

  return (
    <G>
      <Path d={`M ${A.x} ${A.y} L ${B.x} ${B.y} L ${B.x} ${B.y - wallH} L ${A.x} ${A.y - wallH} Z`} fill={wall.backColor} />
      <Path d={`M ${D.x} ${D.y} L ${A.x} ${A.y} L ${A.x} ${A.y - wallH} L ${D.x} ${D.y - wallH} Z`} fill={wall.sideColor} />
      <Path d={`M ${A.x} ${A.y} L ${B.x} ${B.y} L ${B.x} ${B.y - 4} L ${A.x} ${A.y - 4} Z`} fill="#C9B99A" />
      <Path d={`M ${D.x} ${D.y} L ${A.x} ${A.y} L ${A.x} ${A.y - 4} L ${D.x} ${D.y - 4} Z`} fill="#BBA888" />
      <Path d={`M ${A.x} ${A.y} L ${A.x} ${A.y - wallH}`} stroke="#C4AD96" strokeWidth={2} />
    </G>
  );
}

/** Glow halo around selected furniture footprint tiles */
function SelectionHighlight({ placed, originX, originY }: {
  placed: PlacedFurniture; originX: number; originY: number;
}) {
  const def = getFurnitureDef(placed.defId);
  if (!def) return null;

  const halos: React.ReactNode[] = [];
  for (let dx = 0; dx < def.gridW; dx++) {
    for (let dy = 0; dy < def.gridH; dy++) {
      const { x, y } = gridToScreen(placed.pos.gx + dx, placed.pos.gy + dy, originX, originY);
      const hw = TILE_W / 2;
      const hh = TILE_H / 2;
      // Outer glow (larger, more transparent)
      const pad = 6;
      halos.push(
        <Path
          key={`glow-outer-${dx}-${dy}`}
          d={`M ${x} ${y - hh - pad} L ${x + hw + pad} ${y} L ${x} ${y + hh + pad} L ${x - hw - pad} ${y} Z`}
          fill="#7CB8D9" opacity={0.15}
        />
      );
      // Inner glow (tile-sized, subtle)
      halos.push(
        <Path
          key={`glow-inner-${dx}-${dy}`}
          d={`M ${x} ${y - hh - 2} L ${x + hw + 2} ${y} L ${x} ${y + hh + 2} L ${x - hw - 2} ${y} Z`}
          fill="#7CB8D9" opacity={0.25}
        />
      );
    }
  }
  return <G>{halos}</G>;
}

export default function IsoRoom({ map, furniture, cats, selectedFurnitureId, onFurnitureTap }: IsoRoomProps) {
  const pixelSize = gridPixelSize(map.gridW, map.gridH);
  const svgW = Math.max(SCREEN_WIDTH, pixelSize.width + 40);
  const svgH = pixelSize.height + map.wall.height + 120;
  const originX = svgW / 2;
  const originY = map.wall.height + 20;

  const floorTiles = useMemo(() => {
    const tiles: React.ReactNode[] = [];
    for (let gy = 0; gy < map.gridH; gy++) {
      for (let gx = 0; gx < map.gridW; gx++) {
        const isAlt = (gx + gy) % 2 === 0;
        tiles.push(
          <IsoTile key={`tile-${gx}-${gy}`}
            gx={gx} gy={gy} originX={originX} originY={originY}
            color={isAlt ? map.floor.color1 : map.floor.color2}
          />,
        );
      }
    }
    return tiles;
  }, [map, originX, originY]);

  const sortedFurniture = useMemo(() => {
    const items = furniture
      .filter(placed => placed.id !== selectedFurnitureId) // skip selected (rendered as draggable overlay)
      .map(placed => {
      const def = getFurnitureDef(placed.defId);
      if (!def) return null;

      // Position at the back corner (0,0) of the furniture footprint
      const backScreen = gridToScreen(placed.pos.gx, placed.pos.gy, originX, originY);

      return {
        key: `f-${placed.id}`,
        id: placed.id,
        walkable: !!def.walkable,
        z: zOrder(placed.pos.gx + def.gridW - 1, placed.pos.gy + def.gridH - 1),
        node: (
          <G key={`f-${placed.id}`}
            transform={`translate(${backScreen.x}, ${backScreen.y})`}
            onPress={onFurnitureTap ? () => onFurnitureTap(placed.id) : undefined}
          >
            {def.render(TILE_W, TILE_H)}
          </G>
        ),
      };
    }).filter(Boolean) as Array<{ key: string; id: string; walkable: boolean; z: number; node: React.ReactNode }>;

    // Walkable items always render below non-walkable items
    items.sort((a, b) => {
      if (a.walkable !== b.walkable) return a.walkable ? -1 : 1;
      return a.z - b.z;
    });
    return items;
  }, [furniture, originX, originY, onFurnitureTap, selectedFurnitureId]);

  const selectedPlaced = selectedFurnitureId
    ? furniture.find(f => f.id === selectedFurnitureId)
    : null;

  return (
    <View style={{ width: svgW, height: svgH }}>
      <Svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
        <IsoWalls map={map} originX={originX} originY={originY} />
        {floorTiles}
        {/* Selection highlight under furniture */}
        {selectedPlaced && (
          <SelectionHighlight placed={selectedPlaced} originX={originX} originY={originY} />
        )}
        {sortedFurniture.map(item => item.node)}
      </Svg>

      {cats.map(cat => {
        const screen = gridToScreen(cat.pos.gx, cat.pos.gy, originX, originY);
        return (
          <View key={`cat-${cat.id}`}
            style={{
              position: 'absolute',
              left: screen.x - 28, top: screen.y - 55,
              zIndex: Math.round(zOrder(cat.pos.gx, cat.pos.gy) * 10),
            }}
          >
            <CatSprite appearance={cat} size={55} direction={cat.direction}
              pose={cat.pose === 'walking' ? 'standing' : cat.pose}
            />
          </View>
        );
      })}
    </View>
  );
}

export { TILE_W, TILE_H };
