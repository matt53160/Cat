import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../theme/colors';
import { photoMetadataService, PhotoMetadata } from '../services/photoMetadataService';
import Room, { FURNITURE_SPOTS, ROOM_HEIGHT } from '../components/catcity/Room';
import CatSprite, { CatAppearance } from '../components/catcity/CatSprite';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Map AI-detected colors to hex
function isValid(val?: string | null): string | undefined {
  if (!val || val === 'null' || val === 'undefined' || val.trim() === '') return undefined;
  return val;
}

function mapFurColor(color?: string | null): string {
  const val = isValid(color);
  if (!val) return '#B0A090';
  const c = val.toLowerCase();
  const colorMap: Record<string, string> = {
    'noir': '#3A3A3A', 'black': '#3A3A3A',
    'blanc': '#F0EBE0', 'white': '#F0EBE0',
    'gris': '#9A9A9A', 'gray': '#9A9A9A', 'grey': '#9A9A9A',
    'roux': '#D4854A', 'orange': '#E8A050', 'ginger': '#D4854A',
    'marron': '#8B6840', 'brown': '#8B6840',
    'crème': '#F0DCC0', 'cream': '#F0DCC0', 'beige': '#E8D8C0',
    'tigré': '#B08050', 'tabby': '#B08050',
    'bleu': '#8A9AAA', 'blue': '#8A9AAA',
    'chocolat': '#6A4A30', 'chocolate': '#6A4A30',
    'lilas': '#C0A8B8', 'lilac': '#C0A8B8',
    'roux et blanc': '#D4854A', 'orange et blanc': '#E8A050',
  };
  // Try direct match or partial match
  if (colorMap[c]) return colorMap[c];
  for (const [key, val] of Object.entries(colorMap)) {
    if (c.includes(key)) return val;
  }
  return '#B0A090';
}

function mapEyeColor(color?: string | null): string {
  const val = isValid(color);
  if (!val) return '#7CB8D9';
  const c = val.toLowerCase();
  const eyeMap: Record<string, string> = {
    'vert': '#6AAF50', 'green': '#6AAF50',
    'bleu': '#5A9AC0', 'blue': '#5A9AC0',
    'jaune': '#D4B840', 'yellow': '#D4B840', 'gold': '#D4A830',
    'ambre': '#D4A040', 'amber': '#D4A040',
    'noisette': '#A08040', 'hazel': '#A08040',
    'cuivre': '#C07830', 'copper': '#C07830',
    'orange': '#D08030',
    'marron': '#8A6830', 'brown': '#8A6830',
  };
  if (eyeMap[c]) return eyeMap[c];
  for (const [key, val] of Object.entries(eyeMap)) {
    if (c.includes(key)) return val;
  }
  return '#7CB8D9';
}

function mapPattern(pattern?: string): CatAppearance['pattern'] {
  if (!pattern) return 'solid';
  const p = pattern.toLowerCase();
  if (p.includes('tabby') || p.includes('tigré') || p.includes('rayé')) return 'tabby';
  if (p.includes('bicolor') || p.includes('bicolore') || p.includes('two')) return 'bicolor';
  if (p.includes('calico') || p.includes('tricolore')) return 'calico';
  if (p.includes('tuxedo') || p.includes('smoking')) return 'tuxedo';
  return 'solid';
}

function photosToAppearances(photos: PhotoMetadata[]): CatAppearance[] {
  const cats = photos
    .filter(p => p.animal_type?.toLowerCase() === 'chat' || p.animal_type?.toLowerCase() === 'cat')
    .reduce((acc, photo) => {
      // Deduplicate by breed+color combo
      const key = `${photo.breed || 'unknown'}-${photo.primary_color || 'unknown'}`;
      if (!acc.has(key)) {
        acc.set(key, {
          id: photo.id || key,
          name: isValid(photo.custom_name) || isValid(photo.breed) || 'Minou',
          furColor: mapFurColor(photo.primary_color),
          eyeColor: mapEyeColor(photo.eye_color),
          pattern: mapPattern(isValid(photo.coat_pattern)),
          secondaryColor: isValid(photo.secondary_colors?.[0])
            ? mapFurColor(photo.secondary_colors[0])
            : undefined,
        });
      }
      return acc;
    }, new Map<string, CatAppearance>());

  return Array.from(cats.values());
}

