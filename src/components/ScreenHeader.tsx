import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  iconName?: string;
  imageUrl?: string;
  colors?: [string, string];
}

export function ScreenHeader({
  title,
  subtitle,
  iconName = 'sparkles',
  imageUrl = 'https://images.unsplash.com/photo-1579546929662-711aa33c6b6f?w=1000&h=400&fit=crop',
  colors = ['rgba(139, 92, 246, 0.65)', 'rgba(99, 102, 241, 0.65)'],
}: ScreenHeaderProps) {
  return (
    <ImageBackground
      source={{ uri: imageUrl }}
      style={styles.header}
      imageStyle={{ opacity: 0.5 }}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name={iconName as any} size={40} color="#fff" />
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  iconContainer: {
    opacity: 0.8,
  },
});
