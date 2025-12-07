import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { solanaWallet } from '../services/solanaWallet';
import api, { setAuthToken, clearAuthToken } from '../services/api';
import { supabase } from '../lib/supabase';

// Web ve Native için farklı storage
let AsyncStorage: any;

if (Platform.OS === 'web') {
  // Web için localStorage wrapper
  AsyncStorage = {
    async getItem(key: string): Promise<string | null> {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    async setItem(key: string, value: string): Promise<void> {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Storage error:', e);
      }
    },
    async removeItem(key: string): Promise<void> {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Storage error:', e);
      }
    },
  };
} else {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

// Web için conditional import
let Google: any;
let WebBrowser: any;

if (Platform.OS !== 'web') {
  Google = require('expo-auth-session/providers/google');
  WebBrowser = require('expo-web-browser');
  WebBrowser.maybeCompleteAuthSession();
}

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  walletAddress?: string;
  username?: string;
  bio?: string;
  profileImage?: string;
  // Backend fields (populated after first API call)
  backendId?: number;
  xp?: number;
  reputation_score?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (googleUserInfo?: any, credential?: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Native için OAuth
  const googleAuth = Platform.OS !== 'web' ? Google.useAuthRequest({
    clientId: '906127648686-0dfdvspkucf3lqe53dng0b67g5qf3e33.apps.googleusercontent.com',
    iosClientId: '906127648686-0dfdvspkucf3lqe53dng0b67g5qf3e33.apps.googleusercontent.com',
    androidClientId: '906127648686-0dfdvspkucf3lqe53dng0b67g5qf3e33.apps.googleusercontent.com',
  }) : [null, null, null];

  const [request, response, promptAsync] = googleAuth;

  // ✅ Supabase auth state değişikliklerini dinle
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      console.log('🔐 Supabase auth event:', _event);
      if (session?.access_token) {
        console.log('✅ Auth token set from session');
        setAuthToken(session.access_token);
      } else {
        console.log('❌ No session, clearing token');
        clearAuthToken();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    checkStoredUser();
  }, []);

  useEffect(() => {
    if (response?.type === 'success' && Platform.OS !== 'web') {
      const { authentication } = response;
      // TODO: Handle native Google OAuth
      console.log('Native Google OAuth success:', authentication);
    }
  }, [response]);

  const checkStoredUser = async () => {
    try {
      // Check Supabase session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('✅ Supabase session found');
        if (session.access_token) {
          setAuthToken(session.access_token);
        }
        
        // Try to fetch backend profile
        try {
          const profile = await api.users.getProfile();
          
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: profile.display_name || session.user.user_metadata?.name || session.user.email!.split('@')[0],
            picture: profile.avatar_url || session.user.user_metadata?.picture,
            walletAddress: profile.wallet_address,
            username: profile.display_name,
            backendId: profile.id,
            xp: profile.xp,
            reputation_score: profile.reputation_score,
          };
          
          setUser(user);
          await AsyncStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.error('Error fetching backend profile:', error);
          // Create minimal user from Supabase session
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
            picture: session.user.user_metadata?.picture,
          };
          setUser(user);
        }
      } else {
        clearAuthToken();
        // No Supabase session; drop any stale cached user
        await AsyncStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (googleUserInfo?: any, credential?: string) => {
    try {
      if (Platform.OS === 'web' && googleUserInfo) {
        console.log('🔐 Processing Google user:', googleUserInfo);

        // Use the credential parameter (JWT token) passed from LoginScreen
        const token = credential;

        if (!token) {
          throw new Error('No Google credential token provided');
        }

        // Create Supabase session with Google token
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: token,
        });

        if (error) {
          console.error('❌ Supabase auth error:', error);
          throw error;
        }

        if (!data.session) {
          throw new Error('No session created from Google credential');
        }

        console.log('✅ Supabase session created');

        if (data.session.access_token) {
          setAuthToken(data.session.access_token);
        }

        if (data.session.refresh_token) {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
        }

        // Generate Solana wallet if needed
        const walletAddress = await solanaWallet.generateWallet();
        console.log('🔑 Wallet created:', walletAddress);

        // Backend will automatically create/update user on first API call
        // Fetch user profile to trigger backend user creation
        try {
          const profile = await api.users.getProfile();

          const user: User = {
            id: data.session.user.id,
            email: data.session.user.email!,
            name: profile.display_name || googleUserInfo.name || data.session.user.email!.split('@')[0],
            picture: profile.avatar_url || googleUserInfo.picture,
            walletAddress: profile.wallet_address || walletAddress,
            username: profile.display_name,
            backendId: profile.id,
            xp: profile.xp,
            reputation_score: profile.reputation_score,
          };

          setUser(user);
          await AsyncStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.error('Error fetching backend profile:', error);
          // User will be created on next API call
          const user: User = {
            id: data.session.user.id,
            email: data.session.user.email!,
            name: googleUserInfo.name || data.session.user.email!.split('@')[0],
            picture: googleUserInfo.picture,
            walletAddress: walletAddress,
          };
          setUser(user);
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }
      } else if (Platform.OS !== 'web') {
        // Native için expo-auth-session
        await promptAsync();
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Dev/Test login with email (for localhost testing without Google OAuth)
  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('🔐 Dev login with email:', email);
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Supabase auth error:', error);
        throw error;
      }

      if (!data.session) {
        throw new Error('No session created');
      }

      console.log('✅ Supabase session created');

      if (data.session.access_token) {
        setAuthToken(data.session.access_token);
      }

      if (data.session.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      // Generate Solana wallet if needed
      const walletAddress = await solanaWallet.generateWallet();
      console.log('🔑 Wallet created:', walletAddress);

      try {
        const profile = await api.users.getProfile();

        const user: User = {
          id: data.session.user.id,
          email: data.session.user.email!,
          name: profile.display_name || data.session.user.email!.split('@')[0],
          picture: profile.avatar_url,
          walletAddress: profile.wallet_address || walletAddress,
          username: profile.display_name,
          backendId: profile.id,
          xp: profile.xp,
          reputation_score: profile.reputation_score,
        };

        setUser(user);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Error fetching backend profile:', error);
        const user: User = {
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.email!.split('@')[0],
          walletAddress: walletAddress,
        };
        setUser(user);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem('user');
      clearAuthToken();
      setUser(null);
      console.log('✅ User signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
