import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Alert } from 'react-native';

// Configure WebBrowser for authentication
WebBrowser.maybeCompleteAuthSession();

// Google OAuth discovery configuration
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// Define the shape of our user object
type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  token: string;
};

// Define the shape of our auth context
type AuthContextData = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithInstagram: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        // In a real app, you would retrieve the user token from secure storage
        // and validate it with your backend
        const userToken = await SecureStore.getItemAsync('userToken');

        if (userToken) {
          // In a real app, you would verify the token with your backend
          // and fetch the user data
          // For now, we'll just simulate a user
          setUser({
            id: '1',
            name: 'Demo User',
            email: 'demo@example.com',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            token: userToken,
          });
        } else {
          // For development: Auto-create a demo user if none exists
          console.log('🔧 No existing user token, creating demo user for development');
          const demoUser = {
            id: 'demo-user-' + Date.now(),
            name: 'Demo User',
            email: 'demo@tinderfordinner.com',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            token: 'demo-token-' + Date.now(),
          };

          // Store the demo token
          await SecureStore.setItemAsync('userToken', demoUser.token);
          setUser(demoUser);
          console.log('✅ Demo user created:', demoUser);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // In a real app, you would call your authentication API here
      // For now, we'll simulate a successful login
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate API response
      const mockUser = {
        id: '1',
        name: 'Demo User',
        email: email,
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        token: 'mock-jwt-token',
      };

      // Store the user token in secure storage
      await SecureStore.setItemAsync('userToken', mockUser.token);

      // Update the user state
      setUser(mockUser);

    } catch (error) {
      console.error('Error signing in:', error);
      throw new Error('Failed to sign in. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);

      // For web development, use a simple localhost redirect
      const webRedirectUri = `${window.location.origin}`;
      
      console.log('Using redirect URI:', webRedirectUri);
      console.log('Google Client ID:', process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID);

      // Create auth URL
      const authUrl = `${discovery.authorizationEndpoint}?` +
        `client_id=${encodeURIComponent(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!)}&` +
        `redirect_uri=${encodeURIComponent(webRedirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('openid profile email')}&` +
        `access_type=offline&` +
        `prompt=select_account`;

      console.log('Auth URL:', authUrl);

      // Open auth session
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        webRedirectUri
      );

      console.log('Auth result:', result);

      if (result.type === 'success' && result.url) {
        // Parse the response URL to get the authorization code
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        
        if (code) {
          // In a real app, you would exchange the code for an access token
          // and get user info from Google's API
          // For now, we'll create a mock user with the code as token
          const mockUser = {
            id: 'google-' + Date.now(),
            name: 'Google User',
            email: 'google@example.com',
            avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
            token: code,
          };

          // Store the user token in secure storage
          await SecureStore.setItemAsync('userToken', mockUser.token);
          
          // Update the user state
          setUser(mockUser);
          
          Alert.alert('Success', 'Successfully signed in with Google!');
        } else {
          throw new Error('No authorization code received');
        }
      } else if (result.type === 'cancel') {
        throw new Error('User cancelled Google sign-in');
      } else {
        throw new Error('Google sign-in failed');
      }

    } catch (error) {
      console.error('Error signing in with Google:', error);
      Alert.alert('Sign In Error', 'Failed to sign in with Google. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Instagram
  const signInWithInstagram = async () => {
    try {
      setIsLoading(true);

      // In a real app, you would integrate with Instagram OAuth
      // For now, we'll simulate a successful login
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate API response
      const mockUser = {
        id: 'instagram-123',
        name: 'Instagram User',
        email: 'instagram@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        token: 'mock-instagram-token',
      };

      // Store the user token in secure storage
      await SecureStore.setItemAsync('userToken', mockUser.token);

      // Update the user state
      setUser(mockUser);

    } catch (error) {
      console.error('Error signing in with Instagram:', error);
      throw new Error('Failed to sign in with Instagram. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);

      // In a real app, you would call your registration API here
      // For now, we'll simulate a successful registration
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate API response
      const mockUser = {
        id: 'new-user-123',
        name: name,
        email: email,
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        token: 'mock-jwt-token',
      };

      // Store the user token in secure storage
      await SecureStore.setItemAsync('userToken', mockUser.token);

      // Update the user state
      setUser(mockUser);

    } catch (error) {
      console.error('Error signing up:', error);
      throw new Error('Failed to create an account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);

      // In a real app, you might want to revoke the token on the server

      // Remove the token from secure storage
      await SecureStore.deleteItemAsync('userToken');

      // Clear the user state
      setUser(null);

    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({
        ...user,
        ...userData,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signInWithGoogle,
        signInWithInstagram,
        signUp,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
