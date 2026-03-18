import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [isOffcanvasVisible, setIsOffcanvasVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(width));
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    requestPermissions();
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserInfo(user);
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        const cameraGranted = granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
        const storageGranted = granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED || 
                              granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;

        if (!cameraGranted || !storageGranted) {
          Alert.alert(
            'Permissions requises',
            'L\'application a besoin d\'accéder à la caméra et aux photos pour fonctionner correctement.',
            [
              { text: 'OK' }
            ]
          );
        }
      } catch {
        // Erreur de permissions silencieuse
      }
    }
  };

  const openOffcanvas = () => {
    setIsOffcanvasVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeOffcanvas = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsOffcanvasVisible(false);
    });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Erreur', 'Impossible de se déconnecter');
    else closeOffcanvas();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenue dans Catspot</Text>
        <TouchableOpacity onPress={openOffcanvas} style={styles.profileButton}>
          <Icon name="person-circle-outline" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Capturez et organisez vos moments précieux
        </Text>
        <Text style={styles.description}>
          Utilisez les onglets en bas pour naviguer entre la caméra et votre galerie de photos.
        </Text>
      </View>

      <Modal
        visible={isOffcanvasVisible}
        transparent
        animationType="none"
        onRequestClose={closeOffcanvas}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={closeOffcanvas}
        >
          <Animated.View 
            style={[styles.offcanvas, { transform: [{ translateX: slideAnim }] }]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.offcanvasHeader}>
                <TouchableOpacity onPress={closeOffcanvas} style={styles.closeButton}>
                  <Icon name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.offcanvasTitle}>Profil</Text>
              </View>
              
              <View style={styles.userInfo}>
                <Icon name="person-circle" size={80} color="#0A84FF" />
                <Text style={styles.userEmail}>{userInfo?.email}</Text>
                <Text style={styles.userDate}>
                  Membre depuis {userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString('fr-FR') : ''}
                </Text>
              </View>
              
              <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                <Icon name="log-out-outline" size={20} color="#FF3B30" />
                <Text style={styles.logoutText}>Se déconnecter</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  offcanvas: {
    width: width * 0.8,
    backgroundColor: '#1C1C1E',
    height: '100%',
    paddingTop: 50,
  },
  offcanvasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  closeButton: {
    padding: 5,
    marginRight: 15,
  },
  offcanvasTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    alignItems: 'center',
    padding: 30,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 15,
  },
  userDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
});