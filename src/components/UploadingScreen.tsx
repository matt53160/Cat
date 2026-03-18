import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface UploadingScreenProps {
  visible: boolean;
  message?: string;
  step?: 'uploading' | 'analyzing' | 'saving' | 'success' | 'error';
}

const stepConfig = {
  uploading: { emoji: '☁️', title: 'Envoi en cours' },
  analyzing: { emoji: '🔍', title: 'Analyse en cours' },
  saving: { emoji: '💾', title: 'Sauvegarde' },
  success: { emoji: '✅', title: 'Terminé !' },
  error: { emoji: '😿', title: 'Oups !' },
};

export default function UploadingScreen({
  visible,
  message = 'Envoi de votre photo...',
  step = 'uploading',
}: UploadingScreenProps) {
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const bounceValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceValue, {
            toValue: -8,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      bounceAnimation.start();

      return () => bounceAnimation.stop();
    } else {
      fadeValue.setValue(0);
      scaleValue.setValue(0.8);
      bounceValue.setValue(0);
    }
  }, [visible]);

  const config = stepConfig[step];

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: fadeValue }]}>
        <Animated.View
          style={[
            styles.container,
            { transform: [{ scale: scaleValue }], opacity: fadeValue },
          ]}
        >
          <Animated.View
            style={[styles.emojiContainer, { transform: [{ translateY: bounceValue }] }]}
          >
            <Text style={styles.emoji}>{config.emoji}</Text>
          </Animated.View>

          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.message}>{message}</Text>

          {step !== 'success' && step !== 'error' && (
            <View style={styles.dotsContainer}>
              <AnimatedDot delay={0} />
              <AnimatedDot delay={200} />
              <AnimatedDot delay={400} />
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function AnimatedDot({ delay }: { delay: number }) {
  const scaleValue = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.4,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    const timer = setTimeout(() => {
      animation.start();
    }, delay);

    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[styles.dot, { transform: [{ scale: scaleValue }] }]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.bgOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    width: width * 0.8,
    maxWidth: 300,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bgCardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.goldLight,
  },
  emoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
});
