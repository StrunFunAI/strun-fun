import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../styles/theme';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

type DashboardTask = {
  id: string;
  title: string;
  description: string;
  type: string;
  xp: number;
  sol: number;
  location: string;
  locationType: 'remote' | 'in_person';
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'available' | 'locked';
};

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  xp_reward: number;
  sol_reward: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

// Helper function: Get gradient colors for task category
function getTaskGradient(category: string): [string, string] {
  const gradients: { [key: string]: [string, string] } = {
    fitness: ['#FF6B6B', '#FF8E8E'],
    content: ['#4ECDC4', '#6FE7DD'],
    community: ['#FFD93D', '#FFE66D'],
    wellness: ['#95E1D3', '#B8E6D5'],
    general: ['#8B5CF6', '#A78BFA'],
  };
  return gradients[category] || gradients.general;
}

// Helper function: Get emoji for task category
function getTaskEmoji(category: string): string {
  const emojis: { [key: string]: string } = {
    fitness: '💪',
    content: '📸',
    community: '🤝',
    wellness: '🧘',
    general: '⭐',
  };
  return emojis[category] || '⭐';
}

function getDifficulty(xp: number): 'easy' | 'medium' | 'hard' {
  if (xp >= 150) return 'hard';
  if (xp >= 80) return 'medium';
  return 'easy';
}

function getDifficultyColor(level: 'easy' | 'medium' | 'hard'): string {
  if (level === 'hard') return 'rgba(255, 87, 87, 0.9)';
  if (level === 'medium') return 'rgba(255, 195, 113, 0.9)';
  return 'rgba(110, 231, 183, 0.9)';
}

