import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../lib/supabase';
import { photoMetadataService } from '../services/photoMetadataService';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalAnimals: 0,
    animalTypes: {} as { [key: string]: number },
    favoritePhotos: 0,
  });

  useEffect(() => {
    getUserInfo();
    loadStats();
  }, []);

  const getUserInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserInfo(user);
  };

  const loadStats = async () => {
    const result = await photoMetadataService.getPhotoStatistics();
    setStats(result);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Oups !', 'Impossible de se déconnecter');
  };

  const getAnimalEmoji = (type: string) => {
    const emojis: { [key: string]: string } = {
      chat: '🐱', chien: '🐶', oiseau: '🐦', lapin: '🐰',
      hamster: '🐹', poisson: '🐟', tortue: '🐢', serpent: '🐍',
    };
    return emojis[type.toLowerCase()] || '🐾';
  };

  const topAnimals = Object.entries(stats.animalTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour ! 👋</Text>
            <Text style={styles.userName}>{userInfo?.email?.split('@')[0] || 'Explorateur'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBubble} onPress={signOut}>
            <Icon name="log-out-outline" size={20} color={colors.red} />
          </TouchableOpacity>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>🐱</Text>
          </View>
          <Text style={styles.profileName}>{userInfo?.email?.split('@')[0] || 'Explorateur'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {stats.totalPhotos === 0 ? 'Nouveau membre' :
               stats.totalPhotos < 5 ? 'Apprenti observateur' :
               stats.totalPhotos < 15 ? 'Observateur confirmé' :
               'Expert animalier'}
            </Text>
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalPhotos}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalAnimals}</Text>
              <Text style={styles.statLabel}>Animaux</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Object.keys(stats.animalTypes).length}</Text>
              <Text style={styles.statLabel}>Espèces</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.favoritePhotos}</Text>
              <Text style={styles.statLabel}>Favoris</Text>
            </View>
          </View>
        </View>

        {/* Discovered animals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Animaux repérés</Text>
          {topAnimals.length > 0 ? (
            <View style={styles.animalsGrid}>
              {topAnimals.map(([type, count]) => (
                <View key={type} style={styles.animalCard}>
                  <Text style={styles.animalEmoji}>{getAnimalEmoji(type)}</Text>
                  <Text style={styles.animalType}>{type}</Text>
                  <Text style={styles.animalCount}>{count}x</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📸</Text>
              <Text style={styles.emptyText}>Prenez votre première photo !</Text>
              <Text style={styles.emptySubtext}>
                Utilisez l'onglet Caméra pour commencer
              </Text>
            </View>
          )}
        </View>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.greenLight }]}
              onPress={() => navigation.navigate('Camera')}
            >
              <Text style={styles.actionEmoji}>📷</Text>
              <Text style={styles.actionText}>Prendre une photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.purpleLight }]}
              onPress={() => navigation.navigate('Gallery')}
            >
              <Text style={styles.actionEmoji}>🖼️</Text>
              <Text style={styles.actionText}>Voir la galerie</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Member info */}
        <View style={styles.memberInfo}>
          <Icon name="calendar-outline" size={14} color={colors.textLight} />
          <Text style={styles.memberText}>
            Membre depuis {userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textTransform: 'capitalize',
  },
  logoutBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.pinkLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.pink,
  },
  profileCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: colors.gold,
  },
  avatarEmoji: {
    fontSize: 38,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: colors.bgCardAlt,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.goldLight,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.goldDark,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  animalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  animalCard: {
    width: (width - 70) / 4,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  animalEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  animalType: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  animalCount: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  memberText: {
    fontSize: 12,
    color: colors.textLight,
  },
});
