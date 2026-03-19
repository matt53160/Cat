import React from 'react';
import Svg, { Rect, Ellipse, Path, Circle, G, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ROOM_HEIGHT = 500;

// Furniture spot positions (x, y) for cats to sit on
export const FURNITURE_SPOTS = [
  { id: 'couch-left', x: 40, y: 290, pose: 'sitting' as const },
  { id: 'couch-right', x: 140, y: 290, pose: 'sitting' as const },
  { id: 'rug-center', x: SCREEN_WIDTH / 2 - 30, y: 400, pose: 'sleeping' as const },
  { id: 'rug-left', x: SCREEN_WIDTH / 2 - 80, y: 390, pose: 'sleeping' as const },
  { id: 'shelf', x: SCREEN_WIDTH - 100, y: 200, pose: 'sitting' as const },
  { id: 'chair', x: SCREEN_WIDTH - 110, y: 310, pose: 'sitting' as const },
  { id: 'floor-left', x: 30, y: 420, pose: 'standing' as const },
  { id: 'floor-right', x: SCREEN_WIDTH - 80, y: 430, pose: 'standing' as const },
  { id: 'windowsill', x: SCREEN_WIDTH / 2 - 20, y: 175, pose: 'sitting' as const },
];

export default function Room() {
  const W = SCREEN_WIDTH;
  const H = ROOM_HEIGHT;

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <LinearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#E8DDD0" />
          <Stop offset="1" stopColor="#F5EDE0" />
        </LinearGradient>
        <LinearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#DEB887" />
          <Stop offset="1" stopColor="#D2A870" />
        </LinearGradient>
      </Defs>

      {/* Wall */}
      <Rect x={0} y={0} width={W} height={H * 0.7} fill="url(#wallGrad)" />

      {/* Baseboard */}
      <Rect x={0} y={H * 0.68} width={W} height={12} fill="#C9B99A" />

      {/* Floor */}
      <Rect x={0} y={H * 0.7} width={W} height={H * 0.3} fill="url(#floorGrad)" />

      {/* Floor planks */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <Line
          key={`plank-${i}`}
          x1={0}
          y1={H * 0.7 + i * (H * 0.3 / 8)}
          x2={W}
          y2={H * 0.7 + i * (H * 0.3 / 8)}
          stroke="#C9A86C"
          strokeWidth={0.5}
          opacity={0.3}
        />
      ))}

      {/* === WINDOW === */}
      <G>
        {/* Window frame outer */}
        <Rect x={W / 2 - 60} y={60} width={120} height={130} rx={4} fill="#C9B99A" />
        {/* Window glass */}
        <Rect x={W / 2 - 54} y={66} width={108} height={118} rx={2} fill="#D4EEFF" />
        {/* Sky gradient in window */}
        <Rect x={W / 2 - 54} y={66} width={108} height={60} fill="#B8DCEF" opacity={0.5} />
        {/* Window cross */}
        <Line x1={W / 2} y1={66} x2={W / 2} y2={184} stroke="#C9B99A" strokeWidth={4} />
        <Line x1={W / 2 - 54} y1={125} x2={W / 2 + 54} y2={125} stroke="#C9B99A" strokeWidth={4} />
        {/* Windowsill */}
        <Rect x={W / 2 - 68} y={186} width={136} height={10} rx={2} fill="#B8A080" />
        {/* Little plant on windowsill */}
        <Ellipse cx={W / 2 + 35} cy={183} rx={8} ry={5} fill="#A0785A" />
        <Path d={`M ${W / 2 + 35} 183 Q ${W / 2 + 30} 168 ${W / 2 + 25} 165`} stroke="#7BC67E" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Circle cx={W / 2 + 25} cy={163} r={5} fill="#8FD694" />
        <Path d={`M ${W / 2 + 35} 180 Q ${W / 2 + 40} 165 ${W / 2 + 45} 163`} stroke="#7BC67E" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Circle cx={W / 2 + 45} cy={161} r={4} fill="#7BC67E" />
        {/* Curtains */}
        <Path d={`M ${W / 2 - 65} 55 Q ${W / 2 - 75} 130 ${W / 2 - 68} 200`} fill="#F2C4C4" opacity={0.7} />
        <Path d={`M ${W / 2 - 65} 55 Q ${W / 2 - 55} 130 ${W / 2 - 58} 200`} fill="#F2C4C4" opacity={0.5} />
        <Path d={`M ${W / 2 + 65} 55 Q ${W / 2 + 75} 130 ${W / 2 + 68} 200`} fill="#F2C4C4" opacity={0.7} />
        <Path d={`M ${W / 2 + 65} 55 Q ${W / 2 + 55} 130 ${W / 2 + 58} 200`} fill="#F2C4C4" opacity={0.5} />
        {/* Curtain rod */}
        <Line x1={W / 2 - 72} y1={55} x2={W / 2 + 72} y2={55} stroke="#B8A080" strokeWidth={3} strokeLinecap="round" />
      </G>

      {/* === COUCH === */}
      <G>
        {/* Couch back */}
        <Rect x={15} y={270} width={200} height={55} rx={16} fill="#D4A89A" />
        {/* Couch seat */}
        <Rect x={20} y={310} width={190} height={40} rx={12} fill="#E8BFB1" />
        {/* Cushion divider */}
        <Line x1={110} y1={312} x2={110} y2={345} stroke="#D4A89A" strokeWidth={1.5} opacity={0.5} />
        {/* Armrest left */}
        <Rect x={10} y={280} width={25} height={75} rx={12} fill="#D4A89A" />
        {/* Armrest right */}
        <Rect x={195} y={280} width={25} height={75} rx={12} fill="#D4A89A" />
        {/* Couch legs */}
        <Rect x={30} y={350} width={6} height={14} rx={2} fill="#A0785A" />
        <Rect x={195} y={350} width={6} height={14} rx={2} fill="#A0785A" />
        {/* Pillow */}
        <Ellipse cx={55} cy={300} rx={20} ry={14} fill="#F5D5A0" opacity={0.8} />
        <Ellipse cx={170} cy={302} rx={18} ry={12} fill="#C4DCF0" opacity={0.8} />
      </G>

      {/* === RUG === */}
      <G>
        <Ellipse cx={W / 2} cy={H * 0.82} rx={W * 0.32} ry={40} fill="#F2D4C4" opacity={0.6} />
        <Ellipse cx={W / 2} cy={H * 0.82} rx={W * 0.28} ry={34} fill="#F5E0D0" opacity={0.5} />
        <Ellipse cx={W / 2} cy={H * 0.82} rx={W * 0.22} ry={26} fill="#F8EBE0" opacity={0.4} />
      </G>

      {/* === ARMCHAIR === */}
      <G>
        {/* Chair back */}
        <Rect x={W - 130} y={290} width={70} height={50} rx={14} fill="#B8C9A0" />
        {/* Chair seat */}
        <Rect x={W - 125} y={325} width={60} height={30} rx={10} fill="#C8D9B0" />
        {/* Armrests */}
        <Rect x={W - 135} y={300} width={18} height={58} rx={9} fill="#B8C9A0" />
        <Rect x={W - 73} y={300} width={18} height={58} rx={9} fill="#B8C9A0" />
        {/* Legs */}
        <Rect x={W - 120} y={355} width={5} height={12} rx={2} fill="#8A7A60" />
        <Rect x={W - 78} y={355} width={5} height={12} rx={2} fill="#8A7A60" />
        {/* Cushion */}
        <Ellipse cx={W - 95} cy={320} rx={16} ry={10} fill="#D0E0C0" opacity={0.6} />
      </G>

      {/* === BOOKSHELF === */}
      <G>
        {/* Shelf frame */}
        <Rect x={W - 120} y={100} width={90} height={150} fill="#C9A86C" />
        {/* Shelves */}
        <Rect x={W - 122} y={100} width={94} height={5} fill="#B89858" />
        <Rect x={W - 122} y={148} width={94} height={5} fill="#B89858" />
        <Rect x={W - 122} y={196} width={94} height={5} fill="#B89858" />
        <Rect x={W - 122} y={245} width={94} height={5} fill="#B89858" />
        {/* Books - top shelf */}
        <Rect x={W - 115} y={107} width={10} height={38} rx={1} fill="#E8A0A0" />
        <Rect x={W - 103} y={112} width={8} height={33} rx={1} fill="#A0C0E0" />
        <Rect x={W - 93} y={108} width={10} height={37} rx={1} fill="#B8D8A0" />
        <Rect x={W - 80} y={110} width={7} height={35} rx={1} fill="#E8D0A0" />
        <Rect x={W - 70} y={106} width={11} height={39} rx={1} fill="#D0B0E0" />
        {/* Books - middle shelf */}
        <Rect x={W - 115} y={155} width={12} height={38} rx={1} fill="#A0D0C0" />
        <Rect x={W - 100} y={160} width={9} height={33} rx={1} fill="#F0C0A0" />
        <Rect x={W - 88} y={156} width={10} height={37} rx={1} fill="#C0A0D0" />
        {/* Little frame/photo */}
        <Rect x={W - 72} y={162} width={18} height={22} rx={1} fill="#E8DDD0" />
        <Rect x={W - 70} y={164} width={14} height={18} rx={1} fill="#D4EEFF" />
        {/* Bottom shelf - decorations */}
        <Circle cx={W - 108} cy={225} r={10} fill="#E8BFB1" opacity={0.7} />
        <Rect x={W - 85} y={210} width={14} height={32} rx={3} fill="#B0D0A0" />
        <Circle cx={W - 55} cy={228} r={8} fill="#F0D0E0" opacity={0.7} />
      </G>

      {/* === WALL DECORATIONS === */}
      {/* Small framed picture on left wall */}
      <G>
        <Rect x={15} y={120} width={50} height={40} rx={3} fill="#C9B99A" />
        <Rect x={19} y={124} width={42} height={32} fill="#E8F0E0" />
        {/* Simple landscape in frame */}
        <Rect x={19} y={140} width={42} height={16} fill="#C8E0A0" opacity={0.5} />
        <Circle cx={50} cy={132} r={5} fill="#FFE4A0" opacity={0.6} />
      </G>

      {/* Clock on wall */}
      <G>
        <Circle cx={W - 40} cy={80} r={18} fill="#FFF8EC" />
        <Circle cx={W - 40} cy={80} r={18} fill="none" stroke="#C9B99A" strokeWidth={3} />
        <Line x1={W - 40} y1={80} x2={W - 40} y2={68} stroke="#4A3728" strokeWidth={1.5} strokeLinecap="round" />
        <Line x1={W - 40} y1={80} x2={W - 32} y2={83} stroke="#4A3728" strokeWidth={1.5} strokeLinecap="round" />
        <Circle cx={W - 40} cy={80} r={2} fill="#4A3728" />
      </G>

      {/* Little hanging plant on left */}
      <G>
        <Line x1={W * 0.18} y1={0} x2={W * 0.18} y2={40} stroke="#A0785A" strokeWidth={1.5} />
        <Ellipse cx={W * 0.18} cy={48} rx={12} ry={8} fill="#C9A86C" />
        <Circle cx={W * 0.18 - 6} cy={42} r={6} fill="#8FD694" />
        <Circle cx={W * 0.18 + 5} cy={40} r={7} fill="#7BC67E" />
        <Circle cx={W * 0.18} cy={38} r={5} fill="#8FD694" />
        <Path d={`M ${W * 0.18 - 4} 48 Q ${W * 0.18 - 12} 62 ${W * 0.18 - 8} 68`} stroke="#7BC67E" strokeWidth={2} fill="none" strokeLinecap="round" />
        <Circle cx={W * 0.18 - 8} cy={70} r={3} fill="#8FD694" />
      </G>
    </Svg>
  );
}

export { ROOM_HEIGHT };
