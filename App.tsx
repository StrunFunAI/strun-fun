import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, Text, Platform } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { theme } from './src/styles/theme';

import LoginScreen from './src/screens/LoginScreen';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import PermissionScreen from './src/screens/PermissionScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TasksScreen from './src/screens/TasksScreen';
import CameraScreen from './src/screens/CameraScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import ProofUploadScreen from './src/screens/ProofUploadScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import FeedScreen from './src/screens/FeedScreen';
import SubmitProofScreen from './src/screens/SubmitProofScreen';
import AccountSettingsScreen from './src/screens/AccountSettingsScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import MyTasksScreen from './src/screens/MyTasksScreen';
import ExploreScreen from './src/screens/ExploreScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Marketplace') {
            iconName = focused ? 'bag' : 'bag-outline';
          } else if (route.name === 'Camera') {
            // Premium merkez buton - enhanced gradient + shadow
            return (
              <View style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 30,
                borderWidth: 4,
                borderColor: '#0D0D0F',
              }}>
                <View style={{
                  width: 62,
                  height: 62,
                  borderRadius: 31,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: focused ? '#8B5CF6' : '#6366F1',
                }}>
                  <View style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: focused ? '#A78BFA' : '#8B5CF6',
                  }}>
                    <Ionicons name="add-circle" size={32} color="#fff" />
                  </View>
                </View>
              </View>
            );
          } else if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // Enhanced icon wrapper with better styling
          return (
            <View style={{
              width: 48,
              height: 48,
              backgroundColor: focused ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              borderRadius: 24,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: focused ? 2 : 0,
              borderColor: focused ? 'rgba(139, 92, 246, 0.5)' : 'transparent',
            }}>
              <Ionicons name={iconName} size={24} color={focused ? '#8B5CF6' : color} />
            </View>
          );
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          paddingHorizontal: 0,
          marginHorizontal: 0,
          marginBottom: 0,
          borderRadius: 0,
          borderWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          backgroundColor: 'transparent',
          borderRadius: 0,
          paddingVertical: 0,
        },
        tabBarIconStyle: {
          backgroundColor: 'transparent',
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text.primary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ 
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <View style={{
              width: 40,
              height: 40,
              backgroundColor: focused ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={focused ? theme.colors.accent : color} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Marketplace" 
        component={MarketplaceScreen}
        options={{ 
          title: 'Marketplace',
          tabBarIcon: ({ focused, color }) => (
            <View style={{
              width: 40,
              height: 40,
              backgroundColor: focused ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name={focused ? 'bag' : 'bag-outline'} size={24} color={focused ? theme.colors.accent : color} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityScreen}
        options={{ 
          title: 'Community',
          tabBarIcon: ({ focused, color }) => (
            <View style={{
              width: 40,
              height: 40,
              backgroundColor: focused ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={24} color={focused ? theme.colors.accent : color} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <View style={{
              width: 44,
              height: 44,
              backgroundColor: focused ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              borderRadius: 22,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Debug için
    console.log('App mounted, Platform:', Platform.OS);
    console.log('User:', user);
    console.log('Loading:', loading);
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text.primary, marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.error, fontSize: 16, padding: 20 }}>{error}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text.primary,
          cardStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {!user ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : null}
        
        {/* Main App */}
        <Stack.Screen 
          name="Main" 
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TaskDetail" 
          component={TaskDetailScreen}
          options={{ title: 'Task Details' }}
        />
        <Stack.Screen 
          name="ProofUpload" 
          component={ProofUploadScreen}
          options={{ title: 'Upload Proof' }}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen}
          options={{ headerShown: false }}
        />
          <Stack.Screen 
            name="Feed" 
            component={FeedScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="SubmitProof" 
            component={SubmitProofScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="MyTasks" 
            component={MyTasksScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AccountSettings" 
            component={AccountSettingsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="CreateTask" 
            component={DashboardScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Explore" 
            component={ExploreScreen}
            options={{ headerShown: false }}
          />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(Platform.OS === 'web'); // No font loading needed for web

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Font loading can be done for native
      setFontsLoaded(true);
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const AppContent = () => (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );

  return Platform.OS === 'web' ? (
    <GoogleOAuthProvider clientId="906127648686-0dfdvspkucf3lqe53dng0b67g5qf3e33.apps.googleusercontent.com">
      <AppContent />
    </GoogleOAuthProvider>
  ) : (
    <AppContent />
  );
}
