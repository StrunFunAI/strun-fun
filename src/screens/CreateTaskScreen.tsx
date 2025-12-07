import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PublicKey } from '@solana/web3.js';
import api from '../services/api';
import { Button } from '../components/Button';
import { SuccessPopup } from '../components/SuccessPopup';
import { theme } from '../styles/theme';
import { showToast } from '../utils/toast';
import { solanaService } from '../services/solana';

export default function CreateTaskScreen({ navigation }: any) {
  const [step, setStep] = useState(1); // 1: Basic, 2: Rewards, 3: Location, 4: Review
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'fitness',
    xp_reward: '50',
    sol_per_winner: '0.05',
    winner_count: '1',
    location_name: '',
    duration: '30 min',
    difficulty: 'medium',
    lat: null,
    lng: null,
  });

  // Calculated values
  const [totalPool, setTotalPool] = useState(0);
  const [platformFee, setPlatformFee] = useState(0);
  const [requiredDeposit, setRequiredDeposit] = useState(0);

  // Note: Platform funds vaults via backend platform keypair, no user deposit needed

  useEffect(() => {
    const solPerWinner = parseFloat(formData.sol_per_winner) || 0;
    const winners = parseInt(formData.winner_count) || 1;
    const pool = solPerWinner * winners;
    const fee = 0; // Platform funds vaults, no user fee
    const total = pool;

    setTotalPool(pool);
    setPlatformFee(fee);
    setRequiredDeposit(total);
  }, [formData.sol_per_winner, formData.winner_count]);

  const categories = [
    { id: 'fitness', name: 'Fitness', icon: '💪' },
    { id: 'wellness', name: 'Wellness', icon: '🧘' },
    { id: 'community', name: 'Community', icon: '🤝' },
    { id: 'environment', name: 'Environment', icon: '🌱' },
    { id: 'creative', name: 'Creative', icon: '🎨' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'writing', name: 'Writing', icon: '✍️' },
    { id: 'design', name: 'Design', icon: '🎭' },
    { id: 'research', name: 'Research', icon: '🔬' },
    { id: 'development', name: 'Development', icon: '💻' },
  ];

  const difficulties = ['easy', 'medium', 'hard', 'expert'];
  const durations = ['15 min', '30 min', '1 hour', '2 hours', '4 hours', '8 hours', '1 day'];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1) {
      if (!formData.title.trim() || !formData.description.trim()) {
        showToast({ type: 'error', message: 'Title and description are required' });
        return;
      }
      if (formData.title.length < 5) {
        showToast({ type: 'error', message: 'Title must be at least 5 characters' });
        return;
      }
      if (formData.description.length < 20) {
        showToast({ type: 'error', message: 'Description must be at least 20 characters' });
        return;
      }
    }
    if (step === 2) {
      const solAmount = parseFloat(formData.sol_per_winner);
      const winners = parseInt(formData.winner_count);
      if (solAmount <= 0 || winners <= 0) {
        showToast({ type: 'error', message: 'SOL reward and winner count must be greater than 0' });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Step 1: Create task on backend
      const response = await api.tasks.createTask({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        xp_reward: 50,
        sol_reward: parseFloat(formData.sol_per_winner),
        location_name: formData.location_name || 'Remote',
        duration: formData.duration,
        difficulty: formData.difficulty,
        visibility: 'public',
        lat: formData.lat,
        lng: formData.lng,
        created_by_ai: false,
      });

      if (!response.id) {
        showToast({ type: 'error', message: 'Failed to create task' });
        setLoading(false);
        return;
      }

      console.log('✅ Task created with ID:', response.id);

      // Step 2: Fund task vault on Solana (platform funds the vault PDA)
      try {
        const solPerWinner = parseFloat(formData.sol_per_winner);
        const winnerCount = parseInt(formData.winner_count);
        const totalPoolSol = solPerWinner * winnerCount;
        console.log(`💰 Requesting vault funding for task ${response.id}: ${totalPoolSol} SOL (${solPerWinner} × ${winnerCount} winners)`);
        
        const fundResult = await api.rewards.fundTaskVault(response.id, totalPoolSol);
        
        if (fundResult && fundResult.success) {
          console.log('✅ Task vault funded!');
          console.log('   Vault PDA:', fundResult.vault_pda);
          console.log('   TX:', fundResult.tx_sig);
          showToast({ type: 'success', message: `Task created and funded with ${totalPoolSol} SOL!` });
        } else {
          console.error('❌ Vault funding failed:', fundResult?.error || 'Unknown error');
          showToast({ type: 'error', message: 'Task created but funding pending. Contact support.' });
        }
      } catch (fundError: any) {
        console.error('❌ Vault funding error:', fundError);
        const errorMsg = fundError?.message || String(fundError);
        if (errorMsg.includes('Insufficient platform balance')) {
          showToast({ type: 'error', message: 'Platform treasury low. Please contact support.' });
        } else {
          showToast({ type: 'error', message: 'Task created but funding failed. Will retry.' });
        }
      }

      setSuccessVisible(true);
      setTimeout(() => {
        setSuccessVisible(false);
        navigation.navigate('Main', { screen: 'Dashboard' });
      }, 2500);
    } catch (error: any) {
      console.error('❌ Create task error:', error);
      const msg = error?.message || 'Failed to create task';
      showToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SuccessPopup 
        visible={successVisible} 
        title="✅ Task Created!"
        message="Your task is now live on the marketplace"
      />

      <LinearGradient
        colors={[theme.colors.background, theme.colors.cardBg]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack?.()}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="close" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Create New Task</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, { 
              backgroundColor: step >= 1 ? theme.colors.primary : theme.colors.border 
            }]} />
            <View style={[styles.progressSegment, { 
              backgroundColor: step >= 2 ? theme.colors.primary : theme.colors.border 
            }]} />
            <View style={[styles.progressSegment, { 
              backgroundColor: step >= 3 ? theme.colors.primary : theme.colors.border 
            }]} />
            <View style={[styles.progressSegment, { 
              backgroundColor: step >= 4 ? theme.colors.primary : theme.colors.border 
            }]} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* STEP 1: BASIC INFO */}
        {step === 1 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <TouchableOpacity
                style={styles.aiButton}
                onPress={() => {
                  // TODO: AI generation logic
                  showToast({ type: 'success', message: 'AI Task Generator coming soon!' });
                }}
              >
                <Ionicons name="sparkles" size={18} color="#fff" />
                <Text style={styles.aiButtonText}>🤖 AI Generate</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Task title (e.g., Write a Blog Post)"
              placeholderTextColor={theme.colors.text.muted}
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
            />
            <Text style={styles.hint}>{formData.title.length}/60 characters</Text>

            <Text style={[styles.label, { marginTop: 20 }]}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What exactly is the task? What should participants do?"
              placeholderTextColor={theme.colors.text.muted}
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              multiline
            />
            <Text style={styles.hint}>{formData.description.length}/500 characters</Text>

            <Text style={[styles.label, { marginTop: 20 }]}>Category *</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    formData.category === cat.id && styles.categoryButtonActive
                  ]}
                  onPress={() => handleInputChange('category', cat.id)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryText,
                    formData.category === cat.id && styles.categoryTextActive
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 2: REWARDS & POOL */}
        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rewards & Prize Pool</Text>
            
            <Text style={styles.infoBox}>ℹ️ All participants earn 50 XP per task completion</Text>

            <Text style={[styles.label, { marginTop: 20 }]}>SOL Reward per Winner *</Text>
            <View style={styles.rewardInput}>
              <Text style={styles.rewardCurrency}>◎</Text>
              <TextInput
                style={styles.rewardField}
                placeholder="0.05"
                placeholderTextColor={theme.colors.text.muted}
                value={formData.sol_per_winner}
                onChangeText={(text) => handleInputChange('sol_per_winner', text.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.hint}>SOL amount each winner receives</Text>

            <Text style={[styles.label, { marginTop: 20 }]}>Number of Winners *</Text>
            <View style={styles.rewardInput}>
              <Text style={styles.rewardCurrency}>#</Text>
              <TextInput
                style={styles.rewardField}
                placeholder="1"
                placeholderTextColor={theme.colors.text.muted}
                value={formData.winner_count}
                onChangeText={(text) => handleInputChange('winner_count', text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.hint}>How many participants can win</Text>

            {/* Pool Breakdown Card */}
            <View style={styles.poolCard}>
              <Text style={styles.poolTitle}>💰 Prize Pool (Platform Funded)</Text>
              <View style={styles.poolRow}>
                <Text style={styles.poolLabel}>Total Rewards:</Text>
                <Text style={styles.poolValue}>{totalPool.toFixed(4)} SOL</Text>
              </View>
              <View style={styles.poolRow}>
                <Text style={[styles.poolLabel, { fontSize: 12, color: '#888' }]}>Funded by platform treasury</Text>
                <Text style={[styles.poolLabel, { fontSize: 12, color: '#888' }]}>No user deposit</Text>
              </View>
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>Difficulty Level *</Text>
            <View style={styles.difficultyContainer}>
              {difficulties.map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.difficultyButton,
                    formData.difficulty === diff && styles.difficultyButtonActive
                  ]}
                  onPress={() => handleInputChange('difficulty', diff)}
                >
                  <Text style={[
                    styles.difficultyText,
                    formData.difficulty === diff && styles.difficultyTextActive
                  ]}>
                    {diff.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 3: LOCATION & DURATION */}
        {step === 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location & Duration</Text>
            
            <Text style={styles.label}>Location Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Istanbul, Remote, Cafe Xyz"
              placeholderTextColor={theme.colors.text.muted}
              value={formData.location_name}
              onChangeText={(text) => handleInputChange('location_name', text)}
            />
            <Text style={styles.hint}>Leave empty for 'Remote'</Text>

            <Text style={[styles.label, { marginTop: 20 }]}>Expected Duration *</Text>
            <View style={styles.durationGrid}>
              {durations.map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[
                    styles.durationButton,
                    formData.duration === dur && styles.durationButtonActive
                  ]}
                  onPress={() => handleInputChange('duration', dur)}
                >
                  <Text style={[
                    styles.durationText,
                    formData.duration === dur && styles.durationTextActive
                  ]}>
                    {dur}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 4: REVIEW */}
        {step === 4 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Review & Confirm</Text>
            
            <View style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Title:</Text>
                <Text style={styles.reviewValue}>{formData.title}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Description:</Text>
                <Text style={[styles.reviewValue, { flex: 1 }]} numberOfLines={2}>
                  {formData.description}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Category:</Text>
                <Text style={styles.reviewValue}>
                  {categories.find(c => c.id === formData.category)?.name}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>XP per Winner:</Text>
                <Text style={styles.reviewValue}>{formData.xp_reward}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>SOL per Winner:</Text>
                <Text style={styles.reviewValue}>{formData.sol_per_winner} SOL</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Winners:</Text>
                <Text style={styles.reviewValue}>{formData.winner_count}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Total Deposit:</Text>
                <Text style={[styles.reviewValue, { color: theme.colors.primary, fontWeight: '700' }]}>
                  {requiredDeposit.toFixed(4)} SOL
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Difficulty:</Text>
                <Text style={styles.reviewValue}>{formData.difficulty}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Location:</Text>
                <Text style={styles.reviewValue}>{formData.location_name || 'Remote'}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Duration:</Text>
                <Text style={styles.reviewValue}>{formData.duration}</Text>
              </View>
            </View>

            <Text style={styles.hint}>
              Everything looks good? Click "Create Task" to publish your mission.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          {step > 1 && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
              disabled={loading}
            >
              <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          {step < 4 ? (
            <TouchableOpacity 
              style={[styles.nextButton, { flex: step === 1 ? 1 : 0.7 }]}
              onPress={handleNext}
              disabled={loading}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.background} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.createButton, { flex: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color={theme.colors.success} />
                  <Text style={styles.createButtonText}>Create Task</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerContent: {
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: theme.colors.text.muted,
    marginTop: 6,
  },
  infoBox: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.lg,
    padding: 12,
    fontSize: 14,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
  },
  aiButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.cardBg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}15`,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  categoryTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  rewardInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  rewardCurrency: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginRight: 12,
  },
  rewardField: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  poolCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  poolTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  poolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  poolRowTotal: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  poolLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  poolLabelTotal: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  poolValue: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  poolFee: {
    fontSize: 14,
    color: theme.colors.warning,
    fontWeight: '600',
  },
  poolValueTotal: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.cardBg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  difficultyButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}15`,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  difficultyTextActive: {
    color: theme.colors.primary,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.cardBg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}15`,
  },
  durationText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  durationTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reviewLabel: {
    fontSize: 14,
    color: theme.colors.text.muted,
    fontWeight: '500',
  },
  reviewValue: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.cardBg,
    flex: 0.3,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.primary,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.success,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Wallet Modal Styles
  walletModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  walletModalContent: {
    backgroundColor: theme.colors.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  walletModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  walletModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  walletModalForm: {
    marginBottom: 24,
  },
  walletModalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  walletInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: theme.colors.text.primary,
    minHeight: 60,
    marginBottom: 12,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  walletInfoText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  walletConnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  walletConnectBtnActive: {
    backgroundColor: theme.colors.success,
  },
  walletConnectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  walletInfo: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  walletInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletInfoRow_last: {
    marginBottom: 0,
  },
  walletInfoLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  walletInfoValue: {
    fontSize: 13,
    color: theme.colors.text.primary,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
