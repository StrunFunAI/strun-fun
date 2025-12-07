import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProofUploadScreen({ route, navigation }: any) {
  const { mediaUri, mediaType, location } = route.params || {};
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (!caption.trim()) {
      Alert.alert('Warning', 'Please add a description');
      return;
    }

    setIsUploading(true);

    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      Alert.alert(
        'Success! 🎉',
        'Your proof has been uploaded and sent for verification. Community voting has started!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Main', { screen: 'Community' }),
          },
        ]
      );
    }, 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Preview</Text>
          {mediaType === 'photo' ? (
            <Image source={{ uri: mediaUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.videoPreview}>
              <Ionicons name="play-circle" size={64} color="#8B5CF6" />
              <Text style={styles.videoText}>Video</Text>
            </View>
          )}
        </View>

        {/* Location Info */}
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={24} color="#10B981" />
            <Text style={styles.locationTitle}>Location Verified</Text>
          </View>
          {location && (
            <Text style={styles.locationText}>
              Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
            </Text>
          )}
          <View style={styles.locationBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.locationBadgeText}>GPS Confirmed</Text>
          </View>
        </View>

        {/* Caption Input */}
        <View style={styles.captionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Write something about the task... #strun #fitness"
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={4}
            value={caption}
            onChangeText={setCaption}
          />
          <Text style={styles.captionHint}>
            Tip: Use hashtags to reach more people!
          </Text>
        </View>

        {/* Task Info */}
        <View style={styles.taskInfo}>
          <View style={styles.taskInfoHeader}>
            <Ionicons name="flag" size={20} color="#8B5CF6" />
            <Text style={styles.taskInfoTitle}>Task Details</Text>
          </View>
          <View style={styles.taskInfoRow}>
            <Text style={styles.taskInfoLabel}>XP Reward:</Text>
            <Text style={styles.taskInfoValue}>+80 XP</Text>
          </View>
          <View style={styles.taskInfoRow}>
            <Text style={styles.taskInfoLabel}>SOL Reward:</Text>
            <Text style={styles.taskInfoValueSol}>+0.015 SOL</Text>
          </View>
        </View>

        {/* Verification Info */}
        <View style={styles.verificationSection}>
          <Text style={styles.sectionTitle}>Verification Process</Text>
          <View style={styles.verificationStep}>
            <Ionicons name="camera" size={20} color="#9CA3AF" />
            <Text style={styles.verificationText}>
              EXIF data will be verified
            </Text>
          </View>
          <View style={styles.verificationStep}>
            <Ionicons name="locate" size={20} color="#9CA3AF" />
            <Text style={styles.verificationText}>
              GPS coordinates will be validated
            </Text>
          </View>
          <View style={styles.verificationStep}>
            <Ionicons name="people" size={20} color="#9CA3AF" />
            <Text style={styles.verificationText}>
              Community voting (24 hours)
            </Text>
          </View>
          <View style={styles.verificationStep}>
            <Ionicons name="checkmark-circle" size={20} color="#9CA3AF" />
            <Text style={styles.verificationText}>
              Reward will be distributed automatically
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isUploading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isUploading}
        >
          {isUploading ? (
            <Text style={styles.submitButtonText}>Uploading...</Text>
          ) : (
            <>
              <Ionicons name="cloud-upload" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Proof</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
  content: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  previewSection: {
    marginBottom: 30,
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    backgroundColor: '#374151',
  },
  videoPreview: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 10,
  },
  locationSection: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  locationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 10,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  locationBadgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  captionSection: {
    marginBottom: 30,
  },
  captionInput: {
    backgroundColor: '#1F2937',
    color: '#fff',
    fontSize: 16,
    padding: 15,
    borderRadius: 12,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  captionHint: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 8,
  },
  taskInfo: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  taskInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  taskInfoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  taskInfoLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  taskInfoValue: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskInfoValueSol: {
    color: '#FBBF24',
    fontSize: 14,
    fontWeight: 'bold',
  },
  verificationSection: {
    marginBottom: 30,
  },
  verificationStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  verificationText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 15,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});
