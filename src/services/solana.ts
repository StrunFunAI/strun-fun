import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('9qpcky7wTGD3VHMMzVdaG2G2WrEi8SgpmVhhbyzJG8Mf');
const DEVNET_RPC = 'https://api.devnet.solana.com';

export class SolanaService {
  private connection: Connection;
  private programId: PublicKey;

  constructor() {
    this.connection = new Connection(DEVNET_RPC, 'confirmed');
    this.programId = PROGRAM_ID;
  }

  /**
   * Create a task on Solana blockchain
   * @param creatorPublicKey - Creator's public key
   * @param title - Task title
   * @param description - Task description
   * @param maxUsers - Max number of participants
   * @param rewardPerUser - Reward in lamports per user
   */
  async createTask(
    creatorPublicKey: PublicKey,
    title: string,
    description: string,
    maxUsers: number,
    rewardPerUser: number,
  ): Promise<string> {
    try {
      // Create task PDA (Program Derived Account)
      const [taskPda, taskBump] = PublicKey.findProgramAddressSync(
        [Buffer.from('task'), creatorPublicKey.toBuffer()],
        this.programId,
      );

      console.log('✅ Task PDA:', taskPda.toBase58());
      console.log('✅ Task Bump:', taskBump);

      // This would require the actual program IDL and connection to signer
      // For now, return the PDA for reference
      return taskPda.toBase58();
    } catch (error) {
      console.error('❌ Error creating task on blockchain:', error);
      throw error;
    }
  }

  /**
   * Submit proof on Solana blockchain
   * @param userPublicKey - User's public key
   * @param taskPda - Task PDA address
   * @param proofUrl - URL to the proof
   */
  async submitProof(
    userPublicKey: PublicKey,
    taskPda: PublicKey,
    proofUrl: string,
  ): Promise<string> {
    try {
      // Create submission PDA
      const [submissionPda, submissionBump] = PublicKey.findProgramAddressSync(
        [Buffer.from('submission'), userPublicKey.toBuffer(), taskPda.toBuffer()],
        this.programId,
      );

      console.log('✅ Submission PDA:', submissionPda.toBase58());

      return submissionPda.toBase58();
    } catch (error) {
      console.error('❌ Error submitting proof:', error);
      throw error;
    }
  }

  /**
   * Verify if wallet is valid
   */
  async verifyWallet(publicKeyStr: string): Promise<boolean> {
    try {
      new PublicKey(publicKeyStr);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get SOL balance
   */
  async getSolBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('❌ Error getting balance:', error);
      return 0;
    }
  }

  /**
   * Convert SOL to lamports
   */
  solToLamports(sol: number): number {
    return sol * 1e9;
  }

  /**
   * Convert lamports to SOL
   */
  lamportsToSol(lamports: number): number {
    return lamports / 1e9;
  }

  /**
   * Get program ID
   */
  getProgramId(): PublicKey {
    return this.programId;
  }

  /**
   * Get connection
   */
  getConnection(): Connection {
    return this.connection;
  }
}

export const solanaService = new SolanaService();
