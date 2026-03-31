import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  withDelay,
  Easing,
  runOnJS,
  cancelAnimation,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../theme/colors';
import { photoMetadataService, PhotoMetadata } from '../services/photoMetadataService';
import { catCityService } from '../services/catCityService';
import { CatState, PlacedFurniture } from '../components/catcity/engine/types';
import Svg, { G } from 'react-native-svg';
import {
  gridToScreen,
  snapToGrid,
  gridPixelSize,
  canPlaceFurniture,
  TILE_W,
  TILE_H,
} from '../components/catcity/engine/IsoGrid';
import { getFurnitureDef, getAllFurniture } from '../components/catcity/furniture';
import { salonMap } from '../components/catcity/maps/salon';
import IsoRoom from '../components/catcity/IsoRoom';
import CatSprite from '../components/catcity/cat';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── AI color mapping ────────────────────────────────
function isValid(val?: string | null): string | undefined {
  if (!val || val === 'null' || val === 'undefined' || val.trim() === '') return undefined;
  return val;
}

function mapFurColor(color?: string | null): string {
  const val = isValid(color);
  if (!val) return '#B0A090';
  const c = val.toLowerCase();
  const m: Record<string, string> = {
    noir: '#2D2D3A', black: '#2D2D3A',
    blanc: '#FEFEFA', white: '#FEFEFA',
    gris: '#A8B0BC', gray: '#A8B0BC', grey: '#A8B0BC',
    roux: '#F09040', orange: '#FF9F33', ginger: '#F09040',
    marron: '#A06030', brown: '#A06030',
    'crème': '#FFECC8', cream: '#FFECC8', beige: '#FFE8C0',
    'tigré': '#C89050', tabby: '#C89050',
    bleu: '#90A8C0', blue: '#90A8C0',
    chocolat: '#7A4A28', chocolate: '#7A4A28',
  };
  if (m[c]) return m[c];
  for (const [key, v] of Object.entries(m)) { if (c.includes(key)) return v; }
  return '#C8A888';
}

function mapEyeColor(color?: string | null): string {
  const val = isValid(color);
  if (!val) return '#7CB8D9';
  const c = val.toLowerCase();
  const m: Record<string, string> = {
    vert: '#50CC50', green: '#50CC50',
    bleu: '#4AADEE', blue: '#4AADEE',
    jaune: '#F0C830', yellow: '#F0C830', gold: '#EEAA20',
    ambre: '#E8A030', amber: '#E8A030',
    noisette: '#B88840', hazel: '#B88840',
    orange: '#F08020',
    marron: '#A07030', brown: '#A07030',
  };
  if (m[c]) return m[c];
  for (const [key, v] of Object.entries(m)) { if (c.includes(key)) return v; }
  return '#6CC8EE';
}

function mapPattern(pattern?: string): CatState['pattern'] {
  if (!pattern) return 'solid';
  const p = pattern.toLowerCase();
  if (p.includes('tabby') || p.includes('tigré') || p.includes('rayé')) return 'tabby';
  if (p.includes('bicolor') || p.includes('bicolore')) return 'bicolor';
  if (p.includes('calico') || p.includes('tricolore')) return 'calico';
  if (p.includes('tuxedo') || p.includes('smoking')) return 'tuxedo';
  return 'solid';
}

function photosToAppearances(photos: PhotoMetadata[]): Omit<CatState, 'pos' | 'pose' | 'direction'>[] {
  const cats = photos
    .filter(p => {
      const t = p.animal_type?.toLowerCase();
      return t === 'chat' || t === 'cat';
    })
    .reduce((acc, photo) => {
      const key = `${photo.breed || 'unknown'}-${photo.primary_color || 'unknown'}`;
      if (!acc.has(key)) {
        acc.set(key, {
          id: photo.id || key,
          name: isValid(photo.custom_name) || isValid(photo.breed) || 'Minou',
          furColor: mapFurColor(photo.primary_color),
          eyeColor: mapEyeColor(photo.eye_color),
          pattern: mapPattern(isValid(photo.coat_pattern)),
          secondaryColor: isValid(photo.secondary_colors?.[0])
            ? mapFurColor(photo.secondary_colors?.[0])
            : undefined,
        });
      }
      return acc;
    }, new Map<string, Omit<CatState, 'pos' | 'pose' | 'direction'>>());
  return Array.from(cats.values());
}

const DEFAULT_CAT: Omit<CatState, 'pos' | 'pose' | 'direction'> = {
  id: 'default', name: 'Minou', furColor: '#FF9F33', eyeColor: '#50CC50', pattern: 'tabby',
};

const CAT_REACTIONS = ['Miaou !', 'Purrrr...', 'Mrrr~', '*ronronne*', 'Miaou ?', 'Prrrt !'];

// ─── Floating hearts ─────────────────────────────────
function FloatingHearts({ visible }: { visible: boolean }) {
  if (!visible) return null;
  const hearts = [
    { emoji: '❤️', delay: 0, x: -10 },
    { emoji: '💕', delay: 200, x: 12 },
    { emoji: '🐾', delay: 400, x: -5 },
  ];
  return (
    <>
      {hearts.map((h, i) => (
        <Animated.Text
          key={i}
          entering={FadeIn.delay(h.delay).duration(300)}
          exiting={FadeOut.duration(400)}
          style={[heartStyles.heart, { left: h.x }]}
        >
          {h.emoji}
        </Animated.Text>
      ))}
    </>
  );
}

const heartStyles = StyleSheet.create({
  heart: { position: 'absolute', top: -30, fontSize: 16 },
});

// ─── Toast ───────────────────────────────────────────
function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <Animated.View
      entering={SlideInDown.springify().damping(30).stiffness(100)}
      exiting={FadeOut.duration(300)}
      style={toastStyles.container}
    >
      <Text style={toastStyles.text}>{message}</Text>
    </Animated.View>
  );
}

const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 140,
    left: 40,
    right: 40,
    backgroundColor: '#4A3728',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    zIndex: 2000,
  },
  text: { color: '#FFF8EC', fontSize: 14, fontWeight: '600' },
});

