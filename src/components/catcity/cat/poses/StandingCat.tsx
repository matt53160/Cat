import React from 'react';
import Svg, { Ellipse, Circle, Path, Line, G } from 'react-native-svg';
import { darken } from '../colorUtils';
import { PoseProps } from '../types';

export default function StandingCat({ colors, w, h, flipTransform }: PoseProps) {
  const { furColor, eyeColor, pattern, secondaryColor, earInner, noseColor, darker, ol, lighter, belly, blush } = colors;

  return (
    <Svg width={w} height={h} viewBox="-2 -10 110 122">
      <G transform={flipTransform}>
        <Ellipse cx={50} cy={107} rx={30} ry={3} fill="#00000015" />

        {/* Tail */}
        <G>
          <Path d="M 18,60 C 8,50 2,32 8,22 C 12,16 18,20 16,28 C 14,34 16,42 20,52" fill="none" stroke={ol} strokeWidth={7} strokeLinecap="round" />
          <Path d="M 18,60 C 8,50 2,32 8,22 C 12,16 18,20 16,28 C 14,34 16,42 20,52" fill="none" stroke={furColor} strokeWidth={4.5} strokeLinecap="round" />
        </G>

        {/* Back legs */}
        <G>
          <Path d="M 26,74 C 24,80 24,90 25,96 C 26,100 34,102 35,98 C 36,94 35,84 34,76" fill={furColor} stroke={ol} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M 38,74 C 36,80 36,90 37,96 C 38,100 46,102 47,98 C 48,94 47,84 46,76" fill={furColor} stroke={ol} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M 25,96 C 24,99 27,102 31,102 C 34,102 36,99 35,97" stroke={ol} strokeWidth={1.5} fill={furColor} />
          <Ellipse cx={30} cy={100.5} rx={3.5} ry={1.8} fill={lighter} />
          <Circle cx={28} cy={99.5} r={0.8} fill={noseColor} opacity={0.5} />
          <Circle cx={30} cy={99} r={0.8} fill={noseColor} opacity={0.5} />
          <Circle cx={32} cy={99.5} r={0.8} fill={noseColor} opacity={0.5} />
          <Path d="M 37,96 C 36,99 39,102 43,102 C 46,102 48,99 47,97" stroke={ol} strokeWidth={1.5} fill={furColor} />
          <Ellipse cx={42} cy={100.5} rx={3.5} ry={1.8} fill={lighter} />
          <Circle cx={40} cy={99.5} r={0.8} fill={noseColor} opacity={0.5} />
          <Circle cx={42} cy={99} r={0.8} fill={noseColor} opacity={0.5} />
          <Circle cx={44} cy={99.5} r={0.8} fill={noseColor} opacity={0.5} />
        </G>

        {/* Front legs */}
        <G>
          <Path d="M 56,74 C 55,80 54,90 55,96 C 56,100 64,102 65,98 C 66,94 65,84 64,76" fill={furColor} stroke={ol} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M 66,74 C 65,80 64,90 65,96 C 66,100 74,102 75,98 C 76,94 75,84 74,76" fill={furColor} stroke={ol} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M 55,96 C 54,99 57,102 61,102 C 64,102 66,99 65,97" stroke={ol} strokeWidth={1.5} fill={furColor} />
          <Ellipse cx={60} cy={100.5} rx={3.5} ry={1.8} fill={lighter} />
          <Circle cx={58} cy={99.5} r={0.8} fill={noseColor} opacity={0.5} />
          <Circle cx={60} cy={99} r={0.8} fill={noseColor} opacity={0.5} />
          <Circle cx={62} cy={99.5} r={0.8} fill={noseColor} opacity={0.5} />
          <Path d="M 65,96 C 64,99 67,102 71,102 C 74,102 76,99 75,97" stroke={ol} strokeWidth={1.5} fill={furColor} />
          <Ellipse cx={70} cy={100.5} rx={3.5} ry={1.8} fill={lighter} />
          <Circle cx={68} cy={99.5} r={0.8} fill={noseColor} opacity={0.5} />
          <Circle cx={70} cy={99} r={0.8} fill={noseColor} opacity={0.5} />
          <Circle cx={72} cy={99.5} r={0.8} fill={noseColor} opacity={0.5} />
        </G>

        {/* Body */}
        <G>
          <Path d="M 20,62 C 18,52 26,46 50,46 C 74,46 82,52 80,62 C 82,72 76,80 50,80 C 24,80 18,72 20,62 Z" fill={furColor} />
          <Path d="M 22,72 C 18,68 18,56 20,52 C 22,48 30,46 50,46 C 70,46 78,48 80,52 C 82,56 82,68 78,72" fill="none" stroke={ol} strokeWidth={2.2} strokeLinecap="round" />
          <Path d="M 32,56 C 38,52 62,52 68,56 C 72,62 68,76 50,78 C 32,76 28,62 32,56 Z" fill={belly} opacity={0.25} />
        </G>

        {/* Body patterns */}
        {pattern === 'tabby' && (
          <G opacity={0.3}>
            <Path d="M 28,54 C 40,50 60,50 72,54" stroke={darker} strokeWidth={2.2} fill="none" strokeLinecap="round" />
            <Path d="M 26,60 C 40,56 60,56 74,60" stroke={darker} strokeWidth={2.2} fill="none" strokeLinecap="round" />
            <Path d="M 26,66 C 40,62 60,62 74,66" stroke={darker} strokeWidth={2.2} fill="none" strokeLinecap="round" />
          </G>
        )}
        {pattern === 'tuxedo' && <Path d="M 38,50 C 44,46 56,46 62,50 C 68,58 64,76 50,78 C 36,76 32,58 38,50 Z" fill="white" opacity={0.55} />}
        {pattern === 'calico' && (
          <G opacity={0.4}>
            <Circle cx={36} cy={58} r={8} fill={secondaryColor || '#FF8C42'} />
            <Circle cx={62} cy={68} r={7} fill={darker} />
          </G>
        )}
        {pattern === 'bicolor' && <Path d="M 50,46 C 74,46 82,52 80,62 C 82,72 76,80 50,80 Z" fill={belly} opacity={0.4} />}

        {/* Head */}
        <G>
          <Path d="M 30,30 C 30,12 44,2 66,2 C 88,2 102,12 102,30 C 102,46 88,56 66,56 C 44,56 30,46 30,30 Z" fill={furColor} stroke={ol} strokeWidth={2.2} />
          <Ellipse cx={58} cy={52} rx={26} ry={5} fill={furColor} />

          {/* Ears */}
          <G>
            <Path d="M 40,18 L 32,-4 L 54,12 Z" fill={furColor} stroke={ol} strokeWidth={2.2} strokeLinejoin="round" />
            <Path d="M 42,16 L 36,1 L 52,13 Z" fill={earInner} opacity={0.65} />
            <Path d="M 41,14 L 42,9" stroke={ol} strokeWidth={0.5} fill="none" opacity={0.3} />
            <Path d="M 44,12 L 45,7" stroke={ol} strokeWidth={0.5} fill="none" opacity={0.3} />
            <Path d="M 82,12 L 92,-8 L 98,16 Z" fill={furColor} stroke={ol} strokeWidth={2.2} strokeLinejoin="round" />
            <Path d="M 84,13 L 92,-3 L 96,16 Z" fill={earInner} opacity={0.65} />
            <Path d="M 88,11 L 89,6" stroke={ol} strokeWidth={0.5} fill="none" opacity={0.3} />
            <Path d="M 91,9 L 91,4" stroke={ol} strokeWidth={0.5} fill="none" opacity={0.3} />
          </G>

          {/* Tabby M */}
          {pattern === 'tabby' && (
            <G opacity={0.35}>
              <Path d="M 52,20 L 56,12 L 60,20" stroke={darker} strokeWidth={1.8} fill="none" strokeLinecap="round" />
              <Path d="M 66,16 L 66,8" stroke={darker} strokeWidth={1.8} fill="none" strokeLinecap="round" />
              <Path d="M 72,20 L 76,12 L 80,20" stroke={darker} strokeWidth={1.8} fill="none" strokeLinecap="round" />
            </G>
          )}

          {/* Eyes */}
          <G>
            <Circle cx={55} cy={30} r={7.5} fill="white" stroke={ol} strokeWidth={1.5} />
            <Circle cx={56.5} cy={31} r={5} fill={eyeColor} />
            <Circle cx={56.5} cy={32} r={3.2} fill={darken(eyeColor, 60)} />
            <Circle cx={58.5} cy={29} r={2} fill="white" />
            <Circle cx={55} cy={33.5} r={0.8} fill="white" opacity={0.5} />
            <Circle cx={79} cy={30} r={7.5} fill="white" stroke={ol} strokeWidth={1.5} />
            <Circle cx={80.5} cy={31} r={5} fill={eyeColor} />
            <Circle cx={80.5} cy={32} r={3.2} fill={darken(eyeColor, 60)} />
            <Circle cx={82.5} cy={29} r={2} fill="white" />
            <Circle cx={79} cy={33.5} r={0.8} fill="white" opacity={0.5} />
          </G>

          {/* Nose */}
          <Path d="M 64.5,39 C 65,37.5 69,37.5 69.5,39 L 67,42 Z" fill={noseColor} stroke={ol} strokeWidth={1} />

          {/* Mouth */}
          <Path d="M 67,42 C 64,46 58,45 56,43" stroke={ol} strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <Path d="M 67,42 C 70,46 76,45 78,43" stroke={ol} strokeWidth={1.5} fill="none" strokeLinecap="round" />

          {/* Whiskers */}
          <G opacity={0.5}>
            <Line x1={30} y1={34} x2={52} y2={37} stroke={ol} strokeWidth={1} />
            <Line x1={29} y1={39} x2={52} y2={40} stroke={ol} strokeWidth={1} />
            <Line x1={30} y1={44} x2={52} y2={42.5} stroke={ol} strokeWidth={1} />
            <Line x1={82} y1={37} x2={102} y2={34} stroke={ol} strokeWidth={1} />
            <Line x1={82} y1={40} x2={103} y2={39} stroke={ol} strokeWidth={1} />
            <Line x1={82} y1={42.5} x2={102} y2={44} stroke={ol} strokeWidth={1} />
          </G>

          {/* Blush */}
          <Ellipse cx={50} cy={40} rx={4} ry={2.5} fill={blush} opacity={0.35} />
          <Ellipse cx={84} cy={40} rx={4} ry={2.5} fill={blush} opacity={0.35} />
        </G>
      </G>
    </Svg>
  );
}
