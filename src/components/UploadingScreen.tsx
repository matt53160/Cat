import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

interface UploadingScreenProps {
  visible: boolean;
  message?: string;
  step?: 'uploading' | 'analyzing' | 'saving' | 'success' | 'error';
}

export default function UploadingScreen({ 
  visible, 
  message = "Envoi de votre photo...", 
  step = 'uploading' 
}: UploadingScreenProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animation d'entrée
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

      // Animation de rotation continue
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();

      return () => spinAnimation.stop();
    } else {
      // Reset des animations
      fadeValue.setValue(0);
      scaleValue.setValue(0.8);
      spinValue.setValue(0);
    }
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeValue }
        ]}
      >
        <Animated.View 
          style={[
            styles.container,
            { 
              transform: [{ scale: scaleValue }],
              opacity: fadeValue 
            }
          ]}
        >
          {/* Icône dynamique selon l'étape */}
          <View style={styles.iconContainer}>
            <Animated.View 
              style={[
                styles.spinningBorder,
                { transform: [{ rotate: spin }] }
              ]}
            />
            <View style={styles.cameraIconWrapper}>
              {step === 'uploading' && <Icon name="cloud-upload" size={40} color="#0A84FF" />}
              {step === 'analyzing' && <Icon name="eye" size={40} color="#0A84FF" />}
              {step === 'saving' && <Icon name="save" size={40} color="#0A84FF" />}
              {step === 'success' && <Icon name="checkmark-circle" size={40} color="#32D74B" />}
              {step === 'error' && <Icon name="alert-circle" size={40} color="#FF3B30" />}
            </View>
          </View>

          {/* Messages dynamiques */}
          <Text style={styles.title}>
            {step === 'uploading' && 'Envoi en cours'}
            {step === 'analyzing' && 'Analyse en cours'}
            {step === 'saving' && 'Sauvegarde'}
            {step === 'success' && 'Terminé !'}
            {step === 'error' && 'Erreur'}
          </Text>
          <Text style={styles.message}>{message}</Text>
          
          {/* Points animés */}
          <View style={styles.dotsContainer}>
            <AnimatedDot delay={0} />
            <AnimatedDot delay={200} />
            <AnimatedDot delay={400} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function AnimatedDot({ delay }: { delay: number }) {
  const scaleValue = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.5,
          duration: 600,
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
      style={[
        styles.dot,
        { transform: [{ scale: scaleValue }] }
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: width * 0.8,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  spinningBorder: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderTopColor: '#0A84FF',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  cameraIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0A84FF',
  },
});