import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

let Camera: any;
let CameraType: any;
let Location: any;

if (Platform.OS !== 'web') {
  const CameraModule = require('expo-camera');
  Camera = CameraModule.Camera;
  CameraType = CameraModule.CameraType;
  Location = require('expo-location');
}

export default function CameraScreen({ navigation }: any) {
  // Early return for web
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={64} color="#9CA3AF" />
        <Text style={styles.permissionText}>Camera is not supported on web</Text>
        <Text style={{ color: '#6B7280', textAlign: 'center', paddingHorizontal: 20 }}>
          Please use a mobile device
        </Text>
      </View>
    );
  }

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType?.back);
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<any>(null);

  React.useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      
      setHasPermission(cameraStatus === 'granted' && locationStatus === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        const location = await Location.getCurrentPositionAsync({});
        
        navigation.navigate('ProofUpload', {
          mediaUri: photo.uri,
          mediaType: 'photo',
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        });
      } catch (error) {
        Alert.alert('Error', 'Could not take photo');
      }
    }
  };

  const recordVideo = async () => {
    if (cameraRef.current) {
      try {
        if (isRecording) {
          cameraRef.current.stopRecording();
          setIsRecording(false);
        } else {
          setIsRecording(true);
          const video = await cameraRef.current.recordAsync({
            maxDuration: 30,
          });
          
          const location = await Location.getCurrentPositionAsync({});
          
          navigation.navigate('ProofUpload', {
            mediaUri: video.uri,
            mediaType: 'video',
            location: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
          });
          setIsRecording(false);
        }
      } catch (error) {
        setIsRecording(false);
        Alert.alert('Error', 'Could not record video');
      }
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Checking permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={64} color="#9CA3AF" />
        <Text style={styles.permissionText}>Camera and location permission required</Text>
        <TouchableOpacity style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Go to Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.overlay}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>

            <View style={styles.modeIndicator}>
              <Ionicons name="location" size={16} color="#10B981" />
              <Text style={styles.modeText}>GPS Active</Text>
            </View>

            <TouchableOpacity
              style={styles.flipButton}
              onPress={() =>
                setType(
                  type === CameraType.back ? CameraType.front : CameraType.back
                )
              }
            >
              <Ionicons name="camera-reverse" size={32} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Recording Indicator */}
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Kayıt Ediliyor...</Text>
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={() => Alert.alert('Galeri', 'Galeriden seç')}
            >
              <Ionicons name="images" size={32} color="#fff" />
            </TouchableOpacity>

            <View style={styles.captureContainer}>
              <TouchableOpacity
                style={[
                  styles.captureButton,
                  isRecording && styles.captureButtonRecording,
                ]}
                onPress={takePicture}
                onLongPress={recordVideo}
              >
                <View style={styles.captureInner} />
              </TouchableOpacity>
              <Text style={styles.captureHint}>
                Basılı tut: Video{'\n'}Dokun: Fotoğraf
              </Text>
            </View>

            <TouchableOpacity
              style={styles.flashButton}
              onPress={() => Alert.alert('Flash', 'Flash ayarları')}
            >
              <Ionicons name="flash" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  modeText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: 'bold',
  },
  flipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  galleryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonRecording: {
    backgroundColor: 'rgba(239, 68, 68, 0.5)',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  captureHint: {
    color: '#fff',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  flashButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
