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

const { width, height } = Dimensions.get('window');

interface PhotoDetailModalProps {
  visible: boolean;
  photo: PhotoMetadata | null;
  onClose: () => void;
}

export default function PhotoDetailModal({ visible, photo, onClose }: PhotoDetailModalProps) {
  if (!photo) return null;

  const hasAnimalData = photo.animal_type;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.9)" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        {/* Header avec bouton fermer */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {hasAnimalData ? (photo.animal_type || 'Incertain') : 'Photo'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Image principale */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: photo.photo_url }} style={styles.mainImage} resizeMode="contain" />
          </View>

          {/* Informations sur l'animal */}
          {hasAnimalData ? (
            <View style={styles.animalInfoContainer}>
              <View style={styles.animalHeader}>
                <Icon name="paw" size={24} color="#0A84FF" />
                <Text style={styles.animalTitle}>Informations détectées par IA</Text>
              </View>

              <View style={styles.infoGrid}>
                {/* Type d'animal */}
                <View style={styles.infoItem}>
                  <Icon name="heart" size={20} color="#32D74B" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Animal</Text>
                    <Text style={styles.infoValue}>{photo.animal_type || 'Incertain'}</Text>
                  </View>
                </View>

                {/* Race */}
                {photo.breed && (
                  <View style={styles.infoItem}>
                    <Icon name="ribbon" size={20} color="#FF9F0A" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Race</Text>
                      <Text style={styles.infoValue}>
                        {formatBreedWithConfidence(photo.breed || 'Incertain', photo.breed_confidence || 0)}
                      </Text>
                      {photo.breed_confidence && (
                        <Text style={styles.confidenceText}>
                          Confiance: {Math.round(photo.breed_confidence * 100)}%
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Couleurs */}
                {photo.primary_color && (
                  <View style={styles.infoItem}>
                    <Icon name="color-palette" size={20} color="#AF52DE" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Couleurs</Text>
                      <Text style={styles.infoValue}>
                        {formatColors(photo.primary_color || 'Incertain', photo.secondary_colors || [])}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Motif du pelage */}
                {photo.coat_pattern && (
                  <View style={styles.infoItem}>
                    <Icon name="diamond" size={20} color="#FF375F" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Motif</Text>
                      <Text style={styles.infoValue}>{photo.coat_pattern || 'Incertain'}</Text>
                    </View>
                  </View>
                )}

                {/* Couleur des yeux */}
                {photo.eye_color && (
                  <View style={styles.infoItem}>
                    <Icon name="eye" size={20} color="#5AC8FA" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Yeux</Text>
                      <Text style={styles.infoValue}>{photo.eye_color || 'Incertain'}</Text>
                    </View>
                  </View>
                )}

                {/* Taille */}
                {photo.size_category && (
                  <View style={styles.infoItem}>
                    <Icon name="resize" size={20} color="#FFCC02" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Taille</Text>
                      <Text style={styles.infoValue}>{photo.size_category || 'Incertain'}</Text>
                    </View>
                  </View>
                )}

                {/* Âge estimé */}
                {photo.age_estimate && (
                  <View style={styles.infoItem}>
                    <Icon name="time" size={20} color="#34C759" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Âge</Text>
                      <Text style={styles.infoValue}>{photo.age_estimate || 'Incertain'}</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Métadonnées techniques */}
              <View style={styles.technicalInfo}>
                <Text style={styles.technicalTitle}>Informations techniques</Text>
                <View style={styles.technicalGrid}>
                  <View style={styles.technicalItem}>
                    <Text style={styles.technicalLabel}>Analysé par</Text>
                    <Text style={styles.technicalValue}>
                      {photo.ai_provider === 'openai' ? 'OpenAI GPT-4o mini' : photo.ai_provider}
                    </Text>
                  </View>
                  {photo.ai_processing_time_ms && (
                    <View style={styles.technicalItem}>
                      <Text style={styles.technicalLabel}>Temps d'analyse</Text>
                      <Text style={styles.technicalValue}>
                        {(photo.ai_processing_time_ms / 1000).toFixed(1)}s
                      </Text>
                    </View>
                  )}
                  <View style={styles.technicalItem}>
                    <Text style={styles.technicalLabel}>Date</Text>
                    <Text style={styles.technicalValue}>
                      {new Date(photo.created_at || '').toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            /* Pas d'animal détecté */
            <View style={styles.noAnimalContainer}>
              <Icon name="search" size={48} color="#8E8E93" />
              <Text style={styles.noAnimalTitle}>Aucun animal détecté</Text>
              <Text style={styles.noAnimalSubtitle}>
                Cette photo a été sauvegardée mais aucun animal n'a été identifié par l'IA.
              </Text>
              <View style={styles.technicalInfo}>
                <View style={styles.technicalItem}>
                  <Text style={styles.technicalLabel}>Date</Text>
                  <Text style={styles.technicalValue}>
                    {new Date(photo.created_at || '').toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  placeholder: {
    width: 38, // Même largeur que le bouton close pour centrer le titre
  },
  scrollContent: {
    paddingBottom: 30,
  },
  imageContainer: {
    width: '100%',
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainImage: {
    width: width - 40,
    height: '100%',
    borderRadius: 12,
  },
  animalInfoContainer: {
    marginHorizontal: 20,
  },
  animalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  animalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  infoGrid: {
    gap: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  confidenceText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  technicalInfo: {
    marginTop: 30,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
  },
  technicalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  technicalGrid: {
    gap: 10,
  },
  technicalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  technicalLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  technicalValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  noAnimalContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noAnimalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  noAnimalSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
});