import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { solanaWallet } from '../services/solanaWallet';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { WalletModal } from '../components/WalletModal';
import { theme } from '../styles/theme';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation, route }: any) {
  const { user: authUser, signOut } = useAuth();
  const viewedUserId = route?.params?.userId;
  const [profile, setProfile] = useState<any>(null);
  const [recentProofs, setRecentProofs] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [walletAddressText, setWalletAddressText] = useState<string>(authUser?.walletAddress ?? '');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletModalMode, setWalletModalMode] = useState<'send' | 'deposit'>('send');

  useEffect(() => {
    loadWalletBalance();
    loadProfileData();
  }, []);

  useEffect(() => {
    if (viewedUserId) {
      loadProfileData(viewedUserId);
    }
  }, [viewedUserId]);

  useEffect(() => {
    let isSubscribed = true;
    const resolveWalletAddress = async () => {
      try {
        console.log('🔍 Resolving wallet address...');
        
        // Ensure user has a wallet
        const wallet = await solanaWallet.ensureUserWallet();
        console.log('📍 Got wallet:', wallet.publicKey);
        
        if (isSubscribed) {
          setWalletAddressText(wallet.publicKey);
          console.log('✅ Wallet address set:', wallet.publicKey);
        }
      } catch (error) {
        console.error('❌ Error resolving wallet address:', error);
        // Still set something so UI isn't empty
        if (isSubscribed && authUser?.walletAddress) {
          setWalletAddressText(authUser.walletAddress);
        }
      }
    };

    resolveWalletAddress();
    return () => {
      isSubscribed = false;
    };
  }, [authUser?.walletAddress]);

  const loadWalletBalance = async () => {
    try {
      console.log('🏃 Loading wallet balance...');
      const balance = await solanaWallet.getBalance();
      console.log('💰 Got balance:', balance);
      setWalletBalance(balance);
    } catch (error) {
      console.error('❌ Error loading balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const loadProfileData = async (userId?: number) => {
    try {
      setLoadingProfile(true);
      // Always get current user's profile first
      let currentUserProfile = authUser?.id ? await api.users.getProfile() : null;
      
      // If userId is provided and it's different, get that user's profile
      const targetUserId = userId && userId !== currentUserProfile?.id ? userId : undefined;
      const profileData = targetUserId 
        ? await api.users.getUserById(targetUserId) 
        : (currentUserProfile || await api.users.getProfile());
      
      setProfile(profileData);

      try {
        const proofs = await api.proofs.getProofs(40, 0);
        const filtered = proofs.filter((p: any) => `${p.user_id}` === `${profileData?.id}`);
        setRecentProofs(filtered);
      } catch (proofErr) {
        console.error('Error loading user proofs:', proofErr);
        setRecentProofs(profileData?.recentProofs || []);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  }

  const copyWalletAddress = async () => {
    try {
      const fallbackWallet = walletAddressText || authUser?.walletAddress;
      let address = fallbackWallet;

      if (!address) {
        const wallet = await solanaWallet.ensureUserWallet();
        address = wallet.publicKey;
        setWalletAddressText(wallet.publicKey);
      }

      if (!address) {
        Alert.alert('Wallet', 'Wallet address is not ready yet.');
        return;
      }

      if (Platform.OS === 'web') {
        const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
        if (nav?.clipboard?.writeText) {
          await nav.clipboard.writeText(address);
        } else {
          await Clipboard.setStringAsync(address);
        }
      } else {
        await Clipboard.setStringAsync(address);
      }

      Alert.alert('Copied!', 'Wallet address copied to clipboard');
    } catch (error) {
      console.error('Clipboard copy error:', error);
      Alert.alert('Oops', 'Failed to copy the wallet address.');
    }
  };

  const openSocialLink = async (platform: string, url: string) => {
    if (!url) return;
    
    let finalUrl = url;
    
    // URL formatını düzelt
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      switch (platform) {
        case 'instagram':
          finalUrl = `https://instagram.com/${url.replace('@', '')}`;
          break;
        case 'twitter':
          finalUrl = `https://twitter.com/${url.replace('@', '')}`;
          break;
        case 'linkedin':
          // LinkedIn için tam URL gerekli
          if (url.includes('linkedin.com')) {
            finalUrl = url.startsWith('http') ? url : `https://${url}`;
          } else {
            finalUrl = `https://linkedin.com/in/${url}`;
          }
          break;
      }
    }
    
    try {
      const canOpen = await Linking.canOpenURL(finalUrl);
      if (canOpen) {
        await Linking.openURL(finalUrl);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const handleAirdrop = async () => {
    try {
      // Direkt faucet linkini aç
      await Linking.openURL('https://faucet.solana.com/');
    } catch (error) {
      console.error('Error opening faucet:', error);
      Alert.alert('Error', 'Could not open Solana faucet');
    }
  };

  const isOwnProfile = !viewedUserId || profile?.id === authUser?.id;

  const displayName = profile?.username || authUser?.name || authUser?.email?.split('@')[0] || 'Runner';
  const displayUsername = profile?.username || authUser?.email?.split('@')[0] || 'runner';
  const displayAvatar = profile?.profile_photo || authUser?.picture || 'https://i.pravatar.cc/300?img=8';
  const displayBio = profile?.bio || '🏃 Fitness & Content Creator\n📍 Istanbul\n🎯 Level 12 | 1420 XP';

  const stats = {
    level: profile?.level ?? 1,
    tasksCompleted: profile?.verified_proofs ?? 0,
    totalSOL: profile?.total_sol ?? walletBalance,
    followers: profile?.followers ?? 0,
    following: profile?.following ?? 0,
  };

  // Get badges from backend API response
  const badgesFromApi = profile?.badges || [];
  const displayBadges = badgesFromApi.length > 0 
    ? badgesFromApi.map((badge: any) => ({
        id: badge.id,
        name: badge.name,
        icon: badge.icon,
        category: badge.category,
        earned: badge.earned,
        earnedAt: badge.earnedAt,
      }))
    : [];

  const fallbackPosts = [
    { id: '1', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300' },
    { id: '2', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300' },
    { id: '3', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300' },
    { id: '4', image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=300' },
    { id: '5', image: 'https://images.unsplash.com/photo-1441986380878-c4248f5b8b5b?w=300' },
    { id: '6', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300' },
  ];

  const posts = recentProofs.length
    ? recentProofs.map((proof) => ({
        id: proof.id,
        image: proof.photo_url || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300',
      }))
    : fallbackPosts;

  if (loadingProfile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
      {/* Cover & Avatar */}
      <View style={styles.coverSection}>
        {profile?.cover_photo_url ? (
          <Image 
            source={{ uri: profile.cover_photo_url }} 
            style={styles.cover}
          />
        ) : (
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            style={styles.cover}
          />
        )}
        <Image source={{ uri: displayAvatar }} style={styles.avatar} />
      </View>

      {/* User Info */}
      <View style={styles.infoSection}>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.username}>@{displayUsername}</Text>
        <Text style={styles.bio}>{displayBio}</Text>

        {/* Social Media Links */}
        {(profile?.instagram_url || profile?.twitter_url || profile?.linkedin_url) && (
          <View style={styles.socialLinks}>
            {profile?.instagram_url && (
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => openSocialLink('instagram', profile.instagram_url || '')}
              >
                <Ionicons name="logo-instagram" size={20} color="#E4405F" />
              </TouchableOpacity>
            )}
            {profile?.twitter_url && (
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => openSocialLink('twitter', profile.twitter_url || '')}
              >
                <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
              </TouchableOpacity>
            )}
            {profile?.linkedin_url && (
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => openSocialLink('linkedin', profile.linkedin_url || '')}
              >
                <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Action Buttons */}
        {isOwnProfile ? (
          <View style={styles.actionButtons}>
            <Button
              title="Edit Profile"
              onPress={() => navigation.navigate('EditProfile')}
              gradient
              fullWidth
            />
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('MyTasks')}
            >
              <Ionicons name="list" size={24} color="#8B5CF6" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('AccountSettings')}
            >
              <Ionicons name="settings" size={24} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <Button
              title="Follow"
              onPress={() => Alert.alert('Follow', 'Follow functionality coming soon')}
              gradient
              fullWidth
            />
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => Alert.alert('Message', 'Messaging coming soon!')}
            >
              <Ionicons name="chatbubble" size={24} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>Level {stats.level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.tasksCompleted}</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>◎ {stats.totalSOL}</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
      </View>

      <View style={styles.followSection}>
        <TouchableOpacity style={styles.followItem}>
          <Text style={styles.followValue}>{stats.followers}</Text>
          <Text style={styles.followLabel}>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.followItem}>
          <Text style={styles.followValue}>{stats.following}</Text>
          <Text style={styles.followLabel}>Following</Text>
        </TouchableOpacity>
      </View>

        {/* Wallet Section */}
        {isOwnProfile && walletAddressText && (
          <View style={styles.walletContainer}>
            <View style={styles.walletHeaderRow}>
              <Ionicons name="wallet" size={20} color="#3B82F6" />
              <Text style={styles.walletSectionTitle}>Solana Wallet (Devnet)</Text>
            </View>
            
            {/* Balance Display */}
            <View style={styles.balanceDisplay}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceAmount}>◎ {walletBalance.toFixed(4)} SOL</Text>
            </View>
            
            <View style={styles.walletBox}>
              <Text style={styles.walletAddrText}>
                {walletAddressText.substring(0, 10)}...{walletAddressText.substring(walletAddressText.length - 10)}
              </Text>
              <TouchableOpacity onPress={copyWalletAddress}>
                <Ionicons name="copy" size={18} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            
            {/* Wallet Action Buttons */}
            <View style={styles.walletActions}>
              <TouchableOpacity 
                style={styles.walletActionButton}
                onPress={handleAirdrop}
              >
                <Ionicons name="gift" size={20} color="#F59E0B" />
                <Text style={styles.walletActionText}>Get 1 SOL</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.walletActionButton}
                onPress={() => {
                  setWalletModalMode('send');
                  setShowWalletModal(true);
                }}
              >
                <Ionicons name="arrow-up" size={20} color="#3B82F6" />
                <Text style={styles.walletActionText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      {/* Badges */}
      {displayBadges.length > 0 && (
        <View style={styles.badgesSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <Text style={styles.badgeCount}>
              {displayBadges.filter((b: any) => b.earned).length}/{displayBadges.length}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesList}>
            {displayBadges.map((badge: any) => (
              <View
                key={badge.id}
                style={[
                  styles.badgeCard,
                  !badge.earned && styles.badgeCardLocked,
                ]}
              >
                <Text style={styles.badgeEmoji}>{badge.icon || '🎖️'}</Text>
                <Text style={styles.badgeName} numberOfLines={2}>
                  {badge.name}
                </Text>
                {badge.earned && badge.earnedAt && (
                  <Text style={styles.badgeDate}>
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, styles.tabActive]}>
          <Ionicons name="grid" size={20} color="#8B5CF6" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="list" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="bookmark" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Posts Grid */}
      <View style={styles.postsGrid}>
        {posts.map((post) => (
          <TouchableOpacity key={post.id} style={styles.postItem}>
            <Image source={{ uri: post.image }} style={styles.postImage} />
            <View style={styles.postOverlay}>
              <View style={styles.postStats}>
                <Ionicons name="arrow-up" size={16} color="#fff" />
                <Text style={styles.postStatText}>124</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Wallet Section removed - using top wallet card only */}
      {isOwnProfile && false && (
        <View style={styles.walletSection}>
        <View style={styles.walletHeader}>
          <Text style={styles.sectionTitle}>Wallet</Text>
          <TouchableOpacity onPress={loadWalletBalance}>
            <Ionicons name="refresh" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.walletCard}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.walletGradient}
          >
            <View style={styles.walletTop}>
              <Text style={styles.walletLabel}>Total Balance</Text>
              <Ionicons name="wallet" size={24} color="#fff" />
            </View>
            {loadingBalance ? (
              <ActivityIndicator size="small" color="#fff" style={{ marginVertical: 10 }} />
            ) : (
              <Text style={styles.walletBalance}>◎ {stats.totalSOL.toFixed(4)}</Text>
            )}
            <TouchableOpacity
              style={styles.copyRow}
              onPress={copyWalletAddress}
              disabled={!walletAddressText}
            >
              <View>
                <Text style={styles.walletAddress}>
                  {walletAddressText
                    ? `${walletAddressText.slice(0, 6)}...${walletAddressText.slice(-6)}`
                    : 'Loading wallet...'}
                </Text>
                <Text style={styles.copyHint}>Tap to copy your address</Text>
              </View>
              <View style={styles.copyBadge}>
                <Ionicons name="copy" size={18} color="#fff" />
                <Text style={styles.copyHint}>Copy</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.walletActions}>
          <TouchableOpacity style={styles.walletActionButton}>
            <Ionicons name="arrow-down" size={20} color="#10B981" />
            <Text style={styles.walletActionText}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.walletActionButton}>
            <Ionicons name="arrow-up" size={20} color="#EF4444" />
            <Text style={styles.walletActionText}>Send</Text>
          </TouchableOpacity>
        </View>
        </View>
      )}

      {/* Logout Button */}
      {isOwnProfile && (
        <View style={{ padding: 20 }}>
          <Button
            title="Log Out"
            onPress={() => {
              Alert.alert(
                'Log Out',
                'Are you sure you want to log out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Log Out', 
                    style: 'destructive', 
                    onPress: async () => {
                      await signOut();
                      navigation.replace('Login');
                    }
                  },
                ]
              );
            }}
            variant="danger"
            fullWidth
            icon="log-out-outline"
          />
        </View>
      )}
    </ScrollView>

    <WalletModal
      visible={showWalletModal}
      onClose={() => setShowWalletModal(false)}
      mode={walletModalMode}
      currentBalance={walletBalance}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  coverSection: {
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: 180,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: theme.colors.background,
    position: 'absolute',
    bottom: -60,
    left: 20,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 70,
    marginBottom: 20,
  },
  name: {
    color: theme.colors.text.primary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  username: {
    color: theme.colors.text.secondary,
    fontSize: 16,
    marginBottom: 8,
  },
  bio: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.cardBg,
    padding: 18,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statValue: {
    color: theme.colors.text.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: theme.colors.text.secondary,
    fontSize: 13,
    marginTop: 5,
  },
  followSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 20,
    marginBottom: 20,
  },
  followItem: {
    flex: 1,
    alignItems: 'center',
  },
  followValue: {
    color: theme.colors.text.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  followLabel: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    marginTop: 2,
  },
  badgesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  badgeCount: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  badgesList: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  badgeCard: {
    backgroundColor: theme.colors.cardBg,
    padding: 16,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    width: 115,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  badgeCardLocked: {
    opacity: 0.4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  badgeName: {
    color: theme.colors.text.primary,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
  },
  badgeDate: {
    color: theme.colors.text.secondary,
    fontSize: 10,
    marginTop: 6,
    fontWeight: '500',
  },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 1,
  },
  postItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 1,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.md,
  },
  postOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  postStatText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  walletSection: {
    padding: 20,
    paddingTop: 30,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  walletCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: 15,
  },
  walletContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  balanceDisplay: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3B82F6',
    fontFamily: 'monospace',
  },
  walletHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  walletSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  walletBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  walletAddrText: {
    fontSize: 13,
    color: '#3B82F6',
    fontFamily: 'monospace',
  },
  walletConnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
  },
  walletConnectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  walletDisconnectBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  walletDisconnectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF3B30',
    textAlign: 'center',
  },
  walletGradient: {
    padding: 20,
  },
  copyRow: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  walletLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  walletBalance: {
    color: theme.colors.text.primary,
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 10,
  },
  walletAddress: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  copyHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  copyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 10,
  },
  walletActionButton: {
    flex: 1,
    backgroundColor: theme.colors.cardBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  walletActionText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 15,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.cardBg,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
  settingsButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
