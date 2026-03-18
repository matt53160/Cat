import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { PhotoMetadata } from '../services/photoMetadataService';
import { formatColors, formatBreedWithConfidence } from '../services/aiAnalysisService';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface PhotoDetailModalProps {
  visible: boolean;
  photo: PhotoMetadata | null;
  onClose: () => void;
}

const infoItems = [
  { key: 'animal_type', label: 'Animal', emoji: '🐾', colorBg: colors.greenLight },
  { key: 'breed', label: 'Race', emoji: '🏅', colorBg: colors.bgCardAlt },
  { key: 'primary_color', label: 'Couleurs', emoji: '🎨', colorBg: colors.purpleLight },
  { key: 'coat_pattern', label: 'Motif', emoji: '✨', colorBg: colors.pinkLight },
  { key: 'eye_color', label: 'Yeux', emoji: '👁️', colorBg: colors.blueLight },
  { key: 'size_category', label: 'Taille', emoji: '📏', colorBg: colors.bgCardAlt },
  { key: 'age_estimate', label: 'Âge', emoji: '🎂', colorBg: colors.greenLight },
];

export default function PhotoDetailModal({ visible, photo, onClose }: PhotoDetailModalProps) {
  if (!photo) return null;

  const hasAnimalData = photo.animal_type;

  const getValue = (key: string) => {
    switch (key) {
      case 'animal_type':
        return photo.animal_type || 'Incertain';
      case 'breed':
        return formatBreedWithConfidence(photo.breed || 'Incertain', photo.breed_confidence || 0);
      case 'primary_color':
        return formatColors(photo.primary_color || 'Incertain', photo.secondary_colors || []);
      case 'coat_pattern':
        return photo.coat_pattern || 'Incertain';
      case 'eye_color':
        return photo.eye_color || 'Incertain';
      case 'size_category':
        return photo.size_category || 'Incertain';
      case 'age_estimate':
        return photo.age_estimate || 'Incertain';
      default:
        return '';
    }
  };

  const shouldShow = (key: string) => {
    const val = (photo as any)[key];
    return val && val !== 'null' && val !== 'Incertain';
  };

  const getAnimalEmoji = (type?: string) => {
    if (!type) return '🐾';
    const emojis: { [key: string]: string } = {
      chat: '🐱', chien: '🐶', oiseau: '🐦', lapin: '🐰',
      hamster: '🐹', poisson: '🐟', tortue: '🐢',
    };
    return emojis[type.toLowerCase()] || '🐾';
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <StatusBar backgroundColor={colors.bg} barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {hasAnimalData ? `${getAnimalEmoji(photo.animal_type)} ${photo.animal_type}` : 'Photo'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Image */}
          <View style={styles.imageCard}>
            <Image source={{ uri: photo.photo_url }} style={styles.mainImage} resizeMode="cover" />
          </View>

          {hasAnimalData ? (
            <>
              {/* Animal info cards */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionEmoji}>🔍</Text>
                <Text style={styles.sectionTitle}>Informations détectées</Text>
              </View>

              <View style={styles.infoGrid}>
                {infoItems
                  .filter(item => item.key === 'animal_type' || shouldShow(item.key))
                  .map((item) => (
                    <View key={item.key} style={[styles.infoCard, { backgroundColor: item.colorBg }]}>
                      <Text style={styles.infoEmoji}>{item.emoji}</Text>
                      <Text style={styles.infoLabel}>{item.label}</Text>
                      <Text style={styles.infoValue}>{getValue(item.key)}</Text>
                      {item.key === 'breed' && photo.breed_confidence ? (
                        <Text style={styles.confidenceText}>
                          {Math.round(photo.breed_confidence * 100)}% confiance
                        </Text>
                      ) : null}
                    </View>
                  ))}
              </View>

              {/* Technical info */}
              <View style={styles.techCard}>
                <Text style={styles.techTitle}>Infos techniques</Text>
                <View style={styles.techRow}>
                  <Text style={styles.techLabel}>Analysé par</Text>
                  <Text style={styles.techValue}>
                    {photo.ai_provider === 'openai' ? 'GPT-4o mini' : photo.ai_provider}
                  </Text>
                </View>
                {photo.ai_processing_time_ms ? (
                  <View style={styles.techRow}>
                    <Text style={styles.techLabel}>Temps d'analyse</Text>
                    <Text style={styles.techValue}>
                      {(photo.ai_processing_time_ms / 1000).toFixed(1)}s
                    </Text>
                  </View>
                ) : null}
                <View style={styles.techRow}>
                  <Text style={styles.techLabel}>Date</Text>
                  <Text style={styles.techValue}>
                    {new Date(photo.created_at || '').toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noAnimalCard}>
              <Text style={styles.noAnimalEmoji}>🔍</Text>
              <Text style={styles.noAnimalTitle}>Aucun animal détecté</Text>
              <Text style={styles.noAnimalSubtext}>
                Cette photo a été sauvegardée mais aucun animal n'a été identifié.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
  },
  placeholder: {
    width: 36,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  imageCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mainImage: {
    width: '100%',
    height: height * 0.38,
    borderRadius: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  infoCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
  },
  confidenceText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  techCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  techTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 12,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  techLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  techValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  noAnimalCard: {
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    padding: 36,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noAnimalEmoji: {
    fontSize: 44,
    marginBottom: 12,
  },
  noAnimalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  noAnimalSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