// Default cat if user has no photos yet
const DEFAULT_CAT: CatAppearance = {
  id: 'default',
  name: 'Minou',
  furColor: '#E8A050',
  eyeColor: '#6AAF50',
  pattern: 'tabby',
};

interface CatState {
  appearance: CatAppearance;
  spotIndex: number;
  pose: 'standing' | 'sitting' | 'sleeping';
  direction: 'left' | 'right';
}

// Individual animated cat component
function AnimatedCat({
  cat,
  onDragEnd,
}: {
  cat: CatState;
  onDragEnd: (catId: string, x: number, y: number) => void;
}) {
  const spot = FURNITURE_SPOTS[cat.spotIndex];
  const translateX = useSharedValue(spot.x);
  const translateY = useSharedValue(spot.y);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const scale = useSharedValue(1);
  const isDragging = useSharedValue(false);
  const bobY = useSharedValue(0);

  // Initial position
  useEffect(() => {
    translateX.value = withTiming(spot.x, { duration: 800, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(spot.y, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [spot.x, spot.y]);

  // Idle bobbing animation
  useEffect(() => {
    if (cat.pose === 'sleeping') {
      bobY.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(2, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    } else if (cat.pose === 'sitting') {
      bobY.value = withRepeat(
        withSequence(
          withTiming(-1.5, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.5, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    } else {
      bobY.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(3, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    }
    return () => cancelAnimation(bobY);
  }, [cat.pose]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
      scale.value = withTiming(1.15, { duration: 150 });
      cancelAnimation(bobY);
      bobY.value = withTiming(0, { duration: 100 });
    })
    .onUpdate(event => {
      translateX.value = offsetX.value + event.translationX;
      translateY.value = offsetY.value + event.translationY;
    })
    .onEnd(() => {
      isDragging.value = false;
      scale.value = withTiming(1, { duration: 200 });
      runOnJS(onDragEnd)(cat.appearance.id, translateX.value, translateY.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: translateX.value,
    top: translateY.value + bobY.value,
    zIndex: isDragging.value ? 100 : 10,
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        <View style={catStyles.catContainer}>
          <CatSprite
            appearance={cat.appearance}
            size={55}
            direction={cat.direction}
            pose={cat.pose}
          />
          <View style={catStyles.nameTag}>
            <Text style={catStyles.nameText} numberOfLines={1}>
              {cat.appearance.name}
            </Text>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const catStyles = StyleSheet.create({
  catContainer: {
    alignItems: 'center',
  },
  nameTag: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nameText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});

export default function CatCityScreen() {
  const [cats, setCats] = useState<CatState[]>([]);
  const [loading, setLoading] = useState(true);
  const autoMoveTimers = useRef<ReturnType<typeof setInterval>[]>([]);

  const loadCats = useCallback(async () => {
    try {
      const photos = await photoMetadataService.getAllPhotosWithMetadata();
      let appearances = photosToAppearances(photos);

      if (appearances.length === 0) {
        appearances = [DEFAULT_CAT];
      }

      // Assign each cat a random furniture spot
      const usedSpots = new Set<number>();
      const newCats: CatState[] = appearances.map((appearance, i) => {
        let spotIdx = i % FURNITURE_SPOTS.length;
        while (usedSpots.has(spotIdx)) {
          spotIdx = (spotIdx + 1) % FURNITURE_SPOTS.length;
        }
        usedSpots.add(spotIdx);
        const spot = FURNITURE_SPOTS[spotIdx];
        return {
          appearance,
          spotIndex: spotIdx,
          pose: spot.pose,
          direction: Math.random() > 0.5 ? 'left' : 'right',
        };
      });

      setCats(newCats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCats();
  }, [loadCats]);

  // Auto-move cats periodically
  useEffect(() => {
    if (cats.length === 0) return;

    const moveRandomCat = () => {
      setCats(prev => {
        if (prev.length === 0) return prev;
        const catIdx = Math.floor(Math.random() * prev.length);
        const usedSpots = new Set(prev.map(c => c.spotIndex));
        const availableSpots = FURNITURE_SPOTS
          .map((_, i) => i)
          .filter(i => !usedSpots.has(i));

        if (availableSpots.length === 0) return prev;

        const newSpotIdx = availableSpots[Math.floor(Math.random() * availableSpots.length)];
        const newSpot = FURNITURE_SPOTS[newSpotIdx];

        return prev.map((c, i) => {
          if (i !== catIdx) return c;
          const dirToSpot = newSpot.x > FURNITURE_SPOTS[c.spotIndex].x ? 'right' : 'left';
          return {
            ...c,
            spotIndex: newSpotIdx,
            pose: newSpot.pose,
            direction: dirToSpot,
          };
        });
      });
    };

    // Each cat moves every 6-12 seconds
    const timerId = setInterval(moveRandomCat, 6000 + Math.random() * 6000);
    autoMoveTimers.current.push(timerId);

    return () => {
      autoMoveTimers.current.forEach(clearInterval);
      autoMoveTimers.current = [];
    };
  }, [cats.length]);

  const handleDragEnd = useCallback((catId: string, x: number, y: number) => {
    // Find closest furniture spot
    let closestIdx = 0;
    let closestDist = Infinity;
    FURNITURE_SPOTS.forEach((spot, i) => {
      const dist = Math.sqrt((spot.x - x) ** 2 + (spot.y - y) ** 2);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });

    const closestSpot = FURNITURE_SPOTS[closestIdx];

    setCats(prev =>
      prev.map(c => {
        if (c.appearance.id !== catId) return c;
        return {
          ...c,
          spotIndex: closestIdx,
          pose: closestSpot.pose,
          direction: x > closestSpot.x ? 'left' : 'right',
        };
      }),
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>CatCity</Text>
        <Text style={styles.subtitle}>
          {cats.length} chat{cats.length !== 1 ? 's' : ''} dans le salon
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>🏠</Text>
          <Text style={styles.loadingText}>Préparation du salon...</Text>
        </View>
      ) : (
        <GestureHandlerRootView style={styles.gameContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.roomContainer}>
              {/* Room background */}
              <Room />

              {/* Cats */}
              {cats.map(cat => (
                <AnimatedCat
                  key={cat.appearance.id}
                  cat={cat}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </View>

            {/* Info bar */}
            <View style={styles.infoBar}>
              <View style={styles.infoItem}>
                <Text style={styles.infoEmoji}>🐱</Text>
                <Text style={styles.infoText}>
                  Déplacez vos chats en les glissant !
                </Text>
              </View>
            </View>

            {cats.length <= 1 && cats[0]?.appearance.id === 'default' && (
              <View style={styles.hintCard}>
                <Text style={styles.hintTitle}>Votre salon est vide !</Text>
                <Text style={styles.hintText}>
                  Prenez des photos de chats avec l'onglet Caméra pour les voir apparaître ici avec leur vraie apparence.
                </Text>
              </View>
            )}
          </ScrollView>
        </GestureHandlerRootView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gameContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  roomContainer: {
    width: SCREEN_WIDTH,
    height: ROOM_HEIGHT,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  infoEmoji: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  hintCard: {
    marginHorizontal: 20,
    backgroundColor: colors.bgCardAlt,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.goldLight,
  },
  hintTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  hintText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
