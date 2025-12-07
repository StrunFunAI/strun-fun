import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Supabase config
const supabaseUrl = 'https://yspbmyvazyroblgfuxuj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcGJteXZhenlyb2JsZ2Z1eHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NjQxODMsImV4cCI6MjA4MDQ0MDE4M30.Vs46lekcDOT61qoSg-j0Qh9yx9e-SkO9326Qelc2S28';

// Web için localStorage, Native için AsyncStorage
const storage = Platform.OS === 'web'
  ? {
      getItem: (key: string) => {
        if (typeof localStorage === 'undefined') return null;
        return localStorage.getItem(key);
      },
      setItem: (key: string, value: string) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
      },
      removeItem: (key: string) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
      },
    }
  : undefined; // Native'de AsyncStorage otomatik kullanılır

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
