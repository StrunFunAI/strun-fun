import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import bs58 from 'bs58';
import { Platform } from 'react-native';

const PROGRAM_ID = '9qpcky7wTGD3VHMMzVdaG2G2WrEi8SgpmVhhbyzJG8Mf';
const PRIVATE_KEY = '66fHAU5mHoGrBowCTAyw9c4qmW9bsj6yjZaExuiGAunX6jvtSQAfUzuL8FgfhYwKafBSk2PrR77ZmFNbpr3A66rC';

const USER_WALLET_PUBLIC_KEY = 'solana_wallet_public';
const USER_WALLET_PRIVATE_KEY = 'solana_wallet_private';

const isWeb = Platform.OS === 'web';
const localStorageRef: any = typeof globalThis !== 'undefined' ? (globalThis as any).localStorage : null;
const NativeAsyncStorage = !isWeb ? require('@react-native-async-storage/async-storage').default : null;

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      try {
        const value = localStorageRef?.getItem(key) ?? null;
        console.log(`📖 localStorage.getItem("${key}"):`, value ? value.slice(0, 20) + '...' : null);
        return value;
      } catch (error) {
        console.error(`📖 Error reading from localStorage:`, error);
        return null;
      }
    }

    if (NativeAsyncStorage) {
      try {
        const value = await NativeAsyncStorage.getItem(key);
        console.log(`📖 AsyncStorage.getItem("${key}"):`, value ? value.slice(0, 20) + '...' : null);
        return value;
      } catch (error) {
        console.error(`📖 Error reading from AsyncStorage:`, error);
        return null;
      }
    }

    return null;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      try {
        console.log(`💾 localStorage.setItem("${key}"):`, value.slice(0, 20) + '...');
        localStorageRef?.setItem(key, value);
        return;
      } catch (error) {
        console.error(`💾 Error writing to localStorage:`, error);
        return;
      }
    }

    if (NativeAsyncStorage) {
      try {
        console.log(`💾 AsyncStorage.setItem("${key}"):`, value.slice(0, 20) + '...');
        await NativeAsyncStorage.setItem(key, value);
      } catch (error) {
        console.error(`💾 Error writing to AsyncStorage:`, error);
        // Ignore write failures in dev
      }
    }
  },
  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      try {
        console.log(`🗑️ localStorage.removeItem("${key}")`);
        localStorageRef?.removeItem(key);
        return;
      } catch (error) {
        console.error(`🗑️ Error removing from localStorage:`, error);
        return;
      }
    }

    if (NativeAsyncStorage) {
      try {
        console.log(`🗑️ AsyncStorage.removeItem("${key}")`);
        await NativeAsyncStorage.removeItem(key);
      } catch (error) {
        console.error(`🗑️ Error removing from AsyncStorage:`, error);
        // Ignore
      }
    }
  },
};

export class SolanaWallet {
  private connection: Connection;
  private keypair: Keypair;
  public programId: PublicKey;

  constructor() {
    // Devnet bağlantısı - faster RPC endpoint
    // Using Anchor's devnet RPC which is more reliable
    this.connection = new Connection(
      'https://api.devnet.solana.com',
      { commitment: 'confirmed', wsEndpoint: undefined }
    );
    
    // Private key'i Keypair'e çevir
    const privateKeyBytes = bs58.decode(PRIVATE_KEY);
    this.keypair = Keypair.fromSecretKey(privateKeyBytes);
    
    // Program ID
    this.programId = new PublicKey(PROGRAM_ID);
    
    console.log('🔗 Solana connection initialized');
  }

  getPublicKey(): string {
    return this.keypair.publicKey.toBase58();
  }

  // Get keypair for signing transactions
  async getKeypair(): Promise<Keypair> {
    const storedWallet = await this.getStoredWalletKeys();
    if (storedWallet?.privateKey) {
      try {
        const privateKeyBytes = bs58.decode(storedWallet.privateKey);
        return Keypair.fromSecretKey(privateKeyBytes);
      } catch (error) {
        console.warn('Failed to parse stored wallet, generating new one.', error);
      }
    }

    const fallbackKeypair = Keypair.generate();
    await this.persistWallet(fallbackKeypair);
    return fallbackKeypair;
  }

  // Generate or return existing wallet for user
  async generateWallet(): Promise<string> {
    try {
      const wallet = await this.ensureUserWallet();
      return wallet.publicKey;
    } catch (error) {
      console.error('Error generating wallet:', error);
      throw error;
    }
  }

  private async getStoredWalletKeys(): Promise<{ publicKey: string; privateKey: string } | null> {
    console.log('🔍 Looking for stored wallet keys...');
    const [publicKey, privateKey] = await Promise.all([
      storage.getItem(USER_WALLET_PUBLIC_KEY),
      storage.getItem(USER_WALLET_PRIVATE_KEY),
    ]);

    if (publicKey && privateKey) {
      console.log('✅ Found stored wallet!');
      return { publicKey, privateKey };
    }

    console.log('❌ No stored wallet found');
    return null;
  }

