import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';

import { theme } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { solanaWallet } from '../services/solanaWallet';
import { aiTaskGenerator } from '../services/aiTaskGenerator';
import { TaskCreationModal } from '../components/TaskCreationModal';
import { CelebrationToast } from '../components/CelebrationToast';

type DashboardTask = {
  id: string;
  title: string;
  description: string;
  type: string;
  xp: number;
  sol: number;
  location: string;
  duration: string;
  status: 'available' | 'locked';
};

const badgeData = [
  { id: 'airdrop', icon: '🪂', label: 'Airdrop Scout', progress: '2 / 5 drops' },
  { id: 'creator', icon: '🎨', label: 'Creator', progress: '4 live tasks' },
  { id: 'speed', icon: '⚡️', label: 'Speedster', progress: '3 submissions today' },
];

export default function DashboardScreen({ navigation }: any) {
  const { user: authUser } = useAuth();
  const [todayTasks, setTodayTasks] = useState<DashboardTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskMetrics, setTaskMetrics] = useState({ active: 0, completed: 0, pending: 0 });
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [myProofs, setMyProofs] = useState<any[]>([]);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [myAccepted, setMyAccepted] = useState<any[]>([]);
  const [myCreated, setMyCreated] = useState<any[]>([]);
  const [toast, setToast] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'sparkles' as keyof typeof Ionicons.glyphMap,
  });
  const hideToastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stats = useMemo(
    () => ({
      level: 7,
      xp: 2450,
      xpToNext: 3200,
      streak: 5,
      dailyTasks: { used: Math.min(todayTasks.length, 3), max: 3 },
      totalSOL: walletBalance ?? 0,
    }),
    [todayTasks.length, walletBalance]
  );

  const xpProgress = Math.min((stats.xp / stats.xpToNext) * 100, 100);

  // Reload data when screen comes into focus
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfileAndProofs();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    requestLocation();
    loadWalletInfo();
    loadTasks();
    loadProfileAndProofs();

    return () => {
      if (hideToastTimeout.current) {
        clearTimeout(hideToastTimeout.current);
      }
    };
  }, []);

  const triggerToast = (
    title: string,
    message?: string,
    icon: keyof typeof Ionicons.glyphMap = 'sparkles'
  ) => {
    if (hideToastTimeout.current) {
      clearTimeout(hideToastTimeout.current);
    }
    setToast({ visible: true, title, message: message || '', icon });
    hideToastTimeout.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2600);
  };

  const handleAcceptTask = async (taskId: string) => {
    try {
      await api.tasks.acceptTask(taskId);
      triggerToast('Task Accepted! ✅', 'Check My Tasks to submit proof', 'checkmark-circle');
      // Remove from available tasks
      setTodayTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Failed to accept task:', error);
      Alert.alert('Error', 'Failed to accept task. Please try again.');
    }
  };

  const requestLocation = async () => {
    try {
      if (Platform.OS === 'web') {
        const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
        if (nav?.geolocation) {
          nav.geolocation.getCurrentPosition(
            (position: any) => {
              setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error: any) => {
              console.warn('Web location error:', error.message);
              Alert.alert('Location Permission', 'Please allow location access in your browser');
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          Alert.alert('Location', 'Browser location is not available');
        }
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Location access is needed for nearby tasks');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadWalletInfo = async () => {
    try {
      setLoadingWallet(true);
      const ensured = await solanaWallet.ensureUserWallet();
      setWalletAddress(ensured.publicKey);
      const balance = await solanaWallet.getBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading wallet info:', error);
    } finally {
      setLoadingWallet(false);
    }
  };

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await api.tasks.getTasks({ created_by_ai: true });

      // Backend returns {tasks: [], total: 0} format
      const taskList = Array.isArray(response) ? response : (response?.tasks || []);
      const aiOnly = taskList.filter((task: any) => task.created_by_ai === true || task.created_by_ai === 1);
      
      const transformedTasks: DashboardTask[] = aiOnly.map((task: any) => ({
        id: task.id.toString(),
        title: task.title,
        description: task.description,
        type: task.category,
        xp: task.xp_reward || 50,
        sol: task.sol_reward || 0.01,
        location: task.location_name || 'Online',
        duration: task.duration || '30 min',
        status: 'available',
      }));

      setTodayTasks(transformedTasks);

      const completed = taskList.filter((task: any) => task.status === 'completed').length;
      const pending = taskList.filter((task: any) => task.status === 'pending').length;
      setTaskMetrics({
        active: transformedTasks.length,
        completed,
        pending: pending || Math.max(0, transformedTasks.length - completed),
      });
    } catch (error) {
      console.error('Dashboard load tasks error:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadProfileAndProofs = async () => {
    try {
      const profile = await api.users.getProfile();
      setProfileId(profile?.id || null);

      const proofs = await api.proofs.getProofs(30, 0);
      const mine = proofs.filter((p: any) => `${p.user_id}` === `${profile?.id}`);
      setMyProofs(mine.slice(0, 6));

      try {
        const acceptedResp = await api.tasks.getAcceptedTasks();
        const acceptedList = Array.isArray(acceptedResp) ? acceptedResp : (acceptedResp?.tasks || []);
        setMyAccepted(acceptedList.slice(0, 3));
      } catch (err) {
        console.error('Failed to load accepted tasks:', err);
      }

      try {
        const createdResp = await api.tasks.getUserTasks();
        const createdList = Array.isArray(createdResp) ? createdResp : (createdResp?.tasks || []);
        setMyCreated(createdList.slice(0, 3));
      } catch (err) {
        console.error('Failed to load created tasks:', err);
      }
    } catch (error) {
      console.error('Failed loading profile/proofs:', error);
    }
  };

  const handleGenerateAITasks = async () => {
    if (generatingAI) return;

    setShowCreationModal(false);
    setGeneratingAI(true);

    try {
      let locationPayload;

      if (Platform.OS !== 'web') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          locationPayload = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            name: 'Nearby Spot',
          };
        }
      }

      // Fallback coordinates if web or permission denied (Istanbul center)
      const lat = locationPayload?.lat ?? 41.0082;
      const lng = locationPayload?.lng ?? 28.9784;
      const locationName = locationPayload?.name ?? 'Nearby';

      // Try backend AI (OpenRouter-powered)
      const backendResponse = await api.ai.generateTasks({
        category: 'content',
        lat,
        lng,
        locationName,
        prompt: 'Generate location-based creator tasks',
      });
      const backendTasks = Array.isArray(backendResponse?.tasks)
        ? backendResponse.tasks.filter(Boolean)
        : [];

      if (backendTasks.length > 0) {
        const transformed = backendTasks.map((task: any, idx: number): DashboardTask => ({
          id: task?.id ? task.id.toString() : `${Date.now()}-${idx}`,
          title: task?.title || 'AI Task',
          description: task?.description || 'Generated task',
          type: task?.category || 'general',
          xp: task?.xp_reward || 50,
          sol: task?.sol_reward || 0,
          location: task?.location_name || 'Online',
          duration: task?.duration || '30 min',
          status: task?.status || 'available',
        }));

        setTodayTasks((prev) => [...transformed, ...prev]);
        triggerToast('AI tasks ready 🎉', `${transformed.length} tasks generated.`, 'sparkles');
        return;
      }

      console.warn('Backend AI returned no tasks; falling back to local generator');
    } catch (error) {
      console.warn('Backend AI generation failed, using local mock:', error);

      try {
        let locationPayload;

        if (Platform.OS !== 'web') {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            locationPayload = {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            };
          }
        }

        const newTask = await aiTaskGenerator.generateTask({
          userLocation: locationPayload,
          userInterests: ['content creation', 'photography', 'video'],
          difficulty: 'medium',
        });

        const savedTask = await api.tasks.createTask({
          title: newTask.title,
          description: newTask.description,
          category: newTask.category,
          xp_reward: 50,
          sol_reward: 0,
          location_name: newTask.location?.name || 'Nearby',
          duration: newTask.duration,
          difficulty: 'medium',
          created_by_ai: true,
        });

        const task: DashboardTask = {
          id: savedTask?.id?.toString() || Date.now().toString(),
          title: newTask.title,
          description: newTask.description,
          type: newTask.category,
          xp: 50,
          sol: 0,
          location: newTask.location?.name || 'Nearby',
          duration: newTask.duration,
          status: 'available',
        };

        setTodayTasks((prev) => [task, ...prev]);
        triggerToast('Task ready 🎉', `${newTask.title} is live for creators.`, 'sparkles');
      } catch (fallbackError) {
        Alert.alert('Error', 'Failed to generate task. Please try again.');
        console.error('AI task generation error:', fallbackError);
      }
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleCopyWallet = async () => {
    if (!walletAddress) return;

    await Clipboard.setStringAsync(walletAddress);
    Alert.alert('Wallet Copied', 'Your wallet address is now in the clipboard.');
  };

  const handleManualStart = () => {
    setShowCreationModal(false);
    navigation.navigate('CreateTask');
  };

  const handleQuickTemplate = () => {
    setShowCreationModal(false);
    navigation.navigate('CreateTask');
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1579546929662-711aa33c6b6f?w=1000&h=400&fit=crop',
          }}
          style={styles.header}
          imageStyle={{ opacity: 0.5 }}
        >
          <LinearGradient 
            colors={['rgba(139, 92, 246, 0.65)', 'rgba(99, 102, 241, 0.65)']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={[styles.header, { position: 'absolute', top: 0, left: 0, right: 0 }]}
          />
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>
                {`Hello, ${authUser?.name || authUser?.email?.split('@')[0] || 'Runner'} 👋`}
              </Text>
              <View style={styles.levelBadge}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.levelText}>Level {stats.level}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                style={styles.headerIconButton} 
                onPress={() => navigation.navigate('Feed')}
              >
                <LinearGradient 
                  colors={['#FF6B6B', '#FF8E72']}
                  style={styles.headerIconGradient}
                >
                  <Ionicons name="star" size={22} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerIconButton}
                onPress={handleCopyWallet}
              >
                <LinearGradient 
                  colors={['#4ECDC4', '#44A08D']}
                  style={styles.headerIconGradient}
                >
                  <Ionicons name="wallet" size={22} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.xpSection}>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${xpProgress}%` }]} />
            </View>
            <Text style={styles.xpText}>
              {stats.xp} / {stats.xpToNext} XP
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>🔥 {stats.streak}</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {stats.dailyTasks.used}/{stats.dailyTasks.max}
              </Text>
              <Text style={styles.statLabel}>Task Slots</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>◎ {(stats.totalSOL || 0).toFixed(3)}</Text>
              <Text style={styles.statLabel}>Today's Earnings</Text>
            </View>
          </View>
        </ImageBackground>

        <TouchableOpacity style={styles.challengeBanner}>
          <LinearGradient
            colors={['#FF6B9D', '#FFA658']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.challengeGradient}
          >
            <View style={styles.challengeContent}>
              <Ionicons name="flash" size={32} color="#fff" />
              <View style={styles.challengeText}>
                <Text style={styles.challengeTitle}>Daily Challenge</Text>
                <Text style={styles.challengeSubtitle}>Take a photo at a coffee shop</Text>
              </View>
              <View style={styles.challengeReward}>
                <Text style={styles.rewardText}>+120 XP</Text>
                <Text style={styles.rewardSol}>+0.01 SOL</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.aiButton}
          onPress={handleGenerateAITasks}
          disabled={generatingAI}
        >
          <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.aiGradient}>
            {generatingAI ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.aiText}>AI Generating Task...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={24} color="#fff" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiText}>Generate New Tasks with AI</Text>
                  <Text style={styles.aiSubtext}>3/3 slots available</Text>
                </View>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Creator Hub</Text>
            <TouchableOpacity style={styles.createTaskButton} onPress={() => setShowCreationModal(true)}>
              <Ionicons name="add-circle" size={18} color={theme.colors.primary} />
              <Text style={styles.createTaskText}>Create</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionDescription}>Launch a mission or let AI ideate for you.</Text>
          <View style={styles.creatorRow}>
            <TouchableOpacity
              style={styles.creatorCard}
              onPress={() => setShowCreationModal(true)}
            >
              <LinearGradient colors={['#FF6B6B', '#FF8E72']} style={styles.creatorIconGrad}>
                <Ionicons name="flash" size={20} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.creatorCardTitle}>Quick Task</Text>
                <Text style={styles.creatorCardSubtitle}>2 min setup</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.creatorCard} onPress={() => setShowCreationModal(true)}>
              <LinearGradient colors={['#A78BFA', '#D084D0']} style={styles.creatorIconGrad}>
                <Ionicons name="sparkles" size={20} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.creatorCardTitle}>AI Assist</Text>
                <Text style={styles.creatorCardSubtitle}>Generate 3 ideas</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.exploreBanner}
          onPress={() => navigation.navigate('Explore')}
        >
          <LinearGradient colors={['#00D084', '#00B894']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Community Feed</Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>See all submitted proofs</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {(myAccepted.length > 0 || myCreated.length > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📋 My Tasks & Rewards</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <View style={{ flex: 1, backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ fontSize: 10, color: theme.colors.text.secondary }}>Accepted</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.text.primary }}>{myAccepted.length}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: 'rgba(236, 72, 153, 0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ fontSize: 10, color: theme.colors.text.secondary }}>Created</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.text.primary }}>{myCreated.length}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ fontSize: 10, color: theme.colors.text.secondary }}>Completed</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.text.primary }}>{taskMetrics.completed}</Text>
                </View>
              </View>
            </View>

            {myAccepted.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 4 }}>
                  {myAccepted.map((t) => (
                    <TouchableOpacity
                      key={`accepted-${t.id}`}
                      style={{ width: 210, backgroundColor: theme.colors.cardBg, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}
                      onPress={() => navigation.navigate('SubmitProof', { taskId: t.id, task: t })}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                        <Text style={{ color: theme.colors.text.primary, fontWeight: '700' }} numberOfLines={1}>Accepted</Text>
                      </View>
                      <Text style={{ color: theme.colors.text.primary, fontWeight: '700', marginTop: 8 }} numberOfLines={2}>{t.title}</Text>
                      <Text style={{ color: theme.colors.text.secondary, fontSize: 12, marginTop: 4 }} numberOfLines={2}>{t.description}</Text>
                      <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>+{t.xp_reward} XP</Text>
                        <TouchableOpacity
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}
                          onPress={() => navigation.navigate('SubmitProof', { taskId: t.id, task: t })}
                        >
                          <Ionicons name="cloud-upload" size={16} color="#fff" />
                          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Submit</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}

            {myCreated.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4, marginTop: 12 }}>
                <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 4 }}>
                  {myCreated.map((t) => (
                    <View
                      key={`created-${t.id}`}
                      style={{ width: 210, backgroundColor: theme.colors.cardBg, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="create" size={18} color={theme.colors.accent} />
                        <Text style={{ color: theme.colors.text.primary, fontWeight: '700' }} numberOfLines={1}>Created</Text>
                      </View>
                      <Text style={{ color: theme.colors.text.primary, fontWeight: '700', marginTop: 8 }} numberOfLines={2}>{t.title}</Text>
                      <Text style={{ color: theme.colors.text.secondary, fontSize: 12, marginTop: 4 }} numberOfLines={2}>{t.description}</Text>
                      <Text style={{ color: theme.colors.primary, fontWeight: '700', marginTop: 10 }}>+{t.xp_reward} XP</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Wallet</Text>
          <View style={styles.walletPanel}>
            <View>
              <Text style={styles.walletLabel}>Total Balance</Text>
              <Text style={styles.walletBalance}>
                {loadingWallet ? 'Loading...' : `◎ ${(walletBalance ?? 0).toFixed(4)}`}
              </Text>
              <TouchableOpacity onPress={handleCopyWallet}>
                <Text style={styles.walletAddressText}>
                  {walletAddress
                    ? `${walletAddress.slice(0, 5)}...${walletAddress.slice(-5)}`
                    : 'Generating wallet...'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.walletBadge}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.walletBadgeText}>Devnet</Text>
            </View>
          </View>
          <View style={styles.walletActionsRow}>
            {['Deposit', 'Send', 'Swap'].map((action) => (
              <TouchableOpacity
                key={action}
                style={styles.walletActionButton}
                onPress={() => Alert.alert(action, `${action} coming soon`)}
              >
                <Ionicons
                  name={
                    action === 'Send'
                      ? 'arrow-up'
                      : action === 'Deposit'
                      ? 'arrow-down'
                      : 'swap-horizontal'
                  }
                  size={18}
                  color="#fff"
                />
                <Text style={styles.walletActionText}>{action}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Task Stats</Text>
          <View style={styles.taskStatsRow}>
            <View style={styles.taskStatCard}>
              <Text style={styles.taskStatLabel}>Active</Text>
              <Text style={styles.taskStatValue}>{taskMetrics.active}</Text>
            </View>
            <View style={styles.taskStatCard}>
              <Text style={styles.taskStatLabel}>Completed</Text>
              <Text style={styles.taskStatValue}>{taskMetrics.completed}</Text>
            </View>
            <View style={styles.taskStatCard}>
              <Text style={styles.taskStatLabel}>Pending</Text>
              <Text style={styles.taskStatValue}>{taskMetrics.pending}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ XP & badges</Text>
          <View style={styles.xpBadgeRow}>
            <View style={styles.xpSummary}>
              <Text style={styles.xpSummaryLabel}>Season XP</Text>
              <Text style={styles.xpSummaryValue}>{stats.xp}</Text>
              <Text style={styles.xpSummaryHint}>{stats.xpToNext} XP to badge</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.badgesRow}>
                {badgeData.map((badge) => (
                  <View key={badge.id} style={styles.badgeCard}>
                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                    <Text style={styles.badgeLabel}>{badge.label}</Text>
                    <Text style={styles.badgeHint}>{badge.progress}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Tasks</Text>
          <TouchableOpacity
            style={styles.mapPreview}
            onPress={() => {
              if (userLocation) {
                navigation.navigate('Tasks');
              } else {
                Alert.alert('Location Required', 'Please enable location to see nearby tasks');
                requestLocation();
              }
            }}
          >
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={48} color="#6366F1" />
              <Text style={styles.mapText}>
                {userLocation ? 'Tap to see nearby tasks' : 'Enable location for nearby tasks'}
              </Text>
              <Text style={styles.mapSubtext}>
                {userLocation ? 'Location enabled ✓' : 'Tap to enable'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🤖 AI-Generated Tasks</Text>
          </View>
          {loadingTasks ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : todayTasks.length === 0 ? (
            <Text style={styles.sectionDescription}>No AI tasks yet. Try again later!</Text>
          ) : (
            todayTasks.slice(0, 4).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => navigation.navigate('TaskDetail', { task })}
                onAccept={handleAcceptTask}
              />
            ))
          )}
        </View>
      </ScrollView>

      <TaskCreationModal
        visible={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onStartManual={handleManualStart}
        onGenerateAI={handleGenerateAITasks}
        onQuickTemplate={handleQuickTemplate}
      />

      <CelebrationToast
        visible={toast.visible}
        title={toast.title || 'Mission ready'}
        message={toast.message || 'Your new mission is live.'}
        icon={toast.icon}
      />
    </>
  );
}

function TaskCard({ 
  task, 
  onPress, 
  onAccept 
}: { 
  task: DashboardTask; 
  onPress: () => void;
  onAccept?: (taskId: string) => void;
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'photo':
        return 'camera';
      case 'video':
        return 'videocam';
      case 'run':
        return 'walk';
      default:
        return 'checkmark-circle';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.taskCard, task.status === 'locked' && styles.taskCardLocked]}
      onPress={onPress}
      disabled={task.status === 'locked'}
    >
      <View style={styles.taskIcon}>
        <Ionicons
          name={getTypeIcon(task.type)}
          size={24}
          color={task.status === 'locked' ? '#6B7280' : '#8B5CF6'}
        />
      </View>

      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskDescription}>{task.description}</Text>

        <View style={styles.taskMeta}>
          <View style={styles.taskMetaItem}>
            <Ionicons name="location" size={14} color="#9CA3AF" />
            <Text style={styles.taskMetaText}>{task.location}</Text>
          </View>
          <View style={styles.taskMetaItem}>
            <Ionicons name="time" size={14} color="#9CA3AF" />
            <Text style={styles.taskMetaText}>{task.duration}</Text>
          </View>
        </View>

        <View style={styles.taskRewards}>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardBadgeText}>+{task.xp} XP</Text>
          </View>
          <View style={styles.rewardBadgeSol}>
            <Text style={styles.rewardBadgeTextSol}>+{task.sol} SOL</Text>
          </View>
        </View>
      </View>

      {task.status === 'available' && (
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={() => onAccept?.(task.id)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      )}

      {task.status === 'locked' && (
        <View style={styles.lockedBadge}>
          <Ionicons name="lock-closed" size={20} color="#6B7280" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 5,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  levelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerIconButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  headerIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.cardBgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.cardBgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpSection: {
    marginTop: 10,
  },
  xpBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  xpText: {
    color: theme.colors.primary,
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  challengeBanner: {
    margin: 20,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  challengeGradient: {
    padding: 20,
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  challengeText: {
    flex: 1,
  },
  challengeTitle: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  challengeSubtitle: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    marginTop: 4,
  },
  challengeReward: {
    alignItems: 'flex-end',
  },
  rewardText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  rewardSol: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  exploreBanner: {
    height: 100,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,224,184,0.3)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: theme.colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  sectionDescription: {
    color: theme.colors.text.secondary,
    fontSize: 13,
    marginBottom: 14,
  },
  createTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(110, 107, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  createTaskText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  creatorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  creatorCard: {
    flex: 1,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  creatorIconGrad: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorCardTitle: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  creatorCardSubtitle: {
    color: theme.colors.text.secondary,
    fontSize: 13,
    marginTop: 2,
  },
  seeAll: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  walletPanel: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  walletLabel: {
    color: theme.colors.text.secondary,
    fontSize: 13,
  },
  walletBalance: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 6,
  },
  walletAddressText: {
    color: theme.colors.primary,
    fontSize: 13,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  walletBadgeText: {
    color: '#10B981',
    fontWeight: '600',
  },
  walletActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  walletActionButton: {
    flex: 1,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: theme.borderRadius.lg,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  walletActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  taskCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: 16,           // Per design system
    padding: 14,                // Per design system
    marginBottom: 16,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },
  taskCardLocked: {
    opacity: 0.4,
  },
  taskIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(110, 107, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  taskDescription: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskMetaText: {
    color: theme.colors.text.secondary,
    fontSize: 13,
  },
  taskRewards: {
    flexDirection: 'row',
    gap: 8,
  },
  rewardBadge: {
    backgroundColor: 'rgba(110, 107, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  rewardBadgeText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  rewardBadgeSol: {
    backgroundColor: 'rgba(255, 184, 108, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  rewardBadgeTextSol: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  lockedBadge: {
    justifyContent: 'center',
  },
  aiButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(110, 107, 255, 0.3)',
  },
  aiGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  aiText: {
    flex: 1,
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  aiSubtext: {
    color: theme.colors.text.secondary,
    fontSize: 13,
    marginTop: 4,
  },
  solanaButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(20, 241, 149, 0.3)',
  },
  solanaGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  solanaText: {
    flex: 1,
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  solanaSubtext: {
    color: '#333',
    fontSize: 13,
    marginTop: 4,
  },
  taskStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  taskStatCard: {
    flex: 1,
    backgroundColor: theme.colors.cardBg,
    padding: 16,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  taskStatLabel: {
    color: theme.colors.text.secondary,
    fontSize: 13,
  },
  taskStatValue: {
    color: theme.colors.primary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  xpBadgeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  xpSummary: {
    width: 140,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  xpSummaryLabel: {
    color: theme.colors.text.secondary,
    fontSize: 13,
  },
  xpSummaryValue: {
    color: theme.colors.primary,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 6,
  },
  xpSummaryHint: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 12,
    paddingLeft: 12,
  },
  badgeCard: {
    width: 140,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeLabel: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  badgeHint: {
    color: theme.colors.text.secondary,
    fontSize: 13,
    marginTop: 4,
  },
  mapPreview: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.cardBg,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  mapPlaceholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  mapSubtext: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 4,
  },
});
