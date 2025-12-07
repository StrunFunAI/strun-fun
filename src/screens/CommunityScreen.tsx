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
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';
import api from '../services/api';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function CommunityScreen({ navigation }: any) {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [votedProofs, setVotedProofs] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const data = await api.proofs.getProofs(50, 0);
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
      const result = await api.vote.voteProof(proofId);
      
      const updated = [...proofs];
      updated[index].vote_count = result.vote_count;
      setProofs(updated);

      // Update voted state
      const newVoted = new Set(votedProofs);
      if (result.voted) {
        newVoted.add(proofId);
      } else {
        newVoted.delete(proofId);
      }
      setVotedProofs(newVoted);
    } catch (error: any) {
      console.error('❌ Error voting proof:', error);
      if (error?.response?.data?.error) {
        Alert.alert('Error', error.response.data.error);
      }
    }
  };

  const handleShare = async (proof: any, index: number) => {
    try {
      const shareOptions = [
        { text: 'Share to X (Twitter)', icon: 'logo-twitter', color: '#1DA1F2', action: 'twitter' },
        { text: 'Share to Instagram', icon: 'logo-instagram', color: '#E4405F', action: 'instagram' },
        { text: 'Share to TikTok', icon: 'musical-notes', color: '#FF0050', action: 'tiktok' },
        { text: 'Share via...', icon: 'share-outline', color: '#8B5CF6', action: 'native' },
      ];

      Alert.alert(
        'Share Proof',
        'Choose where to share',
        [
          ...shareOptions.map(option => ({
            text: option.text,
            onPress: async () => {
              if (option.action === 'native') {
                // Native share
                await Share.share({
                  message: `Check out my ${proof.task_title} proof on STRUN! 🎯\\n\\nI earned ${proof.xp_earned || 0} XP completing this task.`,
                  url: proof.photo_url,
                });
              } else {
                // Deep link to social media
                const text = encodeURIComponent(`Check out my ${proof.task_title} proof on STRUN! 🎯`);
                let url = '';
                
                if (option.action === 'twitter') {
                  url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(proof.photo_url || '')}`;
                } else if (option.action === 'instagram') {
                  Alert.alert('Instagram', 'Please share manually from Instagram app');
                  return;
                } else if (option.action === 'tiktok') {
                  Alert.alert('TikTok', 'Please share manually from TikTok app');
                  return;
                }
                
                if (url) {
                  await Share.share({ url });
                }
              }
              
              // Update share count
              await api.proofs.shareProof(proof.id);
              const updated = [...proofs];
              updated[index].shares_count = (updated[index].shares_count || 0) + 1;
              setProofs(updated);
            },
          })),
          { text: 'Cancel', style: 'cancel' },
        ]
      );
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
      {/* Header */}
      <LinearGradient
        colors={['#FB923C', '#F97316']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🏆 Community</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
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
              <View style={styles.proofHeader}>
                <TouchableOpacity 
                  style={styles.userInfo}
                  onPress={() => navigation.navigate('Profile', { userId: proof.user_id })}
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

              {proof.video_url ? (
                <View style={styles.videoWrapper}>
                  <Video
                    source={{ uri: proof.video_url }}
                    style={styles.videoPlayer}
                    resizeMode="contain"
                    useNativeControls
                    shouldPlay={false}
                    isLooping
                  />
                </View>
              ) : proof.photo_url ? (
                <Image
                  source={{ uri: proof.photo_url }}
                  style={styles.proofImage}
                  resizeMode="cover"
                />
              ) : null}

              {proof.description && (
                <Text style={styles.description}>{proof.description}</Text>
              )}

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

              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.actionBtn, votedProofs.has(proof.id) && styles.actionBtnActive]}
                  onPress={() => handleLike(proof.id, index)}
                >
                  <Ionicons 
                    name={votedProofs.has(proof.id) ? "heart" : "heart-outline"} 
                    size={24} 
                    color={votedProofs.has(proof.id) ? "#EF4444" : "#9CA3AF"} 
                  />
                  <Text style={[styles.actionText, votedProofs.has(proof.id) && styles.actionTextActive]}>
                    {proof.vote_count || 0} votes
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => handleShare(proof, index)}
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
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  proofCard: {
    backgroundColor: theme.colors.cardBg,
    marginBottom: 16,
    paddingBottom: 12,
    borderRadius: theme.borderRadius.xl,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  taskTitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  levelBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  proofImage: {
    width: '100%',
    height: 320,
    backgroundColor: theme.colors.cardBgLight,
    borderRadius: theme.borderRadius.lg,
    marginTop: 8,
  },
  videoWrapper: {
    width: '100%',
    backgroundColor: '#0B1021',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  videoPlayer: {
    width: '100%',
    height: 280,
    backgroundColor: '#0B1021',
  },
  description: {
    fontSize: 15,
    color: theme.colors.text.primary,
    paddingHorizontal: 12,
    paddingTop: 12,
    lineHeight: 22,
  },
  rewardBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  xpBadge: {
    backgroundColor: 'rgba(255, 184, 108, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  xpText: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  verified: {
    backgroundColor: 'rgba(0, 224, 184, 0.15)',
  },
  pending: {
    backgroundColor: 'rgba(255, 94, 126, 0.15)',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.primary,
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
  actionBtnActive: {
    opacity: 1,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  actionTextActive: {
    color: theme.colors.accent,
  },
  timeAgo: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#9CA3AF',
  },
});
