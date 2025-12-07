import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, ActivityIndicator, RefreshControl, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { theme } from '../styles/theme';
import { ScreenHeader } from '../components/ScreenHeader';

const { height, width } = Dimensions.get('window');

interface Proof {
  id: number;
  user_id: number;
  username: string;
  profile_photo?: string;
  photo_url?: string;
  description?: string;
  task_title?: string;
  created_at?: string;
  likes_count?: number;
}

export default function ExploreScreen({ navigation }: any) {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProofs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.proofs.getProofs(50, 0);
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setProofs(shuffled);
    } catch (error) {
      console.error('Explore load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProofs();
  }, [loadProofs]);

  const renderItem = ({ item }: { item: Proof }) => (
    <View style={styles.card}>
      {item.photo_url ? (
        <Image source={{ uri: item.photo_url }} style={styles.media} resizeMode="cover" />
      ) : (
        <LinearGradient colors={[theme.colors.accent, theme.colors.primary]} style={styles.mediaPlaceholder} />
      )}
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.75)"]}
        locations={[0.4, 1]}
        style={styles.overlay}
      >
        <View style={styles.userRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.user_id })}>
            <Image
              source={{ uri: item.profile_photo || 'https://i.pravatar.cc/120' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.user_id })}>
            <Text style={styles.username}>@{item.username || 'creator'}</Text>
            <Text style={styles.taskTitle}>{item.task_title || 'Task'}</Text>
          </TouchableOpacity>
        </View>
        {item.description ? <Text style={styles.description} numberOfLines={2}>{item.description}</Text> : null}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Feed')}>
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Profile', { userId: item.user_id })}>
            <Ionicons name="person" size={24} color="#fff" />
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image 
          source={require('../../assets/commut.png')}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(20, 184, 166, 0.85)', 'rgba(13, 148, 136, 0.85)']}
          style={styles.headerOverlay}
        >
          <Text style={styles.headerTitle}>🔍 Explore</Text>
          <Text style={styles.headerSubtitle}>Discover creators and proofs</Text>
        </LinearGradient>
      </View>
      <FlatList
        data={proofs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProofs(); }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    position: 'relative',
    height: 160,
  },
  headerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  simpleHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  card: {
    width,
    height: height - 150,
    backgroundColor: '#111827',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  username: {
    color: theme.colors.primary,
    fontWeight: '700',
  } as any,
  taskTitle: {
    color: theme.colors.text.secondary,
    fontSize: 12,
  } as any,
  description: {
    color: theme.colors.primary,
    marginTop: 8,
  } as any,
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  } as any,
});
