import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { theme } from '../styles/theme';

export default function PermissionScreen({ navigation }: any) {
  const [locationGranted, setLocationGranted] = useState(false);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setLocationGranted(true);
        // Navigate to main app after permission
        setTimeout(() => {
          navigation.replace('Main');
        }, 500);
      } else {
        Alert.alert(
          'Permission Required',
          'Location access is needed to discover tasks near you. You can change this later in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: requestLocationPermission },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const skipForNow = () => {
    Alert.alert(
      'Skip Location',
      'You can browse tasks but won\'t see distance information. Enable location later in settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => navigation.replace('Main') },
      ]
    );
  };

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.card]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <Ionicons 
            name={locationGranted ? "checkmark-circle" : "location"} 
            size={100} 
            color={locationGranted ? theme.colors.success : theme.colors.primary} 
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {locationGranted ? 'All Set!' : 'Enable Location'}
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          {locationGranted 
            ? 'You can now discover tasks near you'
            : 'We need location access to show you tasks nearby and calculate distances.'
          }
        </Text>

        {/* Features */}
        {!locationGranted && (
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Ionicons name="map" size={24} color={theme.colors.primary} />
              <Text style={styles.featureText}>Find tasks on the map</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="navigate" size={24} color={theme.colors.primary} />
              <Text style={styles.featureText}>See distances to tasks</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="pin" size={24} color={theme.colors.primary} />
              <Text style={styles.featureText}>Submit location-based proofs</Text>
            </View>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttons}>
          {!locationGranted && (
            <>
              <TouchableOpacity
                style={styles.allowButton}
                onPress={requestLocationPermission}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={styles.gradientButton}
                >
                  <Ionicons name="location" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Allow Location</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={skipForNow}
              >
                <Text style={styles.skipButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Privacy Note */}
        <Text style={styles.privacyNote}>
          🔒 Your location is only used while using the app and is never shared with other users.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  features: {
    gap: 16,
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#fff',
    flex: 1,
  },
  buttons: {
    gap: 12,
  },
  allowButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textDecorationLine: 'underline',
  },
  privacyNote: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});
