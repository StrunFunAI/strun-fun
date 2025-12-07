import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader } from '../components/ScreenHeader';
import { theme } from '../styles/theme';
import api from '../services/api';
import { TaskCreationModal } from '../components/TaskCreationModal';

export default function TasksScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [marketplaceTasks, setMarketplaceTasks] = useState<any[]>([]);
  const [loadingMyTasks, setLoadingMyTasks] = useState(false);
  const [loadingMarketplace, setLoadingMarketplace] = useState(false);
  const [showCreationModal, setShowCreationModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'my-tasks') {
      loadMyTasks();
    } else if (activeTab === 'marketplace') {
      loadMarketplaceTasks();
    }
  }, [activeTab]);

  const loadMyTasks = async () => {
    try {
      setLoadingMyTasks(true);
      const tasks = await api.tasks.getTasks();
      // Filter tasks created by user (user_id = 1 for now)
      const userTasks = tasks.filter((task: any) => task.created_by === 1);
      setMyTasks(userTasks);
    } catch (error) {
      console.error('Error loading my tasks:', error);
    } finally {
      setLoadingMyTasks(false);
    }
  };

  const loadMarketplaceTasks = async () => {
    try {
      setLoadingMarketplace(true);
      const tasks = await api.tasks.getTasks();
      // Filter: Only SOL reward tasks (created_by_ai = 0 and sol_reward > 0)
      const solRewardTasks = tasks.filter((task: any) => 
        !task.created_by_ai && task.sol_reward > 0
      );
      setMarketplaceTasks(solRewardTasks);
    } catch (error) {
      console.error('Error loading marketplace tasks:', error);
    } finally {
      setLoadingMarketplace(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="My Tasks"
        subtitle="Manage and create tasks"
        iconName="checkmark-circle"
        imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1000&h=400&fit=crop"
        colors={['rgba(34, 197, 94, 0.65)', 'rgba(22, 163, 74, 0.65)']}
      />
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'marketplace' && styles.tabActive]}
          onPress={() => setActiveTab('marketplace')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'marketplace' && styles.tabTextActive,
            ]}
          >
            Marketplace
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-tasks' && styles.tabActive]}
          onPress={() => setActiveTab('my-tasks')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'my-tasks' && styles.tabTextActive,
            ]}
          >
            My Tasks
          </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9CA3AF"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* Marketplace View */}
      {activeTab === 'marketplace' && (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SOL Reward Tasks</Text>
            <TouchableOpacity>
              <Ionicons name="cash" size={24} color="#10B981" />
            </TouchableOpacity>
          </View>

          {loadingMarketplace ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
          ) : (
            <>
              {marketplaceTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskCard}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: task.id, task })}
                >
                  <View style={styles.taskHeader}>
                    <View style={styles.sponsorBadge}>
                      <Ionicons name="business" size={14} color="#8B5CF6" />
                      <Text style={styles.sponsorText}>{task.category || 'General'}</Text>
                    </View>
                    <View style={styles.distanceBadge}>
                      <Ionicons name="location" size={12} color="#9CA3AF" />
                      <Text style={styles.distanceText}>{task.location_name || 'Remote'}</Text>
                    </View>
                  </View>

                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDescription}>{task.description}</Text>

                  <View style={styles.taskFooter}>
                    <View style={styles.rewards}>
                      <View style={styles.rewardBadge}>
                        <Text style={styles.rewardText}>+{task.xp_reward || 50} XP</Text>
                      </View>
                      <View style={styles.rewardBadgeSol}>
                        <Text style={styles.rewardTextSol}>+{task.sol_reward || 0} SOL</Text>
                      </View>
                    </View>

                    <View style={styles.slots}>
                      <Text style={styles.slotsText}>
                        {task.winner_count || 10} winners
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {marketplaceTasks.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={64} color="#6B7280" />
                  <Text style={styles.emptyText}>No tasks available</Text>
                  <Text style={styles.emptySubtext}>
                    Check back later for new opportunities
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* My Tasks View */}
      {activeTab === 'my-tasks' && (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        >
          {loadingMyTasks ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
          ) : myTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={64} color="#6B7280" />
              <Text style={styles.emptyText}>No tasks created yet</Text>
              <Text style={styles.emptySubtext}>
                Create tasks or generate with AI
              </Text>
            </View>
          ) : (
            myTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => navigation.navigate('TaskDetail', { task: {
                  id: task.id,
                  title: task.title,
                  description: task.description,
                  xp: task.xp_reward,
                  sol: task.sol_reward,
                  location: task.location_name || 'Online',
                  duration: task.duration || '30 min',
                  category: task.category,
                }})}
              >
                <View style={styles.taskHeader}>
                  <View style={styles.categoryBadge}>
                    <Ionicons name="pricetag" size={14} color="#10B981" />
                    <Text style={styles.categoryText}>{task.category}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{task.status}</Text>
                  </View>
                </View>

                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>

                <View style={styles.taskFooter}>
                  <View style={styles.rewards}>
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardText}>+{task.xp_reward} XP</Text>
                    </View>
                    <View style={styles.rewardBadgeSol}>
                      <Text style={styles.rewardTextSol}>+{task.sol_reward} SOL</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <TaskCreationModal
        visible={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onStartManual={() => navigation.navigate('CreateTask')}
        onGenerateAI={() => navigation.navigate('Dashboard', { openAiGenerator: true })}
        onQuickTemplate={() => navigation.navigate('CreateTask')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    padding: 5,
    margin: 15,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: theme.colors.accent,
  },
  tabText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.primary,
    fontSize: 16,
    paddingVertical: 12,
  },
  filterButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  taskCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sponsorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  sponsorText: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '600',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  distanceText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  taskTitle: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewards: {
    flexDirection: 'row',
    gap: 8,
  },
  rewardBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  rewardText: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '600',
  },
  rewardBadgeSol: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  rewardTextSol: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '600',
  },
  slots: {
    alignItems: 'flex-end',
  },
  slotsText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptySubtext: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
  },
});
