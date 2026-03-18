import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { photoMetadataService, PhotoMetadata } from '../services/photoMetadataService';
import PhotoDetailModal from '../components/PhotoDetailModal';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const itemSize = (width - 52) / 2;

interface PhotoItem {
  name: string;
  url: string;
  created_at: string;
  metadata?: PhotoMetadata;
  hasMetadata?: boolean;
}

export default function GalleryScreen() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchPhotos = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPhotos([]);
        return;
      }

      const userFolder = user.email || user.id;
      const userPath = `user-photos/${userFolder}`;

      const { data, error } = await supabase.storage
        .from('photos')
        .list(userPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        Alert.alert('Oups !', 'Impossible de récupérer les photos');
        return;
      }

      if (!data || data.length === 0) {
        setPhotos([]);
        return;
      }

      const photosWithUrls = await Promise.all(
        data.map(async (file) => {
          const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(`${userPath}/${file.name}`);

          const filePath = `${userPath}/${file.name}`;
          const metadataResult = await photoMetadataService.getPhotoMetadata(filePath);

          return {
            name: file.name,
            url: urlData.publicUrl,
            created_at: file.created_at || file.updated_at || new Date().toISOString(),
            metadata: metadataResult.success ? metadataResult.metadata : undefined,
            hasMetadata: metadataResult.success,
          };
        })
      );

      const filteredPhotos = photosWithUrls.filter(photo => photo.hasMetadata);
      setPhotos(filteredPhotos);
    } catch {
      Alert.alert('Oups !', 'Une erreur est survenue lors de la récupération des photos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  useFocusEffect(
    useCallback(() => {
      fetchPhotos();
    }, [fetchPhotos])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPhotos();
  };

  const openPhotoDetail = (photo: PhotoItem) => {
    if (photo.metadata) {
      setSelectedPhoto(photo.metadata);
      setModalVisible(true);
    }
  };

  const getAnimalEmoji = (type?: string) => {
    if (!type) return '🐾';
    const emojis: { [key: string]: string } = {
      chat: '🐱', chien: '🐶', oiseau: '🐦', lapin: '🐰',
      hamster: '🐹', poisson: '🐟', tortue: '🐢',
    };
    return emojis[type.toLowerCase()] || '🐾';
  };

  const renderPhoto = ({ item }: { item: PhotoItem }) => {
    if (item.name === '.emptyFolderPlaceholder') {
      return null;
    }
    return (
      <TouchableOpacity
        style={styles.photoCard}
        onPress={() => openPhotoDetail(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.url }}
          style={styles.photo}
          onError={() => {}}
        />
        <View style={styles.photoInfo}>
          <Text style={styles.photoEmoji}>
            {getAnimalEmoji(item.metadata?.animal_type)}
          </Text>
          <View style={styles.photoTextContainer}>
            <Text style={styles.photoType} numberOfLines={1}>
              {item.metadata?.animal_type || 'Inconnu'}
            </Text>
            {item.metadata?.breed && item.metadata.breed !== 'null' && (
              <Text style={styles.photoBreed} numberOfLines={1}>{item.metadata.breed}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Galerie</Text>
        <Text style={styles.headerCount}>
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {photos.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyEmoji}>🖼️</Text>
          <Text style={styles.emptyText}>Aucune photo trouvée</Text>
          <Text style={styles.emptySubtext}>
            Prenez votre première photo avec l'onglet Caméra !
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={photos}
            renderItem={renderPhoto}
            keyExtractor={(item) => item.name}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={styles.columnWrapper}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.gold}
                colors={[colors.gold]}
              />
            }
          />
          <PhotoDetailModal
            visible={modalVisible}
            photo={selectedPhoto}
            onClose={() => {
              setModalVisible(false);
              setSelectedPhoto(null);
            }}
          />
        </>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  headerCount: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 16,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  photoCard: {
    width: itemSize,
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  photo: {
    width: itemSize,
    height: itemSize,
    resizeMode: 'cover',
  },
  photoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  photoEmoji: {
    fontSize: 20,
  },
  photoTextContainer: {
    flex: 1,
  },
  photoType: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
  },
  photoBreed: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.textSecondary,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
