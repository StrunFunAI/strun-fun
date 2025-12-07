import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

interface TaskCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onStartManual: () => void;
  onGenerateAI: () => void;
  onQuickTemplate?: () => void;
}

export const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  visible,
  onClose,
  onStartManual,
  onGenerateAI,
  onQuickTemplate,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>Create a new mission</Text>
          <Text style={styles.subtitle}>Choose how you want to launch your task</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                onStartManual();
                onClose();
              }}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="create" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Manual builder</Text>
                <Text style={styles.actionDescription}>
                  Full control over rewards, location and requirements.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                onGenerateAI();
                onClose();
              }}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(99,102,241,0.25)' }]}>
                <Ionicons name="sparkles" size={22} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>AI co-pilot</Text>
                <Text style={styles.actionDescription}>
                  Let STRUN suggest 3 creative tasks based on your location.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.templateButton}
              onPress={() => {
                onQuickTemplate?.();
                onClose();
              }}
            >
              <LinearGradient
                colors={[theme.colors.primary, '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.templateGradient}
              >
                <Ionicons name="flash" size={20} color="#fff" />
                <Text style={styles.templateText}>Use quick template</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    marginBottom: 18,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(139,92,246,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  actionDescription: {
    color: theme.colors.text.secondary,
    fontSize: 13,
    marginTop: 3,
  },
  templateButton: {
    marginTop: 8,
  },
  templateGradient: {
    paddingVertical: 14,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  templateText: {
    color: '#fff',
    fontWeight: '700',
  },
});
