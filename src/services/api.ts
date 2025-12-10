import { supabase } from '../lib/supabase';

// API URL - production backend
const API_URL = process.env.REACT_APP_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : 'https://strun-backend-production.up.railway.app/api');

// For debugging connection issues:
console.log('🌐 API URL:', API_URL);

type BackendUser = {
  id: string;
  email?: string;
  display_name?: string;
  username?: string;
};

// Storage helpers (minimal - mainly for backend user ID)
const storage = {
  user: null as BackendUser | null,
  
  setUser(user: BackendUser | null) {
    storage.user = user;
  },

  getUser() {
    return storage.user;
  },

  getUserId() {
    return storage.user?.id ?? null;
  },

  clearUser() {
    storage.user = null;
  },

  clear() {
    storage.clearUser();
  },
};

let authToken: string | null = null;

const authTokenStore = {
  set(token: string | null) {
    authToken = token;
  },
  get() {
    return authToken;
  },
  clear() {
    authToken = null;
  },
};

export const setAuthToken = (token: string | null) => authTokenStore.set(token);
export const clearAuthToken = () => authTokenStore.clear();

const requireUserId = (): string => {
  const id = storage.getUserId();
  if (!id) {
    throw new Error('User is not authenticated');
  }
  return id;
};

// API helper function - uses Supabase token
async function apiRequest(endpoint: string, options: any = {}) {
  // Always try to get fresh token from Supabase session first
  let token: string | null = null;
  
  try {
    // Step 1: Try to get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      token = session.access_token;
      authTokenStore.set(token);
      console.log('✅ Using fresh Supabase token from session');
    } else if (sessionError) {
      console.warn('⚠️ Session error:', sessionError);
    }
    
    // Step 2: If no session, try refresh
    if (!token) {
      console.log('🔄 Attempting to refresh Supabase session...');
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('❌ Session refresh failed:', refreshError);
        // If refresh fails, try cached token
        token = authTokenStore.get();
        if (!token) {
          throw new Error('Authentication required - no valid token available');
        }
        console.log('⚠️ Using cached token (session refresh failed)');
      } else if (refreshedSession?.access_token) {
        token = refreshedSession.access_token;
        authTokenStore.set(token);
        console.log('✅ Session refreshed successfully');
      }
    }
  } catch (error: any) {
    console.error('❌ Token retrieval error:', error.message);
    // Fallback to cached token
    token = authTokenStore.get();
    if (!token) {
      throw error;
    }
  }

  if (!token) {
    throw new Error('No authentication token available');
  }

  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    const contentType = response.headers.get('content-type') || '';

    // Check if response has content before parsing
    const text = await response.text();
    let data;
    
    if (contentType.includes('application/json')) {
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('❌ [API] JSON parse error:', text.substring(0, 200));
        throw new Error('Invalid JSON response from server');
      }
    } else {
      console.error('❌ [API] Non-JSON response:', text.substring(0, 200));
      throw new Error('Server returned non-JSON response. Is the API running on http://localhost:3000?');
    }
    
    if (!response.ok) {
      const message = data.error || 'API request failed';
      console.error(`❌ [API] ${options.method || 'GET'} ${url}: ${response.status} - ${message}`);
      throw new Error(message);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ [API] Error:', error.message);
    throw error;
  }
}

// Auth API - Deprecated: use Supabase Auth directly
export const authAPI = {
  async login(email: string, googleCredential?: string) {
    throw new Error('Use Supabase Auth for login');
  },
  
  async register(email: string, username: string) {
    throw new Error('Use Supabase Auth for registration');
  },
  
  logout() {
    storage.clear();
  },
};

// Users API
export const usersAPI = {
  async getProfile() {
    const profile = await apiRequest('/users/profile');
    // Cache backend user for routes that need user id
    storage.setUser(profile);
    return profile;
  },
  
  async getUserById(userId: number) {
    return apiRequest(`/users/${userId}`);
  },
  
  async updateProfile(updates: { 
    username?: string;
    display_name?: string; 
    bio?: string; 
    avatar_url?: string;
    cover_photo_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    linkedin_url?: string;
  }) {
    const profile = await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    storage.setUser(profile);
    return profile;
  },
  
  async getXPHistory() {
    return apiRequest('/users/profile/xp-history');
  },

  async disconnectWallet() {
    return apiRequest('/users/wallet/disconnect', {
      method: 'POST',
    });
  },

  async getUserSolanaAddress() {
    return apiRequest('/users/solana-address');
  },
};

// Tasks API
export const tasksAPI = {
  async getTasks(filters: any = {}) {
    const params = new URLSearchParams(filters);
    return apiRequest(`/tasks?${params}`);
  },
  
  async getTask(id: string) {
    return apiRequest(`/tasks/${id}`);
  },

  async getTaskById(id: string) {
    return apiRequest(`/tasks/${id}`);
  },
  
  async createTask(taskData: any) {
    return apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },
  
  async acceptTask(taskId: string) {
    return apiRequest(`/tasks/${taskId}/accept`, {
      method: 'POST',
    });
  },
  
  async submitProof(taskId: string, proofData: any) {
    return apiRequest(`/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify(proofData),
    });
  },
  
  async getUserTasks() {
    const userId = requireUserId();
    return apiRequest(`/tasks?created_by=${userId}`);
  },

  async getAcceptedTasks() {
    return apiRequest('/tasks/user/accepted');
  },
};

// Transactions API
export const transactionsAPI = {
  async getTransactions() {
    return apiRequest('/transactions');
  },
  
  async createTransaction(transactionData: any) {
    return apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },
};

// Leaderboard API
export const leaderboardAPI = {
  async getLeaderboard(limit: number = 20) {
    return apiRequest(`/leaderboard?limit=${limit}`);
  },
};

// Proofs API (Social Feed)
export const proofsAPI = {
  async getProofs(limit: number = 20, offset: number = 0) {
    return apiRequest(`/proofs?limit=${limit}&offset=${offset}`);
  },
  
  async getProof(id: number) {
    return apiRequest(`/proofs/${id}`);
  },
  
  async createProof(proofData: any) {
    // Backend reads user from the Supabase token; do not send user_id from client
    return apiRequest('/proofs', {
      method: 'POST',
      body: JSON.stringify({ ...proofData }),
    });
  },

  async getTaskProofs(taskId: number) {
    return apiRequest(`/proofs/task/${taskId}`);
  },
  
  async submitProof(proofData: any) {
    return apiRequest('/proofs', {
      method: 'POST',
      body: JSON.stringify({ ...proofData }),
    });
  },
  
  async likeProof(proofId: number) {
    return apiRequest(`/proofs/${proofId}/like`, {
      method: 'POST',
    });
  },
  
  async shareProof(proofId: number) {
    return apiRequest(`/proofs/${proofId}/share`, {
      method: 'POST',
    });
  },
  
  async repostProof(proofId: number) {
    return apiRequest(`/proofs/${proofId}/repost`, {
      method: 'POST',
    });
  },
};

// Rewards API
export const rewardsAPI = {
  async fundTaskVault(taskId: string, rewardSol: number) {
    return apiRequest('/rewards/fund', {
      method: 'POST',
      body: JSON.stringify({
        task_id: taskId,
        reward_sol: rewardSol,
      }),
    });
  },

  async distributeRewards(taskId: string) {
    return apiRequest(`/rewards/distribute/${taskId}`, {
      method: 'POST',
    });
  },

  async getPayouts(taskId: string) {
    return apiRequest(`/rewards/payouts/${taskId}`, {
      method: 'GET',
    });
  },

  async getWinners(taskId: string) {
    return apiRequest(`/rewards/winners/${taskId}`, {
      method: 'GET',
    });
  },
};

// AI API
export const aiAPI = {
  async generateTasks(payload: { category: string; lat: number; lng: number; locationName?: string; prompt?: string }) {
    return apiRequest('/ai/generate-tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// Proof vote API
export const voteAPI = {
  async voteProof(proofId: number) {
    return apiRequest(`/proofs/${proofId}/vote`, {
      method: 'POST',
    });
  },
};

// Solana API
const solanaAPI = {
  async checkContractStatus() {
    const response = await fetch(`${API_URL}/solana/status`);
    return response.json();
  },

  async getWalletBalance(wallet: string) {
    const response = await fetch(`${API_URL}/solana/balance/${wallet}`);
    return response.json();
  },

  async pingNetwork() {
    const response = await fetch(`${API_URL}/solana/ping`);
    return response.json();
  },
};

export default {
  auth: authAPI,
  users: usersAPI,
  tasks: tasksAPI,
  proofs: proofsAPI,
  transactions: transactionsAPI,
  leaderboard: leaderboardAPI,
  ai: aiAPI,
  vote: voteAPI,
  rewards: rewardsAPI,
  solana: solanaAPI,
  storage,
};

// Named exports for better tree-shaking
export {
  authAPI as auth,
  usersAPI as users,
  tasksAPI as tasks,
  proofsAPI as proofs,
  transactionsAPI as transactions,
  leaderboardAPI as leaderboard,
  aiAPI as ai,
  rewardsAPI as rewards,
  solanaAPI as solana,
  storage,
};
