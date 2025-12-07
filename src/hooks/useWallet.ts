import { useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { solanaService } from '../services/solana';

export const useWallet = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  // Load wallet from storage
  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      const saved = await AsyncStorage.getItem('solana_wallet');
      if (saved) {
        setWallet(saved);
        setConnected(true);
        
        // Load balance
        const pubKey = new PublicKey(saved);
        const bal = await solanaService.getSolBalance(pubKey);
        setBalance(bal);
      }
    } catch (error) {
      console.error('❌ Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Connect wallet (manual entry for web)
  const connectWallet = useCallback(async (publicKeyStr: string) => {
    try {
      setLoading(true);
      
      // Verify wallet format
      const isValid = await solanaService.verifyWallet(publicKeyStr);
      if (!isValid) {
        throw new Error('Invalid public key format');
      }

      // Save to storage
      await AsyncStorage.setItem('solana_wallet', publicKeyStr);
      setWallet(publicKeyStr);
      setConnected(true);

      // Load balance
      const pubKey = new PublicKey(publicKeyStr);
      const bal = await solanaService.getSolBalance(pubKey);
      setBalance(bal);

      return { success: true, address: publicKeyStr };
    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
      return { success: false, error: String(error) };
    } finally {
      setLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('solana_wallet');
      setWallet(null);
      setConnected(false);
      setBalance(0);
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
    }
  }, []);

  return {
    wallet,
    connected,
    loading,
    balance,
    loadWallet,
    connectWallet,
    disconnectWallet,
  };
};
