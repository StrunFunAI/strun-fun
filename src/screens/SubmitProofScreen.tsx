import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { SuccessPopup } from '../components/SuccessPopup';

export default function SubmitProofScreen({ navigation, route }: any) {
  const { taskId, task: preselectedTask } = route.params || {};
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newBadges, setNewBadges] = useState<any[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (preselectedTask) {
      setSelectedTask(transformTask(preselectedTask));
    }
  }, [preselectedTask]);

  useEffect(() => {
    if (!tasks.length || !taskId) return;
    const match = tasks.find((task) => `${task.id}` === `${taskId}`);
    if (match) {
      setSelectedTask(match);
    }
  }, [tasks, taskId]);

  const transformTask = (task: any) => ({
    ...task,
    xp_reward: task.xp_reward ?? task.xp ?? 0,
    sol_reward: task.sol_reward ?? task.sol ?? 0,
  });

  const loadTasks = async () => {
    try {
      const response = await api.tasks.getTasks();
      const data = Array.isArray(response) ? response : (response?.tasks || []);
      const normalized = data.map(transformTask);
      setTasks(normalized.slice(0, 10));
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickMedia = async (type: 'photo' | 'video') => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photos/videos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'photo' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        aspect: type === 'photo' ? [4, 3] : undefined,
      });

      if (!result.canceled && result.assets[0]) {
        setMediaUri(result.assets[0].uri);
        setMediaType(type === 'photo' ? 'image' : 'video');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow camera access');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        setMediaUri(result.assets[0].uri);
        setMediaType('image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleSubmit = async () => {
    if (!selectedTask) {
      Alert.alert('Error', 'Please select a task');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!mediaUri) {
      Alert.alert('Error', 'Please upload a photo or video');
      return;
    }

    try {
      setSubmitting(true);
      
      const result = await api.proofs.submitProof({
        task_id: selectedTask.id,
        description: description.trim(),
        photo_url: mediaType === 'image' ? mediaUri : undefined,
        video_url: mediaType === 'video' ? mediaUri : undefined,
      });

      const xpEarned = result.xp_earned || result.xp_pending || 0;
      const earnedBadges = result.newBadges || [];
      
      // Build success message with XP and badges
      let message = `Proof submitted! +${xpEarned} XP earned!`;
      if (earnedBadges.length > 0) {
        message += `\n\n🎉 New Badge${earnedBadges.length > 1 ? 's' : ''}!\n`;
        message += earnedBadges.map(b => `${b.icon} ${b.name}`).join('\n');
      }
      
      setSuccessMessage(message);
      setNewBadges(earnedBadges);
      setSuccessVisible(true);

      setTimeout(() => {
        setDescription('');
        setMediaUri(null);
        setMediaType(null);
        setSelectedTask(null);
        setNewBadges([]);
      }, 150);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit proof');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SuccessPopup
        visible={successVisible}
        message={successMessage || 'Proof submitted!'}
        onDismiss={() => {
          setSuccessVisible(false);
          navigation.getParent()?.navigate('Community');
        }}
      />
      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Proof</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Task Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Select Task *</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.taskScroll}
          >
            {tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskCard,
                  selectedTask?.id === task.id && styles.taskCardSelected,
                ]}
                onPress={() => setSelectedTask(task)}
              >
                <View style={styles.taskIcon}>
                  <Text style={styles.taskIconText}>
                    {task.category === 'fitness' ? '🏃' :
                     task.category === 'social' ? '👥' :
                     task.category === 'creative' ? '🎨' :
                     task.category === 'educational' ? '📚' : '🌱'}
                  </Text>
                </View>
                <Text style={styles.taskCardTitle} numberOfLines={2}>
                  {task.title}
                </Text>
                <View style={styles.taskReward}>
                  <Text style={styles.taskRewardText}>+{task.xp_reward} XP</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Media Upload */}
        <View style={styles.section}>
          <Text style={styles.label}>Upload Proof *</Text>
          
          {!mediaUri ? (
            <View style={styles.uploadOptions}>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={takePhoto}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  style={styles.uploadGradient}
                >
                  <Ionicons name="camera" size={32} color="#FFF" />
                  <Text style={styles.uploadButtonText}>Take Photo</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => pickMedia('photo')}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.uploadGradient}
                >
                  <Ionicons name="images" size={32} color="#FFF" />
                  <Text style={styles.uploadButtonText}>Choose Photo</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => pickMedia('video')}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.uploadGradient}
                >
                  <Ionicons name="videocam" size={32} color="#FFF" />
                  <Text style={styles.uploadButtonText}>Choose Video</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.mediaPreview}>
              {mediaType === 'image' && (
                <Image
                  source={{ uri: mediaUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              )}
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => {
                  setMediaUri(null);
                  setMediaType(null);
                }}
              >
                <Ionicons name="close-circle" size={32} color="#EF4444" />
              </TouchableOpacity>
              {mediaType === 'video' && (
                <View style={styles.videoIndicator}>
                  <Ionicons name="play-circle" size={64} color="#FFF" />
                  <Text style={styles.videoText}>Video Selected</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your achievement..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Selected Task Info */}
        {selectedTask && (
          <View style={styles.selectedTaskInfo}>
            <Text style={styles.selectedTaskLabel}>Selected Task:</Text>
            <Text style={styles.selectedTaskTitle}>{selectedTask.title}</Text>
            <View style={styles.rewardInfo}>
              <View style={styles.rewardItem}>
                <Ionicons name="trophy" size={16} color="#F59E0B" />
                <Text style={styles.rewardItemText}>+{selectedTask.xp_reward} XP</Text>
              </View>
              {selectedTask.sol_reward > 0 && (
                <View style={styles.rewardItem}>
                  <Ionicons name="logo-bitcoin" size={16} color="#8B5CF6" />
                  <Text style={styles.rewardItemText}>+{selectedTask.sol_reward} SOL</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <LinearGradient
            colors={submitting ? ['#9CA3AF', '#9CA3AF'] : ['#8B5CF6', '#EC4899']}
            style={styles.submitGradient}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                <Text style={styles.submitButtonText}>Submit Proof</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  taskScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  taskCard: {
    width: 140,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  taskCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskIconText: {
    fontSize: 24,
  },
  taskCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    height: 40,
  },
  taskReward: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  taskRewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  preview: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  uploadButton: {
    flex: 1,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  uploadGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  mediaPreview: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1F2937',
    minHeight: 200,
    position: 'relative',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    zIndex: 10,
  },
  videoIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  videoText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 12,
  },
  selectedTaskInfo: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  selectedTaskLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  selectedTaskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  rewardInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
