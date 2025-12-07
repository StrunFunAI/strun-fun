import { Alert, Platform } from 'react-native';

// Lightweight toast helper so we can swap implementation later
export const toast = {
  success(message: string, title: string = 'Success') {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  },

  error(message: string, title: string = 'Error') {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  },
};

// ✅ Ek exported function
export function showToast({ type, message }: { type: 'success' | 'error'; message: string }) {
  if (type === 'success') {
    toast.success(message, '✅ Success');
  } else {
    toast.error(message, '❌ Error');
  }
}