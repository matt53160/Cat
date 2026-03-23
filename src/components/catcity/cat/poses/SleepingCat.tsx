import React from 'react';
import Svg, { Ellipse, Circle, Path, Line, G } from 'react-native-svg';
import { darken } from '../colorUtils';
import { PoseProps } from '../types';

export default function SleepingCat({ colors, w, h, direction }: PoseProps) {
  const { furColor, eyeColor, pattern, secondaryColor, earInner, noseColor, darker, ol, lighter, belly, blush } = colors;

  return (
    <Svg width={w} height={h * 0.6} viewBox="-2 -14 104 84">
      <G transform={direction === 'left' ? 'translate(100, 0) scale(-1, 1)' : ''}>
        <Ellipse cx={50} cy={66} rx={40} ry={3.5} fill="#00000015" />

        {/* Tail */}
        <G>
          <Path d="M 12,42 C 2,34 -1,20 5,12 C 9,6 15,10 13,18 C 11,24 12,32 16,38" fill="none" stroke={ol} strokeWidth={7} strokeLinecap="round" />
          <Path d="M 12,42 C 2,34 -1,20 5,12 C 9,6 15,10 13,18 C 11,24 12,32 16,38" fill="none" stroke={furColor} strokeWidth={4.5} strokeLinecap="round" />
        </G>

        {/* Body */}
        <Path d="M 10,44 C 10,32 24,26 46,26 C 68,26 82,32 82,44 C 82,54 70,62 46,62 C 22,62 10,54 10,44 Z" fill={furColor} stroke={ol} strokeWidth={2.2} />
        <Path d="M 28,38 C 36,34 56,34 64,38 C 68,44 64,54 46,56 C 28,54 24,44 28,38 Z" fill={belly} opacity={0.25} />

        {/* Body patterns */}
        {pattern === 'tabby' && (
          <G opacity={0.3}>
            <Path d="M 22,34 C 36,30 56,30 70,34" stroke={darker} strokeWidth={2.5} fill="none" strokeLinecap="round" />
            <Path d="M 20,40 C 36,36 56,36 72,40" stroke={darker} strokeWidth={2.5} fill="none" strokeLinecap="round" />
            <Path d="M 22,46 C 36,42 56,42 70,46" stroke={darker} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          </G>
        )}
        {pattern === 'tuxedo' && <Path d="M 36,32 C 44,28 54,28 60,32 C 66,40 60,56 46,58 C 32,56 28,40 36,32 Z" fill="white" opacity={0.5} />}
        {pattern === 'calico' && (
          <G opacity={0.4}>
            <Circle cx={32} cy={38} r={7} fill={secondaryColor || '#FF8C42'} />
            <Circle cx={58} cy={44} r={6} fill={darker} />
          </G>
        )}
        {pattern === 'bicolor' && <Path d="M 46,26 C 68,26 82,32 82,44 C 82,54 70,62 46,62 Z" fill={belly} opacity={0.4} />}

        {/* Back paw */}
        <Path d="M 18,54 C 16,54 14,56 15,59 C 16,62 24,62 25,59 C 26,56 24,54 22,54 Z" fill={furColor} stroke={ol} strokeWidth={1.8} />
        <Ellipse cx={20} cy={60} rx={3} ry={1.5} fill={lighter} />
        <Circle cx={18} cy={59} r={0.7} fill={noseColor} opacity={0.5} />
        <Circle cx={20} cy={58.5} r={0.7} fill={noseColor} opacity={0.5} />
        <Circle cx={22} cy={59} r={0.7} fill={noseColor} opacity={0.5} />

        {/* Front paws tucked */}
        <Path d="M 60,52 C 58,51 56,53 57,56 C 58,59 64,60 66,58 C 67,56 68,58 70,57 C 72,56 74,53 72,51 C 70,49 64,49 62,51 Z" fill={furColor} stroke={ol} strokeWidth={1.8} />
        <Path d="M 65,50 C 65,53 65,57 65,59" stroke={ol} strokeWidth={0.7} fill="none" opacity={0.25} />

        {/* Head */}
        <G>
          <Path d="M 48,22 C 48,8 58,2 72,2 C 86,2 96,8 96,22 C 96,34 88,44 72,44 C 56,44 48,34 48,22 Z" fill={furColor} stroke={ol} strokeWidth={2.2} />
          <Ellipse cx={66} cy={42} rx={20} ry={8} fill={furColor} />
          <Path d="M 50,24 C 48,27 49,32 52,34" stroke={ol} strokeWidth={0.7} fill="none" opacity={0.2} />
          <Path d="M 94,24 C 96,27 95,32 92,34" stroke={ol} strokeWidth={0.7} fill="none" opacity={0.2} />

          {/* Ears */}
          <G>
            <Path d="M 54,10 L 48,-8 L 64,4 Z" fill={furColor} stroke={ol} strokeWidth={2} strokeLinejoin="round" />
            <Path d="M 56,8 L 51,-4 L 62,5 Z" fill={earInner} opacity={0.65} />
            <Path d="M 55,6 L 56,2" stroke={ol} strokeWidth={0.5} fill="none" opacity={0.3} />
            <Path d="M 57,5 L 58,1" stroke={ol} strokeWidth={0.5} fill="none" opacity={0.3} />
            <Path d="M 82,4 L 88,-10 L 94,6 Z" fill={furColor} stroke={ol} strokeWidth={2} strokeLinejoin="round" />
            <Path d="M 84,5 L 88,-6 L 92,6 Z" fill={earInner} opacity={0.65} />
            <Path d="M 86,3 L 87,-1" stroke={ol} strokeWidth={0.5} fill="none" opacity={0.3} />
            <Path d="M 88,2 L 88,-2" stroke={ol} strokeWidth={0.5} fill="none" opacity={0.3} />
          </G>

          {/* Tabby M */}
          {pattern === 'tabby' && (
            <G opacity={0.35}>
              <Path d="M 60,10 L 63,4 L 66,10" stroke={darker} strokeWidth={1.5} fill="none" strokeLinecap="round" />
              <Path d="M 72,8 L 72,2" stroke={darker} strokeWidth={1.5} fill="none" strokeLinecap="round" />
              <Path d="M 78,10 L 81,4 L 84,10" stroke={darker} strokeWidth={1.5} fill="none" strokeLinecap="round" />
            </G>
          )}

          {/* Closed eyes */}
          <G>
            <Path d="M 60,22 C 62,17 67,17 69,22" stroke={ol} strokeWidth={2.2} fill="none" strokeLinecap="round" />
            <Path d="M 75,21 C 77,16 82,16 84,21" stroke={ol} strokeWidth={2.2} fill="none" strokeLinecap="round" />
          </G>

          {/* Nose */}
          <Path d="M 70,27 C 70.5,25.5 73.5,25.5 74,27 L 72,29.5 Z" fill={noseColor} stroke={ol} strokeWidth={1} />

          {/* Mouth */}
          <Path d="M 72,29.5 C 70,32.5 66.5,31.5 65,30" stroke={ol} strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <Path d="M 72,29.5 C 74,32.5 77.5,31.5 79,30" stroke={ol} strokeWidth={1.5} fill="none" strokeLinecap="round" />

          {/* Whiskers */}
          <G opacity={0.5}>
            <Line x1={48} y1={24} x2={60} y2={26} stroke={ol} strokeWidth={1} />
            <Line x1={47} y1={28} x2={60} y2={28.5} stroke={ol} strokeWidth={1} />
            <Line x1={48} y1={32} x2={60} y2={30.5} stroke={ol} strokeWidth={1} />
            <Line x1={84} y1={25} x2={96} y2={23} stroke={ol} strokeWidth={1} />
            <Line x1={84} y1={28} x2={97} y2={27.5} stroke={ol} strokeWidth={1} />
            <Line x1={84} y1={30.5} x2={96} y2={31.5} stroke={ol} strokeWidth={1} />
          </G>

          {/* Blush */}
          <Ellipse cx={61} cy={28} rx={3.5} ry={2} fill={blush} opacity={0.35} />
          <Ellipse cx={83} cy={27.5} rx={3.5} ry={2} fill={blush} opacity={0.35} />
        </G>

        {/* Zzz */}
        <G opacity={0.4}>
          <Path d="M 92,6 L 96,6 L 92,1 L 96,1" stroke="#8B7E74" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <Path d="M 97,-2 L 100,-2 L 97,-6 L 100,-6" stroke="#8B7E74" strokeWidth={1} fill="none" strokeLinecap="round" />
        </G>
      </G>
    </Svg>
  );
}