// ─── Draggable cat ───────────────────────────────────
function DraggableCat({
  cat, originX, originY, gridW, gridH, panOffset, onMoved, onTapped,
}: {
  cat: CatState;
  originX: number;
  originY: number;
  gridW: number;
  gridH: number;
  panOffset: { x: { value: number }; y: { value: number } };
  onMoved: (catId: string, gx: number, gy: number) => void;
  onTapped: (catId: string) => void;
}) {
  const screen = gridToScreen(cat.pos.gx, cat.pos.gy, originX, originY);
  const translateX = useSharedValue(screen.x - 28);
  const translateY = useSharedValue(screen.y - 55);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const scale = useSharedValue(1);
  const isDragging = useSharedValue(false);
  const bobY = useSharedValue(0);

  useEffect(() => {
    const s = gridToScreen(cat.pos.gx, cat.pos.gy, originX, originY);
    translateX.value = withTiming(s.x - 28, { duration: 800, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(s.y - 55, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [cat.pos.gx, cat.pos.gy, originX, originY]);

  useEffect(() => {
    const dur = cat.pose === 'sleeping' ? 1500 : cat.pose === 'sitting' ? 2000 : cat.pose === 'licking' ? 600 : 800;
    const amp = cat.pose === 'sleeping' ? 2 : cat.pose === 'sitting' ? 1.5 : cat.pose === 'licking' ? 1 : 3;
    bobY.value = withRepeat(
      withSequence(
        withTiming(-amp, { duration: dur, easing: Easing.inOut(Easing.sin) }),
        withTiming(amp, { duration: dur, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, true,
    );
    return () => cancelAnimation(bobY);
  }, [cat.pose]);

  const handleDrop = useCallback((dx: number, dy: number) => {
    const snapped = snapToGrid(dx + 28, dy + 55, originX, originY, gridW, gridH);
    onMoved(cat.id, snapped.gx, snapped.gy);
  }, [cat.id, originX, originY, gridW, gridH, onMoved]);

  const handleTap = useCallback(() => {
    onTapped(cat.id);
  }, [cat.id, onTapped]);

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleTap)();
  });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
      scale.value = withTiming(1.15, { duration: 150 });
      cancelAnimation(bobY);
      bobY.value = withTiming(0, { duration: 100 });
    })
    .onUpdate(e => {
      translateX.value = offsetX.value + e.translationX;
      translateY.value = offsetY.value + e.translationY;
    })
    .onEnd(() => {
      isDragging.value = false;
      scale.value = withTiming(1, { duration: 200 });
      runOnJS(handleDrop)(translateX.value, translateY.value);
    });

  const gesture = Gesture.Race(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: translateX.value + panOffset.x.value,
    top: translateY.value + panOffset.y.value + bobY.value,
    zIndex: isDragging.value ? 1000 : Math.round((cat.pos.gx + cat.pos.gy) * 10) + 5,
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        <View style={catStyles.catContainer}>
          <CatSprite
            appearance={cat}
            size={50}
            direction={cat.direction}
            pose={cat.pose === 'walking' ? 'standing' : cat.pose === 'licking' ? 'licking' : cat.pose}
          />
          <View style={catStyles.nameTag}>
            <Text style={catStyles.nameText} numberOfLines={1}>{cat.name}</Text>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const catStyles = StyleSheet.create({
  catContainer: { alignItems: 'center' },
  nameTag: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, marginTop: 2,
    borderWidth: 1, borderColor: colors.border,
  },
  nameText: { fontSize: 10, fontWeight: '700', color: colors.text, textAlign: 'center' },
});

// ─── Cat speech bubble ───────────────────────────────
function CatBubble({ cat, originX, originY, panOffset }: {
  cat: CatState;
  originX: number;
  originY: number;
  panOffset: { x: { value: number }; y: { value: number } };
}) {
  const screen = gridToScreen(cat.pos.gx, cat.pos.gy, originX, originY);
  const reaction = useRef(CAT_REACTIONS[Math.floor(Math.random() * CAT_REACTIONS.length)]).current;

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: screen.x + panOffset.x.value - 45,
    top: screen.y + panOffset.y.value - 105,
    zIndex: 1500,
  }));

  return (
    <Animated.View style={animStyle} entering={FadeIn.springify()} exiting={FadeOut.duration(300)}>
      <View style={bubbleStyles.bubble}>
        <Text style={bubbleStyles.text}>{reaction}</Text>
        <FloatingHearts visible />
      </View>
      <View style={bubbleStyles.arrow} />
    </Animated.View>
  );
}

const bubbleStyles = StyleSheet.create({
  bubble: {
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
    alignItems: 'center',
    minWidth: 90,
  },
  text: { fontSize: 14, fontWeight: '700', color: colors.text },
  arrow: {
    width: 0, height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    alignSelf: 'center',
  },
});

