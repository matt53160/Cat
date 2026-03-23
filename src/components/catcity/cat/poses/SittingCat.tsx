import React from 'react';
import Svg, { Ellipse, Circle, Path, Line, G } from 'react-native-svg';
import { darken } from '../colorUtils';
import { PoseProps } from '../types';

export default function SittingCat({ colors, w, h, flipTransform }: PoseProps) {
  const { furColor, eyeColor, pattern, secondaryColor, earInner, noseColor, darker, ol, lighter, belly, blush } = colors;

  return (
    <Svg width={w} height={h} viewBox="-2 -16 104 128">
      <G transform={flipTransform}>
        <Ellipse cx={50} cy={107} rx={26} ry={3} fill="#00000015" />

        {/* Tail */}
        <G>
          <Path d="M 23,90 C 8,80 6,62 12,52 C 16,46 22,50 20,56" fill="none" stroke={ol} strokeWidth={7} strokeLinecap="round" />
          <Path d="M 23,90 C 8,80 6,62 12,52 C 16,46 22,50 20,56" fill="none" stroke={furColor} strokeWidth={4.5} strokeLinecap="round" />
        </G>

        {/* Body */}
        <Path d="M 28,52 C 24,58 22,72 24,84 C 26,96 36,104 50,104 C 64,96 76,96 76,84 C 78,72 76,58 72,52 C 66,44 34,44 28,52 Z" fill={furColor} stroke={ol} strokeWidth={2.2} />
        <Path d="M 36,58 C 38,52 62,52 64,58 C 68,70 66,90 50,96 C 34,90 32,70 36,58 Z" fill={belly} opacity={0.25} />
        <Path d="M 44,48 C 48,44 52,44 56,48" stroke={ol} strokeWidth={0.6} fill="none" opacity={0.2} />

        {/* Body patterns */}
        {pattern === 'tabby' && (
          <G opacity={0.3}>
            <Path d="M 34,60 C 44,56 56,56 66,60" stroke={darker} strokeWidth={2.2} fill="none" strokeLinecap="round" />
            <Path d="M 32,68 C 44,64 56,64 68,68" stroke={darker} strokeWidth={2.2} fill="none" strokeLinecap="round" />
            <Path d="M 32,76 C 44,72 56,72 68,76" stroke={darker} strokeWidth={2.2} fill="none" strokeLinecap="round" />
            <Path d="M 34,84 C 44,80 56,80 66,84" stroke={darker} strokeWidth={2.2} fill="none" strokeLinecap="round" />
          </G>
        )}
        {pattern === 'tuxedo' && <Path d="M 38,52 C 44,48 56,48 62,52 C 68,64 66,92 50,98 C 34,92 32,64 38,52 Z" fill="white" opacity={0.55} />}
        {pattern === 'calico' && (
          <G opacity={0.4}>
            <Circle cx={38} cy={66} r={9} fill={secondaryColor || '#FF8C42'} />
            <Circle cx={60} cy={82} r={8} fill={darker} />
          </G>
        )}
        {pattern === 'bicolor' && <Path d="M 50,44 C 66,44 76,58 76,84 C 76,96 64,104 50,104 Z" fill={belly} opacity={0.4} />}

        {/* Front paws */}
        <G>
          <Path d="M 32,96 C 30,94 28,96 29,100 C 30,103 38,104 39,101 C 40,98 42,100 43,100 C 45,100 47,97 45,95 C 43,93 36,93 34,95 Z" fill={furColor} stroke={ol} strokeWidth={1.8} />
          <Path d="M 38,94 C 38,97 38,101 38,103" stroke={ol} strokeWidth={0.6} fill="none" opacity={0.25} />
          <Ellipse cx={34} cy={102} rx={3} ry={1.5} fill={lighter} />
          <Circle cx={32} cy={101} r={0.7} fill={noseColor} opacity={0.5} />
          <Circle cx={34} cy={100.5} r={0.7} fill={noseColor} opacity={0.5} />
          <Circle cx={36} cy={101} r={0.7} fill={noseColor} opacity={0.5} />

          <Path d="M 55,95 C 53,93 51,95 52,98 C 53,101 58,104 62,104 C 66,104 70,101 71,98 C 72,95 70,93 68,95 Z" fill={furColor} stroke={ol} strokeWidth={1.8} />
          <Path d="M 62,94 C 62,97 62,101 62,103" stroke={ol} strokeWidth={0.6} fill="none" opacity={0.25} />
          <Ellipse cx={58} cy={102.5} rx={3} ry={1.5} fill={lighter} />
          <Circle cx={56} cy={101.5} r={0.7} fill={noseColor} opacity={0.5} />
          <Circle cx={58} cy={101} r={0.7} fill={noseColor} opacity={0.5} />
          <Ellipse cx={67} cy={102} rx={3} ry={1.5} fill={lighter} />
          <Circle cx={65.5} cy={101} r={0.6} fill={noseColor} opacity={0.5} />
          <Circle cx={67.5} cy={100.5} r={0.6} fill={noseColor} opacity={0.5} />
          <Circle cx={69.5} cy={101} r={0.6} fill={noseColor} opacity={0.5} />
        </G>

        {/* Head */}
        <G>
          <Path d="M 14,38 C 14,20 26,10 50,10 C 74,10 86,20 86,38 C 86,52 74,62 50,62 C 26,62 14,52 14,38 Z" fill={furColor} stroke={ol} strokeWidth={2.2} />
          <Ellipse cx={50} cy={58} rx={24} ry={10} fill={furColor} />
          <Path d="M 16,44 C 14,47 15,52 18,54" stroke={ol} strokeWidth={0.7} fill="none" opacity={0.2} />
          <Path d="M 84,44 C 86,47 85,52 82,54" stroke={ol} strokeWidth={0.7} fill="none" opacity={0.2} />

          {/* Ears */}
          <G>
            <Path d="M 22,26 L 14,2 L 36,18 Z" fill={furColor} stroke={ol} strokeWidth={2.2} strokeLinejoin="round" />
            <Path d="M 24,24 L 18,6 L 34,19 Z" fill={earInner} opacity={0.65} />
            <Path d="M 23,22 L 24,17" stroke={ol} strokeWidth={0.5} fill="none" opacity={0.3} />
            <Path d="M 26,20 L 27,16" stroke={ol} strokeWidth={0.5} fill="none" opacity={0.3} />
            <Path d="M 66,18 L 76,-2 L 82,22 Z" fill={furColor} stroke={ol} strokeWidth={2.2} strokeLinejoin="round" />
            <Path d="M 68,19 L 76,3 L 80,22 Z" fill={earInner} opacity={0.65} />
            <Path d="M 72,17 L 73,12" stroke={ol} strokeWidth={0.5} fill="none" opacity={0.3} />
            <Path d="M 75,15 L 75,10" stroke={ol} strokeWidth={0.5} fill="none" opacity={0.3} />
          </G>

          {/* Tabby M */}
          {pattern === 'tabby' && (
            <G opacity={0.35}>
              <Path d="M 36,28 L 40,20 L 44,28" stroke={darker} strokeWidth={1.8} fill="none" strokeLinecap="round" />
              <Path d="M 50,24 L 50,16" stroke={darker} strokeWidth={1.8} fill="none" strokeLinecap="round" />
              <Path d="M 56,28 L 60,20 L 64,28" stroke={darker} strokeWidth={1.8} fill="none" strokeLinecap="round" />
            </G>
          )}

          {/* Eyes */}
          <G>
            <Circle cx={37} cy={38} r={7} fill="white" stroke={ol} strokeWidth={1.5} />
            <Circle cx={38.5} cy={39} r={4.5} fill={eyeColor} />
            <Circle cx={38.5} cy={40} r={3} fill={darken(eyeColor, 60)} />
            <Circle cx={40} cy={37} r={1.8} fill="white" />
            <Circle cx={37} cy={41.5} r={0.8} fill="white" opacity={0.5} />
            <Circle cx={63} cy={38} r={7} fill="white" stroke={ol} strokeWidth={1.5} />
            <Circle cx={64.5} cy={39} r={4.5} fill={eyeColor} />
            <Circle cx={64.5} cy={40} r={3} fill={darken(eyeColor, 60)} />
            <Circle cx={66} cy={37} r={1.8} fill="white" />
            <Circle cx={63} cy={41.5} r={0.8} fill="white" opacity={0.5} />
          </G>

          {/* Nose */}
          <Path d="M 47.5,47 C 48,45.5 52,45.5 52.5,47 L 50,50 Z" fill={noseColor} stroke={ol} strokeWidth={1} />

          {/* Mouth */}
          <Path d="M 50,50 C 47,54 42,53 40,51" stroke={ol} strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <Path d="M 50,50 C 53,54 58,53 60,51" stroke={ol} strokeWidth={1.5} fill="none" strokeLinecap="round" />

          {/* Whiskers */}
          <G opacity={0.5}>
            <Line x1={14} y1={42} x2={34} y2={45} stroke={ol} strokeWidth={1} />
            <Line x1={13} y1={47} x2={34} y2={48} stroke={ol} strokeWidth={1} />
            <Line x1={14} y1={52} x2={34} y2={50.5} stroke={ol} strokeWidth={1} />
            <Line x1={66} y1={45} x2={86} y2={42} stroke={ol} strokeWidth={1} />
            <Line x1={66} y1={48} x2={87} y2={47} stroke={ol} strokeWidth={1} />
            <Line x1={66} y1={50.5} x2={86} y2={52} stroke={ol} strokeWidth={1} />
          </G>

          {/* Blush */}
          <Ellipse cx={32} cy={48} rx={4} ry={2.5} fill={blush} opacity={0.35} />
          <Ellipse cx={68} cy={48} rx={4} ry={2.5} fill={blush} opacity={0.35} />
        </G>
      </G>
    </Svg>
  );
}
