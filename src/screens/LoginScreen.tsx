import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Linking, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { theme } from '../styles/theme';

export default function LoginScreen() {
  const { signIn, signInWithEmail } = useAuth();
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log('✅ Google Login Success:', credentialResponse);
    if (credentialResponse.credential) {
      const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      console.log('📧 User info:', decoded);
      (signIn as any)(decoded, credentialResponse.credential);
    }
  };

  const handleGoogleError = () => {
    console.error('❌ Google Login Failed');
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo - logo.png image */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>STRUN</Text>
          <Text style={styles.tagline}>Create, Earn, Share</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="camera" size={24} color="#8B5CF6" />
            <Text style={styles.featureText}>Complete Tasks</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="wallet" size={24} color="#EC4899" />
            <Text style={styles.featureText}>Earn Tokens</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="people" size={24} color="#8B5CF6" />
            <Text style={styles.featureText}>Join Community</Text>
          </View>
        </View>

        {/* Login Buttons */}
        {Platform.OS === 'web' ? (
          <View style={styles.loginContainer}>
            <View style={styles.googleButton}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </View>
            
            <Text style={styles.hint}>
              Sign in with your Google account
            </Text>

            <TouchableOpacity 
              onPress={() => setShowEmailLogin(!showEmailLogin)}
              style={styles.emailToggleButton}
            >
              <Text style={styles.emailToggleText}>
                {showEmailLogin ? '✕ Close' : '✉️ Sign in with Email'}
              </Text>
            </TouchableOpacity>

            {showEmailLogin && (
              <View style={styles.emailForm}>
                <TextInput
                  style={styles.emailInput}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#888"
                />
                <TouchableOpacity
                  onPress={() => {
                    signInWithEmail(email, password).catch(err => {
                      console.error('Email login failed:', err);
                    });
                  }}
                  style={styles.emailSubmitButton}
                >
                  <Text style={styles.emailSubmitText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity onPress={signIn} style={styles.loginButton}>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginGradient}
            >
              <Image
                source={{ uri: 'https://www.google.com/favicon.ico' }}
                style={styles.googleIcon}
              />
              <Text style={styles.loginText}>Sign in with Gmail</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text style={styles.terms}>
          By signing in, you agree to our{' '}
          <Text
            style={styles.termsLink}
            onPress={() => Linking.openURL('https://strun.fun/terms')}
          >
            Terms of Service
          </Text>
          {' '}and{' '}
          <Text
            style={styles.termsLink}
            onPress={() => Linking.openURL('https://strun.fun/privacy')}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  features: {
    marginBottom: 60,
    gap: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  loginContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  googleButton: {
    marginBottom: 8,
  },
  hint: {
    color: theme.colors.text.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  loginButton: {
    width: '100%',
    marginBottom: 20,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: theme.borderRadius.full,
    gap: 12,
  },
  googleIcon: {
    width: 24,
    height: 24,
  },
  loginText: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  terms: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  emailToggleButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  emailToggleText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emailForm: {
    width: '100%',
    marginTop: 12,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    gap: 12,
  },
  emailInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 6,
    color: '#FFF',
    padding: 12,
    fontSize: 14,
  },
  emailSubmitButton: {
    marginTop: 8,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 6,
  },
  emailSubmitText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
