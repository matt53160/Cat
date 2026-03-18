import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';
import UploadingScreen from '../components/UploadingScreen';
import { aiAnalysisService } from '../services/aiAnalysisService';
import { photoMetadataService } from '../services/photoMetadataService';
import { colors } from '../theme/colors';

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];

export default function CameraScreen({ navigation }: any) {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const camera = useRef<Camera>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [processingStep, setProcessingStep] = useState<'uploading' | 'analyzing' | 'saving' | 'success' | 'error'>('uploading');

  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const validateFile = async (imageUri: string): Promise<{ valid: boolean; error?: string }> => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      if (blob.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return { valid: false, error: `La photo dépasse la taille maximale de ${MAX_FILE_SIZE_MB} Mo` };
      }

      if (blob.type && !ALLOWED_MIME_TYPES.includes(blob.type)) {
        return { valid: false, error: 'Format de fichier non supporté. Utilisez JPEG, PNG ou HEIC.' };
      }

      return { valid: true };
    } catch {
      return { valid: false, error: 'Impossible de lire le fichier' };
    }
  };

  const uploadImageToSupabase = async (imageUri: string, fileName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { message: 'Utilisateur non connecté' };
      }

      const validation = await validateFile(imageUri);
      if (!validation.valid) {
        return { message: validation.error };
      }

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: fileName,
      } as any);

      const userFolder = user.email || user.id;
      const filePath = `user-photos/${userFolder}/${fileName}`;

      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        return { message: 'Session expirée, veuillez vous reconnecter' };
      }

      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/photos/${filePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': SUPABASE_ANON_KEY,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        return { message: 'Erreur lors de l\'envoi de la photo' };
      }

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      return { filePath, publicUrl: urlData.publicUrl };
    } catch {
      return { message: 'Erreur réseau, vérifiez votre connexion' };
    }
  };

  const processPhotoWithAI = async (imageUri: string, fileName: string) => {
    const startTime = Date.now();

    try {
      setIsProcessing(true);

      if (!aiAnalysisService.isConfigured()) {
        Alert.alert(
          'Configuration manquante',
          'L\'API OpenAI n\'est pas configurée. La photo sera sauvegardée sans analyse IA.\n\nVeuillez configurer votre clé API dans le fichier .env',
          [{ text: 'OK' }]
        );

        setProcessingStep('uploading');
        setProcessingMessage('Sauvegarde sans analyse IA...');

        const uploadResult = await uploadImageToSupabase(imageUri, fileName);
        if (uploadResult.message) {
          throw new Error(uploadResult.message);
        }

        setProcessingStep('success');
        setProcessingMessage('Photo sauvegardée !');

        setTimeout(() => {
          setIsProcessing(false);
          Alert.alert('Photo sauvegardée', 'Votre photo a été sauvegardée sans analyse IA.');
        }, 1500);
        return;
      }

      setProcessingStep('uploading');
      setProcessingMessage('Envoi de votre photo...');

      const uploadResult = await uploadImageToSupabase(imageUri, fileName);
      if (uploadResult.message) {
        throw new Error(uploadResult.message);
      }

      setProcessingStep('analyzing');
      setProcessingMessage('Analyse de l\'animal avec l\'IA...');

      const aiResult = await aiAnalysisService.analyzeImage(imageUri);

      if (!aiResult.success) {
        throw new Error(aiResult.error || 'Erreur d\'analyse IA');
      }

      setProcessingStep('saving');
      setProcessingMessage('Sauvegarde des informations...');

      const processingTime = Date.now() - startTime;
      await photoMetadataService.savePhotoMetadata(
        uploadResult.filePath,
        uploadResult.publicUrl,
        aiResult,
        processingTime
      );

      setProcessingStep('success');

      if (!aiResult.hasAnimal) {
        setProcessingMessage('Aucun animal détecté dans cette photo.');
        setTimeout(() => {
          setIsProcessing(false);
          Alert.alert(
            'Photo sauvegardée',
            'Votre photo a été sauvegardée, mais aucun animal n\'a été détecté.',
            [{ text: 'OK' }]
          );
        }, 2000);
      } else {
        const animalInfo = aiResult.data;
        setProcessingMessage(
          `${animalInfo.animal_type} détecté ! ${animalInfo.primary_color}${animalInfo.coat_pattern ? ', ' + animalInfo.coat_pattern : ''}`
        );

        setTimeout(() => {
          setIsProcessing(false);
          Alert.alert(
            'Animal détecté ! 🎉',
            `Type: ${animalInfo.animal_type}\nCouleur: ${animalInfo.primary_color}\nMotif: ${animalInfo.coat_pattern || 'Non défini'}${animalInfo.breed != "null" ? `\nRace: ${animalInfo.breed}` : `\nRace: Incertain`}`,
            [
              { text: 'Voir la galerie', onPress: () => navigation.navigate('Gallery') },
              { text: 'OK' }
            ]
          );
        }, 2000);
      }

    } catch (error) {
      setProcessingStep('error');
      setProcessingMessage('Une erreur est survenue');

      setTimeout(() => {
        setIsProcessing(false);
        Alert.alert('Oups !', 'Une erreur est survenue lors du traitement de la photo.');
      }, 2000);
    }
  };

  const takePhoto = async () => {
    if (camera.current && !isCapturing && !isProcessing) {
      setIsCapturing(true);
      try {
        const photo = await camera.current.takePhoto({
          flash: 'off',
        });

        setIsCapturing(false);

        const fileName = `${Date.now()}.jpg`;
        await processPhotoWithAI(`file://${photo.path}`, fileName);

      } catch (error) {
        setIsCapturing(false);
        setIsProcessing(false);
        Alert.alert('Oups !', 'Impossible de prendre la photo');
      }
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      const permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
      const hasPermission = await PermissionsAndroid.check(permission);

      if (hasPermission) {
        return true;
      }

      const status = await PermissionsAndroid.request(permission, {
        title: 'Accès aux photos',
        message: 'Cette application a besoin d\'accéder à vos photos pour les importer.',
        buttonNeutral: 'Plus tard',
        buttonNegative: 'Annuler',
        buttonPositive: 'OK',
      });

      return status === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestStoragePermission();

    if (!hasPermission) {
      Alert.alert(
        'Permission requise',
        'L\'accès aux photos est nécessaire pour importer une image.',
        [
          { text: 'Annuler' },
          { text: 'Paramètres', onPress: () => PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES) }
        ]
      );
      return;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        if (response.errorMessage) {
          Alert.alert('Oups !', 'Impossible de sélectionner la photo');
        }
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          try {
            const fileName = `imported_${Date.now()}.jpg`;
            await processPhotoWithAI(asset.uri, fileName);
          } catch (error) {
            Alert.alert('Oups !', 'Impossible d\'importer la photo');
          }
        }
      }
    });
  };

  // No permission or no device view
  if (!hasPermission || !device) {
    return (
      <SafeAreaView style={styles.fallbackContainer}>
        <View style={styles.fallbackContent}>
          <View style={styles.fallbackIcon}>
            <Text style={styles.fallbackEmoji}>{!hasPermission ? '📷' : '🔍'}</Text>
          </View>
          <Text style={styles.fallbackTitle}>
            {!hasPermission ? 'Autorisation requise' : 'Aucune caméra disponible'}
          </Text>
          <Text style={styles.fallbackSubtext}>
            Vous pouvez importer des photos depuis votre galerie
          </Text>
          <TouchableOpacity
            style={styles.importButtonLarge}
            onPress={pickImage}
            disabled={isCapturing || isProcessing}
          >
            <Text style={styles.importEmoji}>🖼️</Text>
            <Text style={styles.importButtonText}>Importer une photo</Text>
          </TouchableOpacity>
        </View>

        <UploadingScreen
          visible={isProcessing}
          message={processingMessage}
          step={processingStep}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={pickImage}
          disabled={isCapturing}
        >
          <Icon name="images-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.captureWrapper}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePhoto}
            disabled={isCapturing || isProcessing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </View>

      <UploadingScreen
        visible={isProcessing}
        message={processingMessage}
        step={processingStep}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  fallbackContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fallbackIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  fallbackEmoji: {
    fontSize: 44,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  fallbackSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  importButtonLarge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: colors.goldDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  importEmoji: {
    fontSize: 20,
  },
  importButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  topBar: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  topButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  captureWrapper: {
    padding: 4,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  captureButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
});
