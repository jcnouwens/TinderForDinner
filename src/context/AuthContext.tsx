import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

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
      
      // In a real app, you would integrate with Google Sign-In
      // For now, we'll simulate a successful login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate API response
      const mockUser = {
        id: 'google-123',
        name: 'Google User',
        email: 'google@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        token: 'mock-google-token',
      };
      
      // Store the user token in secure storage
      await SecureStore.setItemAsync('userToken', mockUser.token);
      
      // Update the user state
      setUser(mockUser);
      
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw new Error('Failed to sign in with Google. Please try again.');
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
