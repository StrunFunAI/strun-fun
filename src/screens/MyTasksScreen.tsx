import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { theme } from '../styles/theme';

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  xp_reward: number;
  sol_reward: number;
  status?: string;
}

export default function MyTasksScreen({ navigation }: any) {
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [acceptedTasks, setAcceptedTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'created' | 'accepted'>('created');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      // Get user's created tasks
      const createdResponse = await api.tasks.getUserTasks();
      const createdData = createdResponse?.tasks || createdResponse || [];
      setCreatedTasks(Array.isArray(createdData) ? createdData : []);

      // Get accepted tasks
      const acceptedResponse = await api.tasks.getAcceptedTasks();
      const acceptedData = acceptedResponse?.tasks || acceptedResponse || [];
      setAcceptedTasks(Array.isArray(acceptedData) ? acceptedData : []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      fitness: '💪',
      wellness: '🧘',
      community: '🤝',
      environment: '🌱',
      creative: '🎨',
      education: '📚',
    };
    return icons[category] || '⭐';
  };

  const renderTaskCard = ({ item }: { item: Task }) => {
    const isAcceptedTab = activeTab === 'accepted';
    
    return (
      <View style={styles.taskCard}>
        <TouchableOpacity
          onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
        >
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
              <Text style={styles.categoryName}>{item.category}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>

          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.rewardsContainer}>
            <View style={styles.rewardItem}>
              <Ionicons name="sparkles" size={14} color={theme.colors.warning} />
              <Text style={styles.rewardValue}>{item.xp_reward} XP</Text>
            </View>
            {item.sol_reward > 0 && (
              <View style={styles.rewardItem}>
                <Ionicons name="logo-bitcoin" size={14} color={theme.colors.success} />
                <Text style={styles.rewardValue}>{item.sol_reward} SOL</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {isAcceptedTab && (
          <TouchableOpacity 
            style={styles.submitProofButton}
            onPress={() => navigation.navigate('SubmitProof', { taskId: item.id })}
          >
            <Ionicons name="cloud-upload" size={18} color="#fff" />
            <Text style={styles.submitProofText}>Submit Proof</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const activeData = activeTab === 'created' ? createdTasks : acceptedTasks;
  const isActive = activeTab === 'created';

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Tasks</Text>
            <Text style={styles.headerSubtitle}>Manage your tasks</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="checkmark-done-circle" size={40} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, isActive && styles.activeTab]}
          onPress={() => setActiveTab('created')}
        >
          <Ionicons
            name="create"
            size={20}
            color={isActive ? theme.colors.primary : theme.colors.text.secondary}
          />
          <Text
            style={[
              styles.tabText,
              isActive && styles.activeTabText,
            ]}
          >
            Created ({createdTasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, !isActive && styles.activeTab]}
          onPress={() => setActiveTab('accepted')}
        >
          <Ionicons
            name="hand-left"
            size={20}
            color={!isActive ? theme.colors.primary : theme.colors.text.secondary}
          />
          <Text
            style={[
              styles.tabText,
              !isActive && styles.activeTabText,
            ]}
          >
            Accepted ({acceptedTasks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : activeData.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons
            name={activeTab === 'created' ? 'folder-outline' : 'hand-left'}
            size={60}
            color={theme.colors.border}
          />
          <Text style={styles.emptyText}>
            {activeTab === 'created' ? 'No tasks created yet' : 'No tasks accepted yet'}
          </Text>
          {activeTab === 'created' && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateTask')}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create First Task</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={activeData}
          renderItem={renderTaskCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  } as any,
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  } as any,
  headerIcon: {
    opacity: 0.3,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.cardBg,
    margin: 15,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  tabText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  } as any,
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  } as any,
  listContent: {
    padding: 15,
  },
  taskCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  } as any,
  categoryName: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  } as any,
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
  } as any,
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  } as any,
  taskDescription: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginBottom: 12,
    lineHeight: 18,
  } as any,
  rewardsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  rewardValue: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
  } as any,
  submitProofButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  submitProofText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  } as any,
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  } as any,
  createButton: {
    marginTop: 20,
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  } as any,
});
