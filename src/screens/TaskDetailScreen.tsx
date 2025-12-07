import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

export default function TaskDetailScreen({ route, navigation }: any) {
  const { taskId, task: taskParam } = route.params || {};
  const [task, setTask] = useState<any>(taskParam);
  const [loading, setLoading] = useState(!taskParam);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const xpReward = task?.xp ?? task?.xp_reward ?? 0;
  const solReward = task?.sol ?? task?.sol_reward ?? 0;
  const locationLabel = task?.location || task?.location_name || 'Online';
  const durationLabel = task?.duration || '30 min';

  useEffect(() => {
    if (taskId && !taskParam) {
      loadTaskDetails();
    }
    if (task?.id || taskId) {
      loadSubmissions();
    }
  }, [taskId, task?.id]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      const taskData = await api.tasks.getTaskById(taskId);
      setTask(taskData);
    } catch (error) {
      console.error('Error loading task:', error);
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const taskIdToUse = task?.id || taskId;
      if (taskIdToUse) {
        const proofs = await api.proofs.getTaskProofs(taskIdToUse);
        setSubmissions(proofs);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleVote = async (proofId: number) => {
    try {
      const result = await api.vote.voteProof(proofId);
      console.log('✅ Vote result:', result);
      loadSubmissions(); // Reload to update votes
    } catch (error: any) {
      console.error('Error voting:', error);
      if (error?.response?.data?.error) {
        Alert.alert('Error', error.response.data.error);
      } else {
        Alert.alert('Error', 'Failed to vote');
      }
    }
  };

  const handleAccept = async () => {
    if (!task?.id || accepting) return;

    try {
      setAccepting(true);
      await api.tasks.acceptTask(task.id.toString());
      Alert.alert('Success', 'Task added to My Tasks → Accepted');
      navigation.navigate('SubmitProof', { taskId: task.id, task });
    } catch (error: any) {
      const message = error?.message || 'Failed to accept task';
      
      // If already accepted, just go to SubmitProof
      if (message.toLowerCase().includes('already accepted')) {
        Alert.alert('Already Accepted', 'You already accepted this task. Going to submit proof...');
        navigation.navigate('SubmitProof', { taskId: task.id, task });
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Task not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Image/Map */}
      <View style={styles.headerImage}>
        <LinearGradient
          colors={['#8B5CF6', '#EC4899']}
          style={styles.headerGradient}
        >
          <Ionicons name="map" size={64} color="rgba(255,255,255,0.3)" />
        </LinearGradient>
      </View>

      {/* Task Info */}
      <View style={styles.content}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.description}>{task.description}</Text>

        {/* Meta Info */}
        <View style={styles.metaSection}>
          <View style={styles.metaCard}>
            <Ionicons name="location" size={20} color="#8B5CF6" />
            <View>
              <Text style={styles.metaLabel}>Location</Text>
                <Text style={styles.metaValue}>{locationLabel}</Text>
            </View>
          </View>

          <View style={styles.metaCard}>
            <Ionicons name="time" size={20} color="#10B981" />
            <View>
              <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>{durationLabel}</Text>
            </View>
          </View>
        </View>

        {/* Rewards */}
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>Rewards</Text>
          <View style={styles.rewardsCards}>
            <View style={styles.rewardCard}>
              <Ionicons name="star" size={32} color="#A78BFA" />
              <Text style={styles.rewardValue}>+{xpReward} XP</Text>
              <Text style={styles.rewardLabel}>Experience</Text>
            </View>
            <View style={styles.rewardCard}>
              <Ionicons name="logo-bitcoin" size={32} color="#FBBF24" />
              <Text style={styles.rewardValueSol}>+{solReward} SOL</Text>
              <Text style={styles.rewardLabel}>Solana</Text>
            </View>
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.requirementsSection}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <View style={styles.requirement}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.requirementText}>Share GPS data</Text>
          </View>
          <View style={styles.requirement}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.requirementText}>Upload photo or video</Text>
          </View>
          <View style={styles.requirement}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.requirementText}>Go to the specified location</Text>
          </View>
        </View>

        {/* How it Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How it Works</Text>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Accept Task</Text>
              <Text style={styles.stepText}>
                Click the button below to accept the task
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Go to Location</Text>
              <Text style={styles.stepText}>
                Follow map directions to reach the location
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Upload Proof</Text>
              <Text style={styles.stepText}>
                Take and share a photo/video
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Earn Rewards</Text>
              <Text style={styles.stepText}>
                Earn XP and SOL after verification
              </Text>
            </View>
          </View>
        </View>

        {/* Submissions Section */}
        {submissions.length > 0 && (
          <View style={styles.submissionsSection}>
            <Text style={styles.sectionTitle}>
              Submissions ({submissions.length})
            </Text>
            {loadingSubmissions ? (
              <ActivityIndicator size="small" color="#8B5CF6" />
            ) : (
              submissions.map((submission) => (
                <View key={submission.id} style={styles.submissionCard}>
                  <View style={styles.submissionHeader}>
                    <TouchableOpacity
                      style={styles.userInfo}
                      onPress={() => navigation.navigate('Profile')}
                    >
                      <Image
                        source={{ uri: submission.profile_photo || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default' }}
                        style={styles.userAvatar}
                      />
                      <View>
                        <Text style={styles.username}>{submission.username}</Text>
                        <Text style={styles.submissionDate}>
                          {new Date(submission.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.voteButton}
                      onPress={() => handleVote(submission.id)}
                    >
                      <Ionicons name="arrow-up" size={20} color="#8B5CF6" />
                      <Text style={styles.voteCount}>{submission.votes || 0}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.submissionDescription}>
                    {submission.description}
                  </Text>
                  {submission.photo_url && (
                    <Image
                      source={{ uri: submission.photo_url }}
                      style={styles.submissionImage}
                    />
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* Bottom CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAccept}
        >
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            style={styles.acceptGradient}
          >
            {accepting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.acceptButtonText}>Accept Task</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    height: 200,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#D1D5DB',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  metaSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  metaCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  metaValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rewardsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  rewardsCards: {
    flexDirection: 'row',
    gap: 15,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  rewardValue: {
    color: '#A78BFA',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  rewardValueSol: {
    color: '#FBBF24',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  rewardLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 5,
  },
  requirementsSection: {
    marginBottom: 30,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  requirementText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  howItWorksSection: {
    marginBottom: 100,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 15,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stepText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  acceptButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  acceptGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
  },
  submissionsSection: {
    marginTop: 20,
    marginBottom: 100,
  },
  submissionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  username: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  submissionDate: {
    color: '#6B7280',
    fontSize: 12,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  voteCount: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '700',
  },
  submissionDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  submissionImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
