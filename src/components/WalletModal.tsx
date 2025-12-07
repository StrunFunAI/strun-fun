import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { solanaWallet } from '../services/solanaWallet';

interface WalletModalProps {
  visible: boolean;
  onClose: () => void;
  mode: 'send' | 'deposit';
  currentBalance: number;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  visible,
  onClose,
  mode,
  currentBalance,
}) => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (mode === 'send') {
      if (!recipient.trim()) {
        Alert.alert('Error', 'Please enter recipient address');
        return;
      }
      if (!amount || parseFloat(amount) <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }
      if (parseFloat(amount) > currentBalance) {
        Alert.alert('Error', 'Insufficient balance');
        return;
      }

      setLoading(true);
      try {
        console.log('📤 Sending', amount, 'SOL to', recipient);
        const signature = await solanaWallet.sendSOL(recipient, parseFloat(amount));
        console.log('✅ Transaction confirmed:', signature);
        Alert.alert('Success! 🎉', `Sent ${amount} SOL\nTransaction: ${signature.slice(0, 8)}...`);
        setAmount('');
        setRecipient('');
        onClose();
      } catch (error) {
        console.error('❌ Send error:', error);
        const errorMsg = error instanceof Error ? error.message : String(error);
        Alert.alert('Error', `Failed to send SOL: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    } else {
      // Deposit mode
      if (!amount || parseFloat(amount) <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      Alert.alert(
        'Deposit SOL',
        `To deposit ${amount} SOL, please send to your wallet address shown in your profile.`,
        [{ text: 'OK', onPress: onClose }]
      );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === 'send' ? '📤 Send SOL' : '📥 Deposit SOL'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceValue}>◎ {currentBalance.toFixed(4)}</Text>
            </View>

            {mode === 'send' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Recipient Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Solana address"
                  placeholderTextColor={theme.colors.text.secondary}
                  value={recipient}
                  onChangeText={setRecipient}
                  autoCapitalize="none"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount (SOL)</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>◎</Text>
                <TextInput
                  style={styles.amountField}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.text.secondary}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={mode === 'send' ? 'send' : 'arrow-down'}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.submitText}>
                    {mode === 'send' ? 'Send' : 'Get Deposit Info'}
                  </Text>
                </>
              )}
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  content: {
    gap: 16,
  },
  balanceCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.accent,
    marginRight: 8,
  },
  amountField: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  submitButton: {
    backgroundColor: theme.colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
