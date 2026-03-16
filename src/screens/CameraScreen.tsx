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
import { supabase } from '../lib/supabase';
import UploadingScreen from '../components/UploadingScreen';
import { aiAnalysisService } from '../services/aiAnalysisService';
import { photoMetadataService } from '../services/photoMetadataService';

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

  const uploadImageToSupabase = async (imageUri: string, fileName: string) => {
    try {
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { message: 'Utilisateur non connecté' };
      }

      // Pour Android, on doit créer un FormData au lieu d'un blob
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: fileName,
      } as any);

      // Créer le chemin avec l'email de l'utilisateur
      const userFolder = user.email || user.id;
      const filePath = `user-photos/${userFolder}/${fileName}`;

      // Utiliser fetch directement avec l'API Supabase Storage
      const supabaseUrl = 'https://jglrgibqrjxzvcornaxg.supabase.co';
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnbHJnaWJxcmp4enZjb3JuYXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjI2MDgsImV4cCI6MjA3Mjk5ODYwOH0.nnOg96INLLv1kbRKKBdAUl-fTtP3oDBVcsVudCLECqY';
      
      console.log(`Upload vers: ${filePath}`);
      
      const response = await fetch(
        `${supabaseUrl}/storage/v1/object/photos/${filePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'apikey': supabaseAnonKey,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur réponse Supabase:', errorText);
        return { message: `Erreur HTTP ${response.status}: ${errorText}` };
      }

      console.log('Photo uploadée avec succès dans:', filePath);
      
      // Générer l'URL publique
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      return { filePath, publicUrl: urlData.publicUrl };
    } catch (uploadError) {
      console.error('Erreur lors de l\'upload:', uploadError);
      return { message: `Erreur réseau: ${uploadError.message || 'Vérifiez votre connexion'}` };
    }
  };

  const processPhotoWithAI = async (imageUri: string, fileName: string) => {
    const startTime = Date.now();
    
    try {
      setIsProcessing(true);
      
      // Vérifier la configuration de l'API
      if (!aiAnalysisService.isConfigured()) {
        Alert.alert(
          '⚠️ Configuration manquante',
          'L\'API OpenAI n\'est pas configurée. La photo sera sauvegardée sans analyse IA.\n\nVeuillez configurer votre clé API dans src/config/apiConfig.ts',
          [{ text: 'OK' }]
        );
        
        // Sauvegarder sans analyse IA
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
      
      // Étape 1: Upload de l'image
      setProcessingStep('uploading');
      setProcessingMessage('Envoi de votre photo...');
      
      const uploadResult = await uploadImageToSupabase(imageUri, fileName);
      if (uploadResult.message) {
        throw new Error(uploadResult.message);
      }
      
      // Étape 2: Analyse IA
      setProcessingStep('analyzing');
      setProcessingMessage('Analyse de l\'animal avec l\'IA...');
      
      const aiResult = await aiAnalysisService.analyzeImage(imageUri);
      
      if (!aiResult.success) {
        throw new Error(aiResult.error || 'Erreur d\'analyse IA');
      }
      
      // Étape 3: Sauvegarde des métadonnées
      setProcessingStep('saving');
      setProcessingMessage('Sauvegarde des informations...');
      
      const processingTime = Date.now() - startTime;
      const metadataResult = await photoMetadataService.savePhotoMetadata(
        uploadResult.filePath,
        uploadResult.publicUrl,
        aiResult,
        processingTime
      );
      
      if (!metadataResult.success) {
        console.warn('Erreur sauvegarde métadonnées:', metadataResult.error);
        // On continue quand même car la photo est uploadée
      }
      
      // Étape 4: Succès
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
            '🐾 Animal détecté !', 
            `Type: ${animalInfo.animal_type}\nCouleur: ${animalInfo.primary_color}\nMotif: ${animalInfo.coat_pattern || 'Non défini'}${animalInfo.breed != "null" ? `\nRace: ${animalInfo.breed }` :  `\nRace: Incertain`}`,
            [
              { text: 'Voir la galerie', onPress: () => navigation.navigate('Gallery') },
              { text: 'OK' }
            ]
          );
        }, 2000);
      }
      
    } catch (error) {
      console.error('Erreur processus complet:', error);
      setProcessingStep('error');
      setProcessingMessage(error.message || 'Une erreur est survenue');
      
      setTimeout(() => {
        setIsProcessing(false);
        Alert.alert('Erreur', error.message || 'Une erreur est survenue lors du traitement');
      }, 2000);
    }
  };

  const takePhoto = async () => {
    if (camera.current && !isCapturing && !isProcessing) {
      setIsCapturing(true);
      try {
        console.log('Prise de photo en cours...');
        const photo = await camera.current.takePhoto({
          flash: 'off',
        });
        
        setIsCapturing(false);
        
        const fileName = `${Date.now()}.jpg`;
        await processPhotoWithAI(`file://${photo.path}`, fileName);
        
      } catch (error) {
        setIsCapturing(false);
        setIsProcessing(false);
        Alert.alert('Erreur', 'Impossible de prendre la photo');
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
    return true; // iOS gère les permissions automatiquement
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
          Alert.alert('Erreur', response.errorMessage);
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
            Alert.alert('Erreur', 'Impossible d\'importer la photo');
          }
        }
      }
    });
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Icon name="camera-outline" size={80} color="#8E8E93" />
        <Text style={styles.permissionText}>Autorisation de la caméra requise</Text>
        <Text style={styles.permissionSubtext}>
          Vous pouvez importer des photos depuis votre galerie
        </Text>
        <TouchableOpacity
          style={styles.importButton}
          onPress={pickImage}
          disabled={isCapturing || isProcessing}
        >
          <Icon name="images-outline" size={24} color="white" />
          <Text style={styles.importButtonText}>Importer une photo</Text>
        </TouchableOpacity>
        
        <UploadingScreen 
          visible={isProcessing} 
          message={processingMessage}
          step={processingStep}
        />
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Icon name="camera-off-outline" size={80} color="#8E8E93" />
        <Text style={styles.permissionText}>Aucune caméra disponible</Text>
        <Text style={styles.permissionSubtext}>
          Vous pouvez importer des photos depuis votre galerie
        </Text>
        <TouchableOpacity
          style={styles.importButton}
          onPress={pickImage}
          disabled={isCapturing || isProcessing}
        >
          <Icon name="images-outline" size={24} color="white" />
          <Text style={styles.importButtonText}>Importer une photo</Text>
        </TouchableOpacity>
        
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
      <View style={styles.topButtonContainer}>
        <TouchableOpacity
          style={styles.importButtonSmall}
          onPress={pickImage}
          disabled={isCapturing}
        >
          <Icon name="images-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={takePhoto}
          disabled={isCapturing || isProcessing}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  topButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
  },
  importButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  importButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  importButtonSmall: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
});