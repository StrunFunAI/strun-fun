import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, ViewStyle, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

interface CelebrationToastProps {
  visible: boolean;
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

// Use native driver only on native platforms (not web)
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export const CelebrationToast: React.FC<CelebrationToastProps> = ({
  visible,
  title,
  message,
  icon = 'sparkles',
  style,
}) => {
  const translateY = useRef(new Animated.Value(-40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(translateY, {
          toValue: -40,
          duration: 150,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    }
  }, [visible, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.toast,
        { opacity, transform: [{ translateY }], pointerEvents: 'none' },
        style,
        !visible && { display: 'none' },
      ]}
    >
      <LinearGradient
        colors={[theme.colors.primary, '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Ionicons name={icon} size={24} color="#fff" />
        <Text style={styles.title}>{title}</Text>
        {!!message && <Text style={styles.message}>{message}</Text>}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 99,
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: theme.borderRadius.xl,
    flexDirection: 'column',
    gap: 4,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
  },
});
