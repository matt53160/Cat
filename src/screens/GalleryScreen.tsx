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

const { width } = Dimensions.get('window');
const itemSize = (width - 40) / 3; // 3 colonnes avec espacement (10px padding + 5px * 6 gaps)

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
      console.log('Récupération des photos...');
      
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Utilisateur non connecté');
        setPhotos([]);
        return;
      }

      const userFolder = user.email || user.id;
      const userPath = `user-photos/${userFolder}`;
      console.log('Récupération des photos pour:', userFolder);
      
      const { data, error } = await supabase.storage
        .from('photos')
        .list(userPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        console.error('Erreur lors de la récupération:', error);
        Alert.alert('Erreur', `Impossible de récupérer les photos: ${error.message}`);
        return;
      }

      console.log('Photos trouvées:', data?.length || 0);

      if (!data || data.length === 0) {
        setPhotos([]);
        return;
      }

      const photosWithUrls = await Promise.all(
        data.map(async (file) => {
          const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(`${userPath}/${file.name}`);

          // Récupérer les métadonnées de la photo
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

      // Filtrer pour ne garder que les photos avec des métadonnées (photos analysées)
      const filteredPhotos = photosWithUrls.filter(photo => photo.hasMetadata);

      console.log('URLs générées pour', photosWithUrls.length, 'photos, filtrées:', filteredPhotos.length);
      setPhotos(filteredPhotos);
    } catch (error) {
      console.error('Erreur inattendue:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la récupération des photos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Recharger les photos à chaque fois qu'on arrive sur l'onglet
  useFocusEffect(
    useCallback(() => {
      console.log('Focus sur l\'onglet galerie - rechargement des photos');
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

  const renderPhoto = ({ item }: { item: PhotoItem }) => {
    if(item.name == ".emptyFolderPlaceholder"){
      return null;
    }
    console.log('Affichage photo:', item.name, 'URL:', item.url);
    
    return (
      <TouchableOpacity 
        style={styles.photoContainer}
        onPress={() => openPhotoDetail(item)}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: item.url }} 
          style={styles.photo}
          onError={(error) => {
            console.error('Erreur chargement image:', item.name, error.nativeEvent.error);
          }}
          onLoad={() => {
            console.log('Image chargée avec succès:', item.name);
          }}
        />
        <Text style={styles.photoDate}>
          {item.metadata?.animal_type || 'Incertain'}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Chargement des photos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {photos.length === 0 ? (
        <View style={styles.centerContainer}>
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
            numColumns={3}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 10,
  },
  photoContainer: {
    width: itemSize,
    margin: 5,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  photo: {
    width: itemSize,
    height: itemSize,
    resizeMode: 'cover',
  },
  photoDate: {
    padding: 8,
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});