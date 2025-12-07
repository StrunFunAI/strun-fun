import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { sha256 } from 'js-sha256';
import { solanaWallet } from './solanaWallet';

// Program ID from declare_id!
const PROGRAM_ID = new PublicKey('9qpcky7wTGD3VHMMzVdaG2G2WrEi8SgpmVhhbyzJG8Mf');
const DEVNET_RPC = 'https://api.devnet.solana.com';

export interface TaskOnChain {
  creator: string;
  title: string;
  description: string;
  maxUsers: number;
  rewardPerUser: number;
  totalVotes: number;
  status: 'Open' | 'Closed';
}

export interface SubmissionOnChain {
  task: string;
  user: string;
  proofUrl: string;
  votes: number;
}

class SolanaProgram {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(DEVNET_RPC, 'confirmed');
  }

  // Get Task PDA
  async getTaskPDA(creatorPubkey: PublicKey): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('task'), creatorPubkey.toBuffer()],
      PROGRAM_ID
    );
  }

  // Get Submission PDA
  async getSubmissionPDA(userPubkey: PublicKey, taskPubkey: PublicKey): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('submission'), userPubkey.toBuffer(), taskPubkey.toBuffer()],
      PROGRAM_ID
    );
  }

  // Create Task on Solana
  async createTask(
    title: string,
    description: string,
    maxUsers: number,
    rewardPerUser: number // lamports
  ): Promise<{ signature: string; taskPDA: string }> {
    try {
      const keypair = await solanaWallet.getKeypair();
      if (!keypair) {
        throw new Error('No wallet keypair found');
      }

      const [taskPDA] = await this.getTaskPDA(keypair.publicKey);

      // Create instruction data
      const data = Buffer.concat([
        this.getInstructionDiscriminator('create_task'),
        this.encodeString(title),
        this.encodeString(description),
        this.encodeU32(maxUsers),
        this.encodeU64(rewardPerUser),
      ]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
          { pubkey: taskPDA, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data,
      });

      const transaction = new Transaction().add(instruction);
      transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = keypair.publicKey;

      // Sign and send
      transaction.sign(keypair);
      const signature = await this.connection.sendRawTransaction(transaction.serialize());
      await this.connection.confirmTransaction(signature);

      console.log('✅ [Solana] Task created:', signature);
      return { signature, taskPDA: taskPDA.toString() };
    } catch (error) {
      console.error('❌ [Solana] Create task error:', error);
      throw error;
    }
  }

  // Submit Proof
  async submitProof(
    taskPDA: string,
    proofUrl: string
  ): Promise<{ signature: string; submissionPDA: string }> {
    try {
      const keypair = await solanaWallet.getKeypair();
      if (!keypair) {
        throw new Error('No wallet keypair found');
      }

      const taskPubkey = new PublicKey(taskPDA);
      const [submissionPDA] = await this.getSubmissionPDA(keypair.publicKey, taskPubkey);

      const data = Buffer.concat([
        this.getInstructionDiscriminator('submit_proof'),
        this.encodeString(proofUrl),
      ]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
          { pubkey: taskPubkey, isSigner: false, isWritable: true },
          { pubkey: submissionPDA, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data,
      });

      const transaction = new Transaction().add(instruction);
      transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = keypair.publicKey;

      transaction.sign(keypair);
      const signature = await this.connection.sendRawTransaction(transaction.serialize());
      await this.connection.confirmTransaction(signature);

      console.log('✅ [Solana] Proof submitted:', signature);
      return { signature, submissionPDA: submissionPDA.toString() };
    } catch (error) {
      console.error('❌ [Solana] Submit proof error:', error);
      throw error;
    }
  }

  // Vote on Submission
  async voteSubmission(taskPDA: string, submissionPDA: string): Promise<string> {
    try {
      const keypair = await solanaWallet.getKeypair();
      if (!keypair) {
        throw new Error('No wallet keypair found');
      }

      const data = this.getInstructionDiscriminator('vote_submission');

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
          { pubkey: new PublicKey(taskPDA), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(submissionPDA), isSigner: false, isWritable: true },
        ],
        programId: PROGRAM_ID,
        data,
      });

      const transaction = new Transaction().add(instruction);
      transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = keypair.publicKey;

      transaction.sign(keypair);
      const signature = await this.connection.sendRawTransaction(transaction.serialize());
      await this.connection.confirmTransaction(signature);

      console.log('✅ [Solana] Vote submitted:', signature);
      return signature;
    } catch (error) {
      console.error('❌ [Solana] Vote error:', error);
      throw error;
    }
  }

  // Distribute Rewards (only creator can call)
  async distributeRewards(
    taskPDA: string,
    submissionPDA: string,
    receiverPubkey: string,
    vaultPDA: string
  ): Promise<string> {
    try {
      const keypair = await solanaWallet.getKeypair();
      if (!keypair) {
        throw new Error('No wallet keypair found');
      }

      const data = this.getInstructionDiscriminator('distribute_rewards');

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: new PublicKey(taskPDA), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(vaultPDA), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(receiverPubkey), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(submissionPDA), isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data,
      });

      const transaction = new Transaction().add(instruction);
      transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = keypair.publicKey;

      transaction.sign(keypair);
      const signature = await this.connection.sendRawTransaction(transaction.serialize());
      await this.connection.confirmTransaction(signature);

      console.log('✅ [Solana] Rewards distributed:', signature);
      return signature;
    } catch (error) {
      console.error('❌ [Solana] Distribute rewards error:', error);
      throw error;
    }
  }

  // Helper: Encode string
  private encodeString(str: string): Buffer {
    const encoded = Buffer.from(str, 'utf8');
    const length = Buffer.alloc(4);
    length.writeUInt32LE(encoded.length, 0);
    return Buffer.concat([length, encoded]);
  }

  private getInstructionDiscriminator(name: string): Buffer {
    const hash = sha256.array(`global:${name}`);
    return Buffer.from(hash.slice(0, 8));
  }

  // Helper: Encode u32
  private encodeU32(num: number): Buffer {
    const buf = Buffer.alloc(4);
    buf.writeUInt32LE(num, 0);
    return buf;
  }

  // Helper: Encode u64
  private encodeU64(num: number): Buffer {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(BigInt(num), 0);
    return buf;
  }

  // Get connection for balance checks etc
  getConnection(): Connection {
    return this.connection;
  }
}

export const solanaProgram = new SolanaProgram();