// ─── Draggable furniture (when selected) ─────────────
function DraggableFurniture({
  placed, originX, originY, gridW, gridH, panOffset, furniture, onMoved, onDeselect, onInvalidPlacement,
}: {
  placed: PlacedFurniture;
  originX: number; originY: number; gridW: number; gridH: number;
  panOffset: { x: { value: number }; y: { value: number } };
  furniture: PlacedFurniture[];
  onMoved: (id: string, gx: number, gy: number) => void;
  onDeselect: () => void;
  onInvalidPlacement: () => void;
}) {
  const def = getFurnitureDef(placed.defId);
  if (!def) return null;

  const backScreen = gridToScreen(placed.pos.gx, placed.pos.gy, originX, originY);
  const baseX = backScreen.x;
  const baseY = backScreen.y - def.visualHeight;

  const translateX = useSharedValue(baseX);
  const translateY = useSharedValue(baseY);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const scale = useSharedValue(1);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    const s = gridToScreen(placed.pos.gx, placed.pos.gy, originX, originY);
    translateX.value = withTiming(s.x, { duration: 300 });
    translateY.value = withTiming(s.y - def.visualHeight, { duration: 300 });
  }, [placed.pos.gx, placed.pos.gy]);

  const handleDrop = useCallback((dx: number, dy: number) => {
    const dropX = dx;
    const dropY = dy + def.visualHeight;
    const snapped = snapToGrid(dropX, dropY, originX, originY, gridW, gridH);
    const gx = Math.max(0, Math.min(gridW - def.gridW, snapped.gx));
    const gy = Math.max(0, Math.min(gridH - def.gridH, snapped.gy));

    const existing = furniture.map(f => {
      const d = getFurnitureDef(f.defId);
      return d ? { id: f.id, pos: f.pos, gridW: d.gridW, gridH: d.gridH, walkable: d.walkable } : null;
    }).filter(Boolean) as any[];

    if (canPlaceFurniture(gx, gy, def.gridW, def.gridH, gridW, gridH, existing, placed.id)) {
      onMoved(placed.id, gx, gy);
    } else {
      // Shake animation + snap back
      onInvalidPlacement();
      const s = gridToScreen(placed.pos.gx, placed.pos.gy, originX, originY);
      translateX.value = withTiming(s.x, { duration: 300 });
      translateY.value = withTiming(s.y - def.visualHeight, { duration: 300 });
      shakeX.value = withSequence(
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [placed, def, originX, originY, gridW, gridH, furniture, onMoved, onInvalidPlacement]);

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(onDeselect)();
  });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
      scale.value = withTiming(1.08, { duration: 100 });
    })
    .onUpdate(e => {
      translateX.value = offsetX.value + e.translationX;
      translateY.value = offsetY.value + e.translationY;
    })
    .onEnd(() => {
      scale.value = withTiming(1, { duration: 150 });
      runOnJS(handleDrop)(translateX.value, translateY.value);
    });

  const gesture = Gesture.Race(panGesture, tapGesture);

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: translateX.value + panOffset.x.value + shakeX.value,
    top: translateY.value + panOffset.y.value,
    zIndex: 900,
    transform: [{ scale: scale.value }],
  }));

  const padX = def.gridH * TILE_W / 2 + 10;
  const totalW = (def.gridW + def.gridH) * TILE_W / 2 + 20;
  const totalH = def.visualHeight + (def.gridW + def.gridH) * TILE_H / 2 + 20;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[animStyle, { marginLeft: -padX }]}>
        <Svg width={totalW + padX} height={totalH}
          viewBox={`${-padX} ${-def.visualHeight - 10} ${totalW + padX} ${totalH}`}
        >
          <G>{def.render(TILE_W, TILE_H)}</G>
        </Svg>
      </Animated.View>
    </GestureDetector>
  );
}

