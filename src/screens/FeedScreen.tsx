import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader } from '../components/ScreenHeader';
import api from '../services/api';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function FeedScreen({ navigation }: any) {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const data = await api.proofs.getProofs(20, 0);
      setProofs(data);
    } catch (error) {
      console.error('❌ Error loading feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLike = async (proofId: number, index: number) => {
    try {
      await api.proofs.likeProof(proofId);
      
      // Update local state
      const updated = [...proofs];
      const currentLikes = updated[index].likes_count || 0;
      updated[index].likes_count = currentLikes + 1;
      setProofs(updated);
    } catch (error) {
      console.error('❌ Error liking proof:', error);
    }
  };

  const handleShare = async (proofId: number, index: number) => {
    try {
      await api.proofs.shareProof(proofId);
      
      const updated = [...proofs];
      updated[index].shares_count = (updated[index].shares_count || 0) + 1;
      setProofs(updated);
    } catch (error) {
      console.error('❌ Error sharing proof:', error);
    }
  };

  const handleRepost = async (proofId: number, index: number) => {
    try {
      await api.proofs.repostProof(proofId);
      
      const updated = [...proofs];
      updated[index].reposts_count = (updated[index].reposts_count || 0) + 1;
      setProofs(updated);
    } catch (error) {
      console.error('❌ Error reposting proof:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading && proofs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Community Feed"
        subtitle="Top proofs from creators"
        iconName="heart"
        imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1000&h=400&fit=crop"
        colors={['rgba(236, 72, 153, 0.65)', 'rgba(168, 85, 247, 0.65)']}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadFeed} />
        }
      >
        {proofs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={80} color="#9CA3AF" />
            <Text style={styles.emptyText}>No proofs yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share!</Text>
          </View>
        ) : (
          proofs.map((proof, index) => (
            <View key={proof.id} style={styles.proofCard}>
              {/* User Header */}
              <View style={styles.proofHeader}>
                <TouchableOpacity 
                  style={styles.userInfo}
                  onPress={() => navigation.navigate('UserProfile', { userId: proof.user_id })}
                >
                  <Image
                    source={{ uri: proof.profile_photo || 'https://i.pravatar.cc/100' }}
                    style={styles.userAvatar}
                  />
                  <View>
                    <Text style={styles.username}>{proof.username}</Text>
                    <Text style={styles.taskTitle}>
                      {proof.task_title} • {proof.task_category}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Lv {proof.level}</Text>
                </View>
              </View>

              {/* Photo */}
              {proof.photo_url && (
                <Image
                  source={{ uri: proof.photo_url }}
                  style={styles.proofImage}
                  resizeMode="cover"
                />
              )}

              {/* Description */}
              {proof.description && (
                <Text style={styles.description}>{proof.description}</Text>
              )}

              {/* XP & Status */}
              <View style={styles.rewardBar}>
                <View style={styles.xpBadge}>
                  <Text style={styles.xpText}>+{proof.xp_earned} XP</Text>
                </View>
                <View style={[styles.statusBadge, proof.status === 'verified' ? styles.verified : styles.pending]}>
                  <Text style={styles.statusText}>
                    {proof.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => handleLike(proof.id, index)}
                >
                  <Ionicons name="heart-outline" size={24} color="#EF4444" />
                  <Text style={styles.actionText}>{proof.likes_count || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => handleShare(proof.id, index)}
                >
                  <Ionicons name="share-outline" size={24} color="#3B82F6" />
                  <Text style={styles.actionText}>{proof.shares_count || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => handleRepost(proof.id, index)}
                >
                  <Ionicons name="repeat-outline" size={24} color="#10B981" />
                  <Text style={styles.actionText}>{proof.reposts_count || 0}</Text>
                </TouchableOpacity>

                <Text style={styles.timeAgo}>{formatTimeAgo(proof.created_at)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  proofCard: {
    backgroundColor: '#FFF',
    marginBottom: 16,
    paddingBottom: 12,
  },
  proofHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  taskTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  levelBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  proofImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#E5E7EB',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    paddingHorizontal: 12,
    paddingTop: 12,
    lineHeight: 20,
  },
  rewardBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  xpBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verified: {
    backgroundColor: '#D1FAE5',
  },
  pending: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeAgo: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#9CA3AF',
  },
});
