import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { theme, buttonStyles, inputStyles } from '../styles/theme';

export default function EditProfileScreen({ navigation }: any) {
  const { user: authUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    email: '',
    profileImage: '',
    coverPhoto: '',
    instagram: '',
    twitter: '',
    linkedin: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await api.users.getProfile();
      setFormData({
        username: profile.username || '',
        bio: profile.bio || '',
        email: profile.email || '',
        profileImage: profile.avatar_url || profile.profile_photo || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        coverPhoto: profile.cover_photo_url || '',
        instagram: profile.instagram_url || '',
        twitter: profile.twitter_url || '',
        linkedin: profile.linkedin_url || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    setIsLoading(true);

    try {
      const updated = await api.users.updateProfile({
        username: formData.username,
        bio: formData.bio,
        avatar_url: formData.profileImage,
        cover_photo_url: formData.coverPhoto,
        instagram_url: formData.instagram,
        twitter_url: formData.twitter,
        linkedin_url: formData.linkedin,
      });

      // AuthContext içindeki user objesini de güncelle
      if (authUser) {
        (authUser as any).username = formData.username;
        (authUser as any).bio = formData.bio;
        (authUser as any).profileImage = formData.profileImage;
      }

      Alert.alert('Success! 🎉', 'Your profile has been updated!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      console.error('Update profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeAvatar = async () => {
    // İzin kontrolü
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photos to update your profile picture.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
        ]
      );
      return;
    }

    // Fotoğraf seçme
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      
      // Base64'e çevirip backend'e gönder
      try {
        // Şimdilik sadece local URI'yi kullan, backend upload endpoint'i eklendiğinde base64 olarak gönderilebilir
        setFormData({
          ...formData,
          profileImage: selectedImage.uri,
        });
        
        Alert.alert('Success', 'Profile picture updated! Don\'t forget to save changes.');
      } catch (error) {
        console.error('Image upload error:', error);
        Alert.alert('Error', 'Failed to update profile picture');
      }
    }
  };

  const handleChangeCover = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photos to update your cover photo.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      setFormData({
        ...formData,
        coverPhoto: selectedImage.uri,
      });
      Alert.alert('Success', 'Cover photo updated! Don\'t forget to save changes.');
    }
  };

  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Cover Photo */}
        <View style={styles.coverSection}>
          {formData.coverPhoto ? (
            <Image source={{ uri: formData.coverPhoto }} style={styles.coverImage} />
          ) : (
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              style={styles.coverImage}
            />
          )}
          <TouchableOpacity style={styles.coverButton} onPress={handleChangeCover}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.coverButtonText}>Change Cover</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Image */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: formData.profileImage }} style={styles.avatar} />
            <TouchableOpacity style={styles.avatarButton} onPress={handleChangeAvatar}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>Tap to change your avatar</Text>
        </View>

        {/* Username */}
        <View style={styles.section}>
          <Text style={styles.label}>Username *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            placeholderTextColor="#6B7280"
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
          />
        </View>

        {/* Email (Read-only) */}
        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.input, styles.readOnly]}>
            <Text style={styles.readOnlyText}>{formData.email}</Text>
            <Ionicons name="lock-closed" size={16} color="#6B7280" />
          </View>
          <Text style={styles.hint}>Email cannot be changed</Text>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about yourself..."
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={4}
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            maxLength={150}
          />
          <Text style={styles.charCount}>{formData.bio.length}/150</Text>
        </View>

        {/* Social Media Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          
          <View style={styles.socialInput}>
            <Ionicons name="logo-instagram" size={20} color="#E4405F" />
            <TextInput
              style={styles.socialField}
              placeholder="Instagram username"
              placeholderTextColor="#6B7280"
              value={formData.instagram}
              onChangeText={(text) => setFormData({ ...formData, instagram: text })}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.socialInput}>
            <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
            <TextInput
              style={styles.socialField}
              placeholder="Twitter/X username"
              placeholderTextColor="#6B7280"
              value={formData.twitter}
              onChangeText={(text) => setFormData({ ...formData, twitter: text })}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.socialInput}>
            <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
            <TextInput
              style={styles.socialField}
              placeholder="LinkedIn profile URL"
              placeholderTextColor="#6B7280"
              value={formData.linkedin}
              onChangeText={(text) => setFormData({ ...formData, linkedin: text })}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Stats Display (Read-only) */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
              <Text style={styles.statValue}>Level 12</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame" size={24} color="#EF4444" />
              <Text style={styles.statValue}>12 Days</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Info', 'Wallet management coming soon!')}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="wallet" size={20} color="#8B5CF6" />
              <Text style={styles.actionText}>Manage Wallet</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Info', 'Notification settings coming soon!')}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="notifications" size={20} color="#10B981" />
              <Text style={styles.actionText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Info', 'Privacy settings coming soon!')}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
              <Text style={styles.actionText}>Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            style={styles.saveGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isLoading ? (
              <Text style={styles.saveButtonText}>Saving...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#374151',
  },
  avatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8B5CF6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#111827',
  },
  avatarHint: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  readOnly: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: 0.6,
  },
  readOnlyText: {
    color: '#fff',
    fontSize: 16,
  },
  hint: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  charCount: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  statsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#374151',
  },
  statsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  saveButton: {
    marginBottom: 40,
    marginTop: 10,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  socialInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  socialField: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  coverSection: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 160,
  },
  coverButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  coverButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