  private async persistWallet(keypair: Keypair): Promise<void> {
    const publicKey = keypair.publicKey.toBase58();
    const privateKey = bs58.encode(keypair.secretKey);
    console.log('💾 Persisting wallet to storage:', publicKey);
    await Promise.all([
      storage.setItem(USER_WALLET_PUBLIC_KEY, publicKey),
      storage.setItem(USER_WALLET_PRIVATE_KEY, privateKey),
    ]);
    console.log('✅ Wallet persisted!');
  }

  async ensureUserWallet(): Promise<{ publicKey: string; privateKey: string }> {
    const stored = await this.getStoredWalletKeys();
    if (stored) {
      console.log('📍 Using stored wallet:', stored.publicKey);
      return stored;
    }

    console.log('🆕 Creating new wallet...');
    const newKeypair = Keypair.generate();
    console.log('📍 Generated new public key:', newKeypair.publicKey.toBase58());
    await this.persistWallet(newKeypair);
    return {
      publicKey: newKeypair.publicKey.toBase58(),
      privateKey: bs58.encode(newKeypair.secretKey),
    };
  }

  async getBalance(): Promise<number> {
    try {
      // Önce kullanıcının kendi wallet'ını kullan
      const wallet = await this.ensureUserWallet();
      console.log('💰 Getting balance for wallet:', wallet.publicKey);
      
      try {
        const publicKey = new PublicKey(wallet.publicKey);
        const balance = await this.connection.getBalance(publicKey);
        console.log('✅ Balance (Lamports):', balance, '(SOL):', balance / 1e9);
        return balance / 1e9; // Lamports to SOL
      } catch (connectionError) {
        console.warn('⚠️ Connection error fetching balance, returning 0:', connectionError);
        return 0;
      }
    } catch (error) {
      console.error('❌ Error getting balance:', error);
      return 0;
    }
  }

  // Devnet'te test için airdrop (sadece devnet'te çalışır)
  async requestAirdrop(amount: number = 1): Promise<string> {
    try {
      const wallet = await this.ensureUserWallet();
      const publicKey = new PublicKey(wallet.publicKey);
      
      console.log('🎁 Requesting airdrop for:', publicKey.toBase58(), 'Amount:', amount, 'SOL');
      
      const signature = await this.connection.requestAirdrop(
        publicKey,
        amount * 1e9 // SOL to lamports
      );
      
      console.log('⏳ Airdrop signature:', signature);
      await this.connection.confirmTransaction(signature, 'confirmed');
      console.log('✅ Airdrop confirmed!');
      
      return signature;
    } catch (error) {
      console.error('❌ Error requesting airdrop:', error);
      throw error;
    }
  }

  // SOL gönder
  async sendSOL(recipientAddress: string, amount: number): Promise<string> {
    try {
      const wallet = await this.ensureUserWallet();
      const storedPrivateKey = wallet.privateKey;
      
      if (!storedPrivateKey) {
        throw new Error('User wallet private key not found');
      }
      
      // Kullanıcının kendi keypair'ini kullan
      const privateKeyBytes = bs58.decode(storedPrivateKey);
      const fromKeypair = Keypair.fromSecretKey(privateKeyBytes);
      
      console.log('📤 Sending SOL from:', fromKeypair.publicKey.toBase58());
      console.log('📤 To:', recipientAddress);
      console.log('📤 Amount:', amount, 'SOL');
      
      const toPublicKey = new PublicKey(recipientAddress);
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports: amount * 1e9, // SOL to lamports
        })
      );
      
      const signature = await this.connection.sendTransaction(
        transaction,
        [fromKeypair],
        { skipPreflight: false }
      );
      
      console.log('⏳ Transaction signature:', signature);
      await this.connection.confirmTransaction(signature, 'confirmed');
      console.log('✅ Transaction confirmed!');
      
      return signature;
    } catch (error) {
      console.error('❌ Error sending SOL:', error);
      throw error;
    }
  }

  async signAndSendTransaction(transaction: Transaction): Promise<string> {
    try {
      const signature = await this.connection.sendTransaction(
        transaction,
        [this.keypair],
        { skipPreflight: false }
      );
      
      await this.connection.confirmTransaction(signature, 'confirmed');
      return signature;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }

  // Task tamamlama için ödül al
  async claimTaskReward(taskId: string, rewardAmount: number): Promise<string> {
    try {
      // Bu kısım Anchor program'ınızın instruction'ına göre düzenlenmelidir
      // Şimdilik basit bir örnek:
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.keypair.publicKey,
          toPubkey: this.keypair.publicKey, // Kendi cüzdanına gönder (test için)
          lamports: rewardAmount * 1e9,
        })
      );

      const signature = await this.signAndSendTransaction(transaction);
      return signature;
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  }

  // Task oluşturma
  async createTask(taskData: any): Promise<string> {
    try {
      // Anchor program instruction'ınız buraya gelecek
      // Şimdilik placeholder
      console.log('Creating task:', taskData);
      return 'mock-transaction-signature';
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Proof onaylama
  async verifyProof(proofId: string): Promise<string> {
    try {
      // Anchor program instruction'ınız buraya gelecek
      console.log('Verifying proof:', proofId);
      return 'mock-transaction-signature';
    } catch (error) {
      console.error('Error verifying proof:', error);
      throw error;
    }
  }
}

// Singleton instance
export const solanaWallet = new SolanaWallet();
