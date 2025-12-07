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
import { TaskCreationModal } from '../components/TaskCreationModal';
import { CelebrationToast } from '../components/CelebrationToast';
import CreateTaskScreen from './CreateTaskScreen';

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

export default function DashboardScreen({ navigation, route }: any) {
  const { user: authUser } = useAuth();
  const [todayTasks, setTodayTasks] = useState<DashboardTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskMetrics, setTaskMetrics] = useState({ active: 0, completed: 0, pending: 0 });
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [myAccepted, setMyAccepted] = useState<any[]>([]);
  const [myCreated, setMyCreated] = useState<any[]>([]);
  const [toast, setToast] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'sparkles' as keyof typeof Ionicons.glyphMap,
  });
  const hideToastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const myTasksOffsetRef = useRef(0);

  const stats = useMemo(
    () => ({
      level: 7,
      xp: 2450,
      xpToNext: 3200,
      streak: 5,
      totalSOL: walletBalance ?? 0,
    }),
    [walletBalance]
  );

  const xpProgress = Math.min((stats.xp / stats.xpToNext) * 100, 100);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfileAndProofs();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadWalletInfo();
    loadTasks();
    loadProfileAndProofs();

    return () => {
      if (hideToastTimeout.current) {
        clearTimeout(hideToastTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (route?.params?.focusMyTasks) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ y: myTasksOffsetRef.current, animated: true });
        }
        navigation.setParams({ focusMyTasks: false });
      }, 180);
    }
  }, [route?.params?.focusMyTasks, navigation]);

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
      const result = await api.tasks.acceptTask(taskId);
      console.log('✅ Task accepted:', result);
      
      // Toast göster
      triggerToast('Task Accepted! ✅', 'Check My Tasks to submit proof', 'checkmark-circle');
      
      // Available Tasks'tan kaldır
      setTodayTasks(prev => prev.filter(t => t.id !== taskId));
      
      // My Tasks'ı yeniden yükle
      await loadProfileAndProofs();
    } catch (error: any) {
      console.error('Failed to accept task:', error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to accept task';
      Alert.alert('Error', errorMsg);
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
    // Available Tasks başlangıçta boş, kullanıcı Generate'e tıklayınca AI task üretecek
    try {
      setLoadingTasks(false);
      setTodayTasks([]);
      setTaskMetrics({ active: 0, completed: 0, pending: 0 });
    } catch (error) {
      console.error('Dashboard load tasks error:', error);
    }
  };

  const loadProfileAndProofs = async () => {
    try {
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
      // Kullanıcı konumunu al
      let userLocation = { lat: 41.0082, lng: 28.9784, locationName: 'Istanbul' };
      
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          userLocation = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            locationName: 'Your Location',
          };
        }
      } catch (locError) {
        console.warn('Location permission denied, using default location');
      }

      console.log('🚀 Calling api.ai.generateTasks with:', {
        category: 'content',
        lat: userLocation.lat,
        lng: userLocation.lng,
        locationName: userLocation.locationName,
      });

      const backendResponse = await api.ai.generateTasks({
        category: 'content',
        lat: userLocation.lat,
        lng: userLocation.lng,
        locationName: userLocation.locationName,
        prompt: 'Generate location-based creator tasks',
      });

      console.log('📦 Backend response:', backendResponse);

      const backendTasks = Array.isArray(backendResponse?.tasks) ? backendResponse.tasks.filter(Boolean) : [];
      console.log(`📋 Parsed ${backendTasks.length} tasks from response`);

      if (backendTasks.length > 0) {
        const transformed = backendTasks.map((task: any, idx: number): DashboardTask => ({
          id: task?.id ? task.id.toString() : `${Date.now()}-${idx}`,
          title: task?.title || 'AI Task',
          description: task?.description || 'Generated task',
          type: task?.category || 'general',
          xp: task?.xp_reward || 50,
          sol: task?.sol_reward || 0,
          location: task?.location_name || userLocation.locationName,
          duration: task?.duration || '30 min',
          status: 'available',
        }));

        setTodayTasks(transformed);
        setTaskMetrics({ active: transformed.length, completed: 0, pending: 0 });
        triggerToast('AI tasks ready 🎉', `${transformed.length} tasks generated for your location.`, 'sparkles');
      } else {
        console.warn('⚠️ No tasks in response');
        Alert.alert('Info', 'No tasks were generated. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ AI generation error:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      Alert.alert('Error', error?.response?.data?.error || error?.message || 'Failed to generate tasks. Please try again.');
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
    // Modal kapatıp manuel form göster
    setShowCreationModal(false);
    setShowManualForm(true);
  };

  const handleQuickTemplate = () => {
    // Quick template formu açma
    setShowCreationModal(false);
    navigation.getParent()?.navigate('CreateTask');
  };

  // Manuel form render et
  if (showManualForm) {
    return (
      <CreateTaskScreen 
        navigation={{
          goBack: () => setShowManualForm(false),
          navigate: navigation.navigate,
          getParent: navigation.getParent,
        }}
      />
    );
  }

  return (
    <>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1579546929662-711aa33c6b6f?w=1000&h=400&fit=crop',
          }}
          style={styles.header}
          imageStyle={{ opacity: 0.5 }}
        >
          <LinearGradient 
            colors={['rgba(59, 130, 246, 0.65)', 'rgba(139, 92, 246, 0.65)']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={[styles.header, { position: 'absolute', top: 0, left: 0, right: 0 }]}
          />
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>
                {`Hello, ${authUser?.name || authUser?.email?.split('@')[0] || 'Runner'} 👋`}
              </Text>
              <Text style={styles.subGreeting}>Level {stats.level} • {stats.streak}🔥 streak</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* XP Progress */}
          <View style={styles.xpSection}>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${xpProgress}%` }]} />
            </View>
            <Text style={styles.xpText}>{stats.xp} / {stats.xpToNext} XP</Text>
          </View>
        </ImageBackground>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.statLabel}>Active</Text>
            <Text style={styles.statValue}>{taskMetrics.active}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={20} color={theme.colors.warning} />
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>{taskMetrics.completed}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="wallet" size={20} color={theme.colors.accent} />
            <Text style={styles.statLabel}>Earnings</Text>
            <Text style={styles.statValue}>◎{(stats.totalSOL || 0).toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={handleGenerateAITasks}
            disabled={generatingAI}
          >
            <Ionicons name="sparkles" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>
              {generatingAI ? 'Generating...' : 'Generate'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            onPress={() => setShowCreationModal(true)}
          >
            <Ionicons name="add-circle" size={18} color={theme.colors.accent} />
            <Text style={[styles.actionBtnText, { color: theme.colors.accent }]}>Create</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            onPress={() => navigation.getParent()?.navigate('Community')}
          >
            <Ionicons name="compass" size={18} color={theme.colors.accent} />
            <Text style={[styles.actionBtnText, { color: theme.colors.accent }]}>Explore</Text>
          </TouchableOpacity>
        </View>

        {/* Available Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Tasks</Text>
          {loadingTasks || generatingAI ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
            </View>
          ) : todayTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="sparkles" size={40} color={theme.colors.text.secondary} />
              <Text style={styles.emptyStateTitle}>No tasks yet</Text>
              <Text style={styles.emptyStateText}>Generate AI tasks to see them here.</Text>
              <TouchableOpacity
                style={[styles.generateBtn, generatingAI && styles.generateBtnDisabled]}
                onPress={handleGenerateAITasks}
                disabled={generatingAI}
              >
                {generatingAI ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={18} color="#fff" />
                    <Text style={styles.generateBtnText}>Generate AI Tasks</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.availableList}>
              {todayTasks.map((task) => (
                <View key={task.id} style={styles.availableCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.availableTitle} numberOfLines={1}>{task.title}</Text>
                    <View style={styles.availableMetaRow}>
                      <View style={styles.metaBadge}>
                        <Ionicons name="location" size={12} color={theme.colors.accent} />
                        <Text style={styles.metaBadgeText}>{task.location.split(',')[0]}</Text>
                      </View>
                      <View style={styles.metaBadge}>
                        <Ionicons name="time" size={12} color={theme.colors.accent} />
                        <Text style={styles.metaBadgeText}>{task.duration}</Text>
                      </View>
                    </View>
                    <View style={styles.availableRewards}>
                      <View style={styles.rewardBadgeInline}>
                        <Text style={styles.rewardXP}>{task.xp} XP</Text>
                      </View>
                      {task.sol > 0 && (
                        <View style={styles.rewardBadgeInlineSol}>
                          <Text style={styles.rewardXP}>◎{task.sol.toFixed(2)}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAcceptTask(task.id)}
                  >
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

      {/* My Tasks */}
      {(myAccepted.length > 0 || myCreated.length > 0) && (
        <View
          style={styles.section}
          onLayout={(e) => {
            myTasksOffsetRef.current = e.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.sectionTitle}>📋 My Tasks</Text>

          {myAccepted.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Accepted ({myAccepted.length})</Text>
              {myAccepted.slice(0, 2).map((t) => (
                <View key={`accepted-${t.id}`} style={styles.miniTaskCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniTaskTitle} numberOfLines={1}>{t.title}</Text>
                    <Text style={styles.miniTaskDesc} numberOfLines={1}>{t.description}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('SubmitProof', { taskId: t.id, task: t })}
                    style={styles.miniActionBtn}
                  >
                    <Ionicons name="cloud-upload" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {myCreated.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Created ({myCreated.length})</Text>
              {myCreated.slice(0, 2).map((t) => (
                <View key={`created-${t.id}`} style={styles.miniTaskCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniTaskTitle} numberOfLines={1}>{t.title}</Text>
                    <Text style={styles.miniTaskDesc} numberOfLines={1}>{t.description}</Text>
                  </View>
                  <Text style={styles.miniTaskReward}>+{t.xp_reward} XP</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
      </ScrollView>

      <TaskCreationModal
        visible={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onStartManual={handleManualStart}
        onGenerateAI={handleGenerateAITasks}
        onQuickTemplate={handleQuickTemplate}
      />

      {toast.visible && (
        <CelebrationToast
          visible={toast.visible}
          title={toast.title}
          message={toast.message}
          icon={toast.icon}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpSection: {
    gap: 8,
  },
  xpBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: -12,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.cardBg,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnPrimary: {
    backgroundColor: theme.colors.accent,
  },
  actionBtnSecondary: {
    backgroundColor: theme.colors.cardBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  sectionBadge: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  generateBtn: {
    marginTop: 8,
    backgroundColor: theme.colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  generateBtnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  availableList: {
    gap: 10,
  },
  availableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  availableTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  availableMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 6,
  },
  metaBadgeText: {
    fontSize: 11,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  availableRewards: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  rewardBadgeInline: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  rewardBadgeInlineSol: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
  },
  rewardXP: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  acceptBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  subsection: {
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  miniTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    gap: 8,
  },
  miniTaskTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  miniTaskDesc: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  miniActionBtn: {
    backgroundColor: theme.colors.accent,
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniTaskReward: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.success,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  formPlaceholder: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
  },
});