// ─── Furniture catalog drawer ────────────────────────
function CatalogDrawer({
  visible,
  onClose,
  onAddFurniture,
  onRemoveSelected,
  selectedFurnitureId,
}: {
  visible: boolean;
  onClose: () => void;
  onAddFurniture: (defId: string) => void;
  onRemoveSelected: () => void;
  selectedFurnitureId: string | null;
}) {
  const allDefs = getAllFurniture();

  if (!visible) return null;

  return (
    <Animated.View
      entering={SlideInDown.duration(300)}
      exiting={SlideOutDown.duration(200)}
      style={catalogStyles.container}
    >
      <View style={catalogStyles.header}>
        <Text style={catalogStyles.title}>Meubles</Text>
        <View style={catalogStyles.headerRight}>
          {selectedFurnitureId && (
            <TouchableOpacity style={catalogStyles.removeBtn} onPress={onRemoveSelected}>
              <Text style={catalogStyles.removeBtnText}>Retirer</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={catalogStyles.closeBtn}>
            <Text style={catalogStyles.closeBtnText}>x</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={catalogStyles.scroll}>
        {allDefs.map(def => (
          <TouchableOpacity
            key={def.id}
            style={catalogStyles.item}
            onPress={() => onAddFurniture(def.id)}
            activeOpacity={0.7}
          >
            <View style={catalogStyles.itemIcon}>
              <Svg width={48} height={48} viewBox={`-30 ${-def.visualHeight} 80 ${def.visualHeight + 40}`}>
                <G>{def.render(TILE_W * 0.6, TILE_H * 0.6)}</G>
              </Svg>
            </View>
            <Text style={catalogStyles.itemName} numberOfLines={1}>{def.name}</Text>
            <View style={catalogStyles.addBadge}>
              <Text style={catalogStyles.addBadgeText}>+</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const catalogStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
    zIndex: 1200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 17, fontWeight: '800', color: colors.text },
  removeBtn: {
    backgroundColor: colors.pinkLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  removeBtnText: { fontSize: 13, fontWeight: '700', color: colors.red },
  closeBtn: {
    width: 30, height: 30,
    borderRadius: 15,
    backgroundColor: colors.bgCardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  scroll: { paddingHorizontal: 16, gap: 12 },
  item: {
    alignItems: 'center',
    width: 80,
    paddingVertical: 8,
    backgroundColor: colors.bgCardAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 11, fontWeight: '600', color: colors.text, marginTop: 4 },
  addBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBadgeText: { fontSize: 13, fontWeight: '800', color: 'white', marginTop: -1 },
});

// ─── Main screen ─────────────────────────────────────
export default function CatCityScreen() {
  const map = salonMap;
  const [furniture, setFurniture] = useState<PlacedFurniture[]>(map.defaultFurniture);
  const [cats, setCats] = useState<CatState[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [tappedCatId, setTappedCatId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextFurnitureNum = useRef(100);

  const pixelSize = gridPixelSize(map.gridW, map.gridH);
  const svgW = Math.max(SCREEN_WIDTH, pixelSize.width + 40);
  const svgH = pixelSize.height + map.wall.height + 120;
  const originX = svgW / 2;
  const originY = map.wall.height + 20;

  // Pan offset for moving the whole map
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const panOffsetX = useSharedValue(0);
  const panOffsetY = useSharedValue(0);

  // ─── Toast helper ──────────────────────────────
  const showToast = useCallback((msg: string, duration = 2000) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), duration);
  }, []);

  // ─── Debounced save to Supabase ────────────────
  const debouncedSave = useCallback((newFurniture: PlacedFurniture[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus('saving');
    saveTimer.current = setTimeout(async () => {
      const result = await catCityService.saveRoom(map.id, newFurniture);
      setSaveStatus(result.success ? 'saved' : 'error');
      if (result.success) {
        setTimeout(() => setSaveStatus(null), 2000);
      }
    }, 1500); // Attend 1.5s d'inactivité avant de sauvegarder
  }, [map.id]);

  // ─── Gestures ──────────────────────────────────
  const mapPanGesture = Gesture.Pan()
    .onStart(() => {
      panOffsetX.value = panX.value;
      panOffsetY.value = panY.value;
    })
    .onUpdate(e => {
      panX.value = panOffsetX.value + e.translationX;
      panY.value = panOffsetY.value + e.translationY;
    });

  const mapTapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(setSelectedFurnitureId)(null);
  });

  const mapGesture = Gesture.Race(mapPanGesture, mapTapGesture);

  const mapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: panX.value },
      { translateY: panY.value },
    ],
  }));

  // ─── Load data ─────────────────────────────────
  const loadCats = useCallback(async () => {
    try {
      const photos = await photoMetadataService.getAllPhotosWithMetadata();
      let appearances = photosToAppearances(photos);
      if (appearances.length === 0) appearances = [DEFAULT_CAT];

      const newCats: CatState[] = appearances.map((a, i) => ({
        ...a,
        pos: { gx: 2 + (i % 3), gy: 2 + Math.floor(i / 3) },
        pose: 'standing' as const,
        direction: Math.random() > 0.5 ? 'left' as const : 'right' as const,
      }));
      setCats(newCats);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoom = useCallback(async () => {
    const room = await catCityService.loadRoom(map.id);
    if (room && room.furniture && room.furniture.length > 0) {
      setFurniture(room.furniture);
    }
  }, [map.id]);

  useEffect(() => {
    loadRoom();
    loadCats();
  }, [loadRoom, loadCats]);

  // ─── Licking animation – standing cats lick their paw periodically ───
  useEffect(() => {
    if (cats.length === 0) return;
    const interval = setInterval(() => {
      setCats(prev => {
        const standingIndices = prev
          .map((c, i) => c.pose === 'standing' ? i : -1)
          .filter(i => i >= 0);
        if (standingIndices.length === 0) return prev;
        const idx = standingIndices[Math.floor(Math.random() * standingIndices.length)];
        return prev.map((c, i) => i === idx ? { ...c, pose: 'licking' as const } : c);
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [cats.length]);

  // Stop licking after 3 seconds
  useEffect(() => {
    const lickingCat = cats.find(c => c.pose === 'licking');
    if (!lickingCat) return;
    const timer = setTimeout(() => {
      setCats(prev => prev.map(c => c.pose === 'licking' ? { ...c, pose: 'standing' as const } : c));
    }, 3000);
    return () => clearTimeout(timer);
  }, [cats]);

  // ─── Handlers ──────────────────────────────────
  const handleFurnitureTap = useCallback((id: string) => {
    setSelectedFurnitureId(prev => prev === id ? null : id);
  }, []);

  const handleFurnitureMoved = useCallback((id: string, gx: number, gy: number) => {
    setFurniture(prev => {
      const next = prev.map(f => f.id === id ? { ...f, pos: { gx, gy } } : f);
      debouncedSave(next);
      return next;
    });
  }, [debouncedSave]);

  const handleInvalidPlacement = useCallback(() => {
    // vibration removed — needs VIBRATE permission
    showToast('Pas assez de place ici !');
  }, [showToast]);

  const handleCatMoved = useCallback((catId: string, gx: number, gy: number) => {
    setCats(prev =>
      prev.map(c => {
        if (c.id !== catId) return c;
        const onFurniture = furniture.find(f => {
          const def = getFurnitureDef(f.defId);
          if (!def?.catSpot) return false;
          return gx >= f.pos.gx && gx < f.pos.gx + def.gridW && gy >= f.pos.gy && gy < f.pos.gy + def.gridH;
        });
        const def = onFurniture ? getFurnitureDef(onFurniture.defId) : null;
        return {
          ...c,
          pos: { gx, gy },
          pose: def?.catSpot?.pose || 'standing',
          direction: gx > c.pos.gx ? 'right' : 'left',
        };
      }),
    );
  }, [furniture]);

  const handleCatTapped = useCallback((catId: string) => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setTappedCatId(catId);
    // vibration removed — needs VIBRATE permission
    bubbleTimer.current = setTimeout(() => setTappedCatId(null), 2500);
  }, []);

  const handleAddFurniture = useCallback((defId: string) => {
    const def = getFurnitureDef(defId);
    if (!def) return;

    // Cherche une place libre sur la grille
    for (let gy = 0; gy <= map.gridH - def.gridH; gy++) {
      for (let gx = 0; gx <= map.gridW - def.gridW; gx++) {
        const existing = furniture.map(f => {
          const d = getFurnitureDef(f.defId);
          return d ? { id: f.id, pos: f.pos, gridW: d.gridW, gridH: d.gridH, walkable: d.walkable } : null;
        }).filter(Boolean) as any[];

        if (canPlaceFurniture(gx, gy, def.gridW, def.gridH, map.gridW, map.gridH, existing)) {
          const num = nextFurnitureNum.current++;
          const newItem: PlacedFurniture = {
            id: `${defId}-${num}`,
            defId,
            pos: { gx, gy },
          };
          setFurniture(prev => {
            const next = [...prev, newItem];
            debouncedSave(next);
            return next;
          });
          showToast(`${def.name} ajouté !`);
          return;
        }
      }
    }
    showToast('Plus de place dans la pièce !');
  }, [furniture, map, debouncedSave, showToast]);

  const handleRemoveSelected = useCallback(() => {
    if (!selectedFurnitureId) return;
    const removed = furniture.find(f => f.id === selectedFurnitureId);
    const def = removed ? getFurnitureDef(removed.defId) : null;
    setFurniture(prev => {
      const next = prev.filter(f => f.id !== selectedFurnitureId);
      debouncedSave(next);
      return next;
    });
    setSelectedFurnitureId(null);
    if (def) showToast(`${def.name} retiré`);
  }, [selectedFurnitureId, furniture, debouncedSave, showToast]);

  // ─── Tapped cat for bubble ─────────────────────
  const tappedCat = tappedCatId ? cats.find(c => c.id === tappedCatId) : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>CatCity</Text>
          <Text style={styles.subtitle}>
            {map.name} - {cats.length} chat{cats.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {saveStatus && (
          <View style={[styles.saveBadge, saveStatus === 'error' && styles.saveBadgeError]}>
            <Text style={styles.saveBadgeText}>
              {saveStatus === 'saving' ? 'Sauvegarde...' : saveStatus === 'saved' ? 'Sauvegardé' : 'Erreur sync'}
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>🏠</Text>
          <Text style={styles.loadingText}>Préparation du salon...</Text>
        </View>
      ) : (
        <GestureHandlerRootView style={styles.gameContainer}>
          <GestureDetector gesture={mapGesture}>
            <Animated.View style={[styles.mapWrapper, mapAnimatedStyle]}>
              <IsoRoom
                map={map}
                furniture={furniture}
                cats={[]}
                selectedFurnitureId={selectedFurnitureId}
                onFurnitureTap={handleFurnitureTap}
              />
            </Animated.View>
          </GestureDetector>

          {/* Selected furniture (draggable overlay) */}
          {selectedFurnitureId && furniture.find(f => f.id === selectedFurnitureId) && (
            <DraggableFurniture
              placed={furniture.find(f => f.id === selectedFurnitureId)!}
              originX={originX}
              originY={originY}
              gridW={map.gridW}
              gridH={map.gridH}
              panOffset={{ x: panX, y: panY }}
              furniture={furniture}
              onMoved={handleFurnitureMoved}
              onDeselect={() => setSelectedFurnitureId(null)}
              onInvalidPlacement={handleInvalidPlacement}
            />
          )}

          {/* Draggable cats */}
          {cats.map(cat => (
            <DraggableCat
              key={cat.id}
              cat={cat}
              originX={originX}
              originY={originY}
              gridW={map.gridW}
              gridH={map.gridH}
              panOffset={{ x: panX, y: panY }}
              onMoved={handleCatMoved}
              onTapped={handleCatTapped}
            />
          ))}

          {/* Cat speech bubble */}
          {tappedCat && (
            <CatBubble
              key={`bubble-${tappedCatId}-${Date.now()}`}
              cat={tappedCat}
              originX={originX}
              originY={originY}
              panOffset={{ x: panX, y: panY }}
            />
          )}

          {/* Bottom toolbar */}
          {!showCatalog && (
            <View style={styles.toolbar}>
              <TouchableOpacity
                style={styles.catalogBtn}
                onPress={() => setShowCatalog(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.catalogBtnIcon}>+</Text>
                <Text style={styles.catalogBtnText}>Meubles</Text>
              </TouchableOpacity>

              <View style={styles.infoItem}>
                <Text style={styles.infoText}>Glissez les chats et les meubles</Text>
              </View>
            </View>
          )}

          {/* Toast */}
          <Toast message={toastMsg || ''} visible={!!toastMsg} />

          {/* Catalog drawer */}
          <CatalogDrawer
            visible={showCatalog}
            onClose={() => setShowCatalog(false)}
            onAddFurniture={handleAddFurniture}
            onRemoveSelected={handleRemoveSelected}
            selectedFurnitureId={selectedFurnitureId}
          />

          {cats.length <= 1 && cats[0]?.id === 'default' && !showCatalog && (
            <View style={styles.hintCard}>
              <Text style={styles.hintTitle}>Votre salon est vide !</Text>
              <Text style={styles.hintText}>
                Prenez des photos de chats avec l'onglet Caméra pour les voir apparaître ici.
              </Text>
            </View>
          )}
        </GestureHandlerRootView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerLeft: {},
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  saveBadge: {
    backgroundColor: colors.greenLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  saveBadgeError: { backgroundColor: colors.pinkLight },
  saveBadgeText: { fontSize: 11, fontWeight: '600', color: colors.text },
  gameContainer: { flex: 1 },
  mapWrapper: {
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingEmoji: { fontSize: 48, marginBottom: 12 },
  loadingText: { fontSize: 16, color: colors.textSecondary, fontWeight: '600' },
  toolbar: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  catalogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  catalogBtnIcon: { fontSize: 18, fontWeight: '800', color: 'white' },
  catalogBtnText: { fontSize: 13, fontWeight: '700', color: 'white' },
  infoItem: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  hintCard: {
    position: 'absolute',
    bottom: 130,
    left: 20,
    right: 20,
    backgroundColor: colors.bgCardAlt,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.goldLight,
  },
  hintTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  hintText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 18 },
});
