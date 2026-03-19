import React from 'react';
import Svg, { Ellipse, Circle, Path, Line, G } from 'react-native-svg';

export interface CatAppearance {
  id: string;
  name: string;
  furColor: string;
  eyeColor: string;
  pattern?: 'solid' | 'tabby' | 'bicolor' | 'calico' | 'tuxedo';
  secondaryColor?: string;
}

interface CatSpriteProps {
  appearance: CatAppearance;
  size?: number;
  direction?: 'left' | 'right';
  pose?: 'standing' | 'sitting' | 'sleeping';
}

function safeHex(hex: string): string {
  if (!hex || typeof hex !== 'string') return '#B0A090';
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return '#B0A090';
  return `#${clean}`;
}

function darken(hex: string, amount: number): string {
  const safe = safeHex(hex);
  const num = parseInt(safe.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function lighten(hex: string, amount: number): string {
  const safe = safeHex(hex);
  const num = parseInt(safe.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

export default function CatSprite({
  appearance,
  size = 60,
  direction = 'right',
  pose = 'standing',
}: CatSpriteProps) {
  const { furColor, eyeColor, pattern, secondaryColor } = appearance;
  const earInner = '#FFB6C1';
  const nose = '#FFB6C1';
  const w = size;
  const h = size * 1.1;
  const flipTransform = direction === 'left' ? 'translate(100, 0) scale(-1, 1)' : '';
  const darker = darken(furColor, 30);
  const lighter = lighten(furColor, 40);
  const belly = secondaryColor || lighter;

  if (pose === 'sleeping') {
    return (
      <Svg width={w} height={h * 0.6} viewBox="0 0 100 55">
        <G transform={flipTransform}>
          {/* Curled up body */}
          <Ellipse cx={50} cy={35} rx={35} ry={18} fill={furColor} />
          {/* Belly patch */}
          <Ellipse cx={55} cy={38} rx={18} ry={10} fill={belly} opacity={0.5} />
          {/* Tail wrapping around */}
          <Path d="M 18 30 Q 5 20 15 12 Q 22 8 28 15" stroke={darker} strokeWidth={5} fill="none" strokeLinecap="round" />
          {/* Head */}
          <Circle cx={72} cy={28} r={14} fill={furColor} />
          {/* Ears */}
          <Path d="M 62 18 L 65 6 L 72 16 Z" fill={furColor} />
          <Path d="M 64 17 L 66 9 L 71 16 Z" fill={earInner} opacity={0.6} />
          <Path d="M 77 16 L 82 5 L 86 17 Z" fill={furColor} />
          <Path d="M 79 16 L 82 8 L 85 17 Z" fill={earInner} opacity={0.6} />
          {/* Closed eyes */}
          <Path d="M 66 28 Q 68 26 70 28" stroke={darken(furColor, 80)} strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <Path d="M 74 27 Q 76 25 78 27" stroke={darken(furColor, 80)} strokeWidth={1.5} fill="none" strokeLinecap="round" />
          {/* Nose */}
          <Ellipse cx={73} cy={31} rx={1.5} ry={1} fill={nose} />
          {/* Pattern stripes */}
          {pattern === 'tabby' && (
            <G opacity={0.3}>
              <Path d="M 35 22 Q 50 18 65 22" stroke={darker} strokeWidth={2} fill="none" />
              <Path d="M 38 28 Q 50 24 62 28" stroke={darker} strokeWidth={2} fill="none" />
            </G>
          )}
          {/* Zzz */}
          <G opacity={0.5}>
            <Path d="M 82 15 L 86 15 L 82 10 L 86 10" stroke="#B0A090" strokeWidth={1} fill="none" />
            <Path d="M 88 8 L 91 8 L 88 4 L 91 4" stroke="#B0A090" strokeWidth={0.8} fill="none" />
          </G>
        </G>
      </Svg>
    );
  }

  if (pose === 'sitting') {
    return (
      <Svg width={w} height={h} viewBox="0 0 100 110">
        <G transform={flipTransform}>
          {/* Tail */}
          <Path d="M 25 85 Q 10 70 15 55 Q 18 48 25 52" stroke={darker} strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* Body */}
          <Ellipse cx={50} cy={75} rx={22} ry={28} fill={furColor} />
          {/* Belly */}
          <Ellipse cx={50} cy={80} rx={14} ry={18} fill={belly} opacity={0.4} />
          {/* Front paws */}
          <Ellipse cx={38} cy={95} rx={7} ry={5} fill={furColor} />
          <Ellipse cx={62} cy={95} rx={7} ry={5} fill={furColor} />
          <Ellipse cx={38} cy={96} rx={5} ry={3} fill={lighter} opacity={0.5} />
          <Ellipse cx={62} cy={96} rx={5} ry={3} fill={lighter} opacity={0.5} />
          {/* Head */}
          <Circle cx={50} cy={38} r={20} fill={furColor} />
          {/* Ears */}
          <Path d="M 34 26 L 36 6 L 46 22 Z" fill={furColor} />
          <Path d="M 37 24 L 38 11 L 45 22 Z" fill={earInner} opacity={0.6} />
          <Path d="M 56 22 L 64 5 L 68 25 Z" fill={furColor} />
          <Path d="M 58 22 L 64 10 L 66 24 Z" fill={earInner} opacity={0.6} />
          {/* Eyes */}
          <Circle cx={42} cy={36} r={4.5} fill="white" />
          <Circle cx={58} cy={36} r={4.5} fill="white" />
          <Circle cx={43} cy={36} r={3} fill={eyeColor} />
          <Circle cx={59} cy={36} r={3} fill={eyeColor} />
          <Circle cx={44} cy={35} r={1.2} fill="white" />
          <Circle cx={60} cy={35} r={1.2} fill="white" />
          {/* Nose */}
          <Path d="M 48 42 L 50 45 L 52 42 Z" fill={nose} />
          {/* Mouth */}
          <Path d="M 50 45 Q 47 48 44 46" stroke={darken(furColor, 80)} strokeWidth={1} fill="none" strokeLinecap="round" />
          <Path d="M 50 45 Q 53 48 56 46" stroke={darken(furColor, 80)} strokeWidth={1} fill="none" strokeLinecap="round" />
          {/* Whiskers */}
          <Line x1={30} y1={40} x2={42} y2={42} stroke={darken(furColor, 60)} strokeWidth={0.8} opacity={0.6} />
          <Line x1={28} y1={44} x2={42} y2={44} stroke={darken(furColor, 60)} strokeWidth={0.8} opacity={0.6} />
          <Line x1={58} y1={42} x2={70} y2={40} stroke={darken(furColor, 60)} strokeWidth={0.8} opacity={0.6} />
          <Line x1={58} y1={44} x2={72} y2={44} stroke={darken(furColor, 60)} strokeWidth={0.8} opacity={0.6} />
          {/* Tabby stripes */}
          {pattern === 'tabby' && (
            <G opacity={0.25}>
              <Path d="M 40 24 L 44 18" stroke={darker} strokeWidth={2} strokeLinecap="round" />
              <Path d="M 50 22 L 50 16" stroke={darker} strokeWidth={2} strokeLinecap="round" />
              <Path d="M 60 24 L 56 18" stroke={darker} strokeWidth={2} strokeLinecap="round" />
              <Path d="M 38 65 Q 50 60 62 65" stroke={darker} strokeWidth={2.5} fill="none" />
              <Path d="M 35 72 Q 50 67 65 72" stroke={darker} strokeWidth={2.5} fill="none" />
            </G>
          )}
          {/* Tuxedo chest */}
          {pattern === 'tuxedo' && (
            <Ellipse cx={50} cy={78} rx={12} ry={16} fill="white" opacity={0.7} />
          )}
        </G>
      </Svg>
    );
  }

  // Standing pose (default)
  return (
    <Svg width={w} height={h} viewBox="0 0 100 110">
      <G transform={flipTransform}>
        {/* Tail */}
        <Path d="M 22 55 Q 8 40 12 25 Q 15 18 20 22" stroke={darker} strokeWidth={6} fill="none" strokeLinecap="round" />
        {/* Body */}
        <Ellipse cx={50} cy={62} rx={24} ry={18} fill={furColor} />
        {/* Belly */}
        <Ellipse cx={52} cy={66} rx={14} ry={10} fill={belly} opacity={0.4} />
        {/* Back legs */}
        <Path d="M 32 74 L 30 95 Q 30 100 35 100 L 40 100 Q 42 100 42 97 L 40 80" fill={furColor} />
        <Path d="M 45 74 L 43 95 Q 43 100 48 100 L 53 100 Q 55 100 55 97 L 53 80" fill={furColor} />
        {/* Front legs */}
        <Path d="M 58 74 L 57 95 Q 57 100 62 100 L 67 100 Q 69 100 69 97 L 67 80" fill={furColor} />
        <Path d="M 70 74 L 69 95 Q 69 100 74 100 L 79 100 Q 81 100 81 97 L 79 80" fill={furColor} />
        {/* Paw pads */}
        <Ellipse cx={37} cy={100} rx={4} ry={2} fill={lighter} opacity={0.5} />
        <Ellipse cx={50} cy={100} rx={4} ry={2} fill={lighter} opacity={0.5} />
        <Ellipse cx={64} cy={100} rx={4} ry={2} fill={lighter} opacity={0.5} />
        <Ellipse cx={77} cy={100} rx={4} ry={2} fill={lighter} opacity={0.5} />
        {/* Head */}
        <Circle cx={65} cy={38} r={20} fill={furColor} />
        {/* Ears */}
        <Path d="M 50 26 L 52 6 L 60 22 Z" fill={furColor} />
        <Path d="M 53 24 L 54 11 L 59 22 Z" fill={earInner} opacity={0.6} />
        <Path d="M 72 22 L 78 4 L 83 24 Z" fill={furColor} />
        <Path d="M 74 22 L 78 10 L 81 23 Z" fill={earInner} opacity={0.6} />
        {/* Eyes */}
        <Circle cx={58} cy={36} r={4.5} fill="white" />
        <Circle cx={73} cy={36} r={4.5} fill="white" />
        <Circle cx={59} cy={36} r={3} fill={eyeColor} />
        <Circle cx={74} cy={36} r={3} fill={eyeColor} />
        <Circle cx={60} cy={35} r={1.2} fill="white" />
        <Circle cx={75} cy={35} r={1.2} fill="white" />
        {/* Nose */}
        <Path d="M 64 42 L 66 45 L 68 42 Z" fill={nose} />
        {/* Mouth */}
        <Path d="M 66 45 Q 63 48 60 46" stroke={darken(furColor, 80)} strokeWidth={1} fill="none" strokeLinecap="round" />
        <Path d="M 66 45 Q 69 48 72 46" stroke={darken(furColor, 80)} strokeWidth={1} fill="none" strokeLinecap="round" />
        {/* Whiskers */}
        <Line x1={46} y1={40} x2={57} y2={42} stroke={darken(furColor, 60)} strokeWidth={0.8} opacity={0.6} />
        <Line x1={44} y1={44} x2={57} y2={44} stroke={darken(furColor, 60)} strokeWidth={0.8} opacity={0.6} />
        <Line x1={74} y1={42} x2={85} y2={40} stroke={darken(furColor, 60)} strokeWidth={0.8} opacity={0.6} />
        <Line x1={74} y1={44} x2={87} y2={44} stroke={darken(furColor, 60)} strokeWidth={0.8} opacity={0.6} />
        {/* Tabby stripes */}
        {pattern === 'tabby' && (
          <G opacity={0.25}>
            <Path d="M 56 24 L 58 18" stroke={darker} strokeWidth={2} strokeLinecap="round" />
            <Path d="M 65 22 L 65 16" stroke={darker} strokeWidth={2} strokeLinecap="round" />
            <Path d="M 74 24 L 72 18" stroke={darker} strokeWidth={2} strokeLinecap="round" />
            <Path d="M 35 55 Q 50 50 65 55" stroke={darker} strokeWidth={2.5} fill="none" />
            <Path d="M 33 62 Q 50 57 67 62" stroke={darker} strokeWidth={2.5} fill="none" />
          </G>
        )}
        {/* Tuxedo chest */}
        {pattern === 'tuxedo' && (
          <Ellipse cx={52} cy={64} rx={12} ry={9} fill="white" opacity={0.7} />
        )}
      </G>
    </Svg>
  );
}