export default function MarketplaceScreen({ navigation }: any) {
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    minXP: 0,
    location: 'all',
    sortBy: 'newest',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await api.tasks.getTasks({ limit: 50, created_by_ai: false, has_reward: true });
      const taskList = Array.isArray(response) ? response : response.tasks || [];
      
      const transformed = taskList.map((task: Task, idx: number): DashboardTask => ({
        id: task?.id ? task.id.toString() : `${Date.now()}-${idx}`,
        title: task?.title || 'Task',
        description: task?.description || '',
        type: task?.category || 'general',
        xp: task?.xp_reward || 50,
        sol: task?.sol_reward || 0,
        location: task?.latitude ? `${task.latitude}, ${task.longitude}` : 'Remote',
        locationType: task?.latitude ? 'in_person' : 'remote',
        duration: '30 min',
        difficulty: getDifficulty(task?.xp_reward || 50),
        status: 'available',
      }));

      setTasks(transformed);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    try {
      await api.tasks.acceptTask(taskId);
      Alert.alert('Success', 'Task accepted! Navigate to Dashboard to submit proof.');
      navigation.navigate('Dashboard', { focusMyTasks: true });
    } catch (error) {
      Alert.alert('Error', 'Failed to accept task');
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.type === filters.category);
    }

    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(t => t.difficulty === filters.difficulty);
    }

    if (filters.minXP > 0) {
      filtered = filtered.filter(t => t.xp >= filters.minXP);
    }

    if (filters.location === 'in_person') {
      filtered = filtered.filter(t => t.locationType === 'in_person');
    } else if (filters.location === 'remote') {
      filtered = filtered.filter(t => t.locationType === 'remote');
    }

    // Sort
    if (filters.sortBy === 'highest_xp') {
      filtered.sort((a, b) => b.xp - a.xp);
    } else if (filters.sortBy === 'lowest_duration') {
      filtered.sort((a, b) => {
        const aDur = parseInt(a.duration) || 999;
        const bDur = parseInt(b.duration) || 999;
        return aDur - bDur;
      });
    } else {
      filtered.sort((a, b) => b.id.localeCompare(a.id));
    }

    return filtered;
  }, [tasks, filters]);

  const renderTaskCard = ({ item }: { item: DashboardTask }) => {
    const gradient = getTaskGradient(item.type);
    const emoji = getTaskEmoji(item.type);

    return (
      <TouchableOpacity
        style={styles.taskSquareCard}
        onPress={() => handleAcceptTask(item.id)}
      >
        <LinearGradient
          colors={gradient}
          style={styles.taskCardGradient}
        >
          {/* Top section: Category emoji + difficulty indicator */}
          <View style={styles.taskCardHeader}>
            <Text style={styles.taskCardEmoji}>{emoji}</Text>
            <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(item.difficulty) }]} />
          </View>

          {/* Middle: Title */}
          <Text style={styles.taskCardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Bottom: Metadata badges + rewards */}
          <View style={styles.taskCardInfo}>
            {/* Metadata badges (location, duration) */}
            <View style={styles.metadataBadges}>
              <View style={styles.metaBadge}>
                <Ionicons name="location-outline" size={12} color="#fff" />
                <Text style={styles.metaBadgeText}>{item.location.substring(0, 12)}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Ionicons name="time-outline" size={12} color="#fff" />
                <Text style={styles.metaBadgeText}>{item.duration}</Text>
              </View>
            </View>

            {/* Reward badges (XP + SOL) */}
            <View style={styles.rewardBadges}>
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardIcon}>⭐</Text>
                <Text style={styles.rewardText}>{item.xp}</Text>
              </View>
              {item.sol > 0 && (
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardIcon}>◎</Text>
                  <Text style={styles.rewardText}>{item.sol}</Text>
                </View>
              )}
            </View>

            {/* Accept button */}
            <TouchableOpacity
              style={styles.acceptSquareBtn}
              onPress={() => handleAcceptTask(item.id)}
            >
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.marketplaceHeader}
      >
        <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>🏪 Task Marketplace</Text>
              <Text style={styles.headerSubtitle}>Curated bounties with location + XP filters</Text>
        </View>
      </LinearGradient>

      {/* Action buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.refreshBtn]}
          onPress={loadTasks}
          disabled={loadingTasks}
        >
          {loadingTasks ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="refresh" size={18} color="#fff" />}
          <Text style={styles.actionBtnText}>Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { flex: 1 }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <ScrollView style={styles.filterContainer} showsVerticalScrollIndicator={false}>
          {/* Sort By */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Sort By</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {['newest', 'highest_xp', 'lowest_duration'].map(sort => (
                <TouchableOpacity
                  key={sort}
                  style={[
                    styles.filterTag,
                    filters.sortBy === sort && styles.filterTagActive,
                  ]}
                  onPress={() => setFilters({ ...filters, sortBy: sort })}
                >
                  <Text
                    style={[
                      styles.filterTagText,
                      filters.sortBy === sort && styles.filterTagTextActive,
                    ]}
                  >
                    {sort === 'newest' ? 'Newest' : sort === 'highest_xp' ? 'Highest XP' : 'Quick'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Category */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {['all', 'fitness', 'content', 'community', 'wellness'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterTag,
                    filters.category === cat && styles.filterTagActive,
                  ]}
                  onPress={() => setFilters({ ...filters, category: cat })}
                >
                  <Text
                    style={[
                      styles.filterTagText,
                      filters.category === cat && styles.filterTagTextActive,
                    ]}
                  >
                    {cat === 'all' ? 'All' : `${getTaskEmoji(cat)} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Difficulty */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Difficulty</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {['all', 'easy', 'medium', 'hard'].map(level => (
                <TouchableOpacity
                  key={level}
                  style={[styles.filterTag, filters.difficulty === level && styles.filterTagActive]}
                  onPress={() => setFilters({ ...filters, difficulty: level })}
                >
                  <Text
                    style={[styles.filterTagText, filters.difficulty === level && styles.filterTagTextActive]}
                  >
                    {level === 'all' ? 'Any' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Min XP */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Minimum XP</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {[0, 50, 100, 200, 300].map(xp => (
                <TouchableOpacity
                  key={xp}
                  style={[
                    styles.filterTag,
                    filters.minXP === xp && styles.filterTagActive,
                  ]}
                  onPress={() => setFilters({ ...filters, minXP: xp })}
                >
                  <Text
                    style={[
                      styles.filterTagText,
                      filters.minXP === xp && styles.filterTagTextActive,
                    ]}
                  >
                    {xp === 0 ? 'Any' : `${xp}+`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Location */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Location</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {['all', 'in_person', 'remote'].map(loc => (
                <TouchableOpacity
                  key={loc}
                  style={[styles.filterTag, filters.location === loc && styles.filterTagActive]}
                  onPress={() => setFilters({ ...filters, location: loc })}
                >
                  <Text
                    style={[styles.filterTagText, filters.location === loc && styles.filterTagTextActive]}
                  >
                    {loc === 'all' ? 'Everywhere' : loc === 'in_person' ? 'In-person' : 'Remote'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      )}

      {/* Tasks Grid */}
      {loadingTasks ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="briefcase-outline" size={60} color={theme.colors.border} />
          <Text style={styles.emptyText}>No tasks found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskCard}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.taskGrid}
          contentContainerStyle={styles.tasksContent}
          scrollEnabled={true}
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
  marketplaceHeader: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 8,
  },
  headerContent: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  refreshBtn: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#0EA5E9',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  filterContainer: {
    maxHeight: 200,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginRight: 8,
  },
  filterTagActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  filterTagTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: 12,
  },
  tasksContent: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  taskGrid: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  taskSquareCard: {
    width: (width - 40) / 2,
    aspectRatio: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  taskCardGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskCardEmoji: {
    fontSize: 28,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  taskCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 18,
  },
  taskCardInfo: {
    gap: 8,
  },
  metadataBadges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  metaBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  rewardBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  rewardIcon: {
    fontSize: 12,
  },
  rewardText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  acceptSquareBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
});
