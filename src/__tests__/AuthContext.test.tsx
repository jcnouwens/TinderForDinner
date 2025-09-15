import React from 'react';
import { render, waitFor, act, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

// Test component that uses auth context
const TestComponent = () => {
  const { user, isLoading, signIn, signInWithGoogle, signInWithInstagram, signOut, updateUser } = useAuth();

  if (isLoading) {
    return <Text testID="loading">Loading...</Text>;
  }

  return (
    <>
      <Text testID="user-status">{user ? `Logged in as ${user.name}` : 'Not logged in'}</Text>
      <Text testID="user-email">{user?.email || 'No email'}</Text>
      <Text testID="user-token">{user?.token || 'No token'}</Text>
      <TouchableOpacity testID="sign-in-email" onPress={() => signIn('test@example.com', 'password')}>
        <Text>Sign in with Email</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="sign-in-google" onPress={() => signInWithGoogle()}>
        <Text>Sign in with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="sign-in-instagram" onPress={() => signInWithInstagram()}>
        <Text>Sign in with Instagram</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="sign-out" onPress={() => signOut()}>
        <Text>Sign out</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="update-user" onPress={() => updateUser({ name: 'Updated Name' })}>
        <Text>Update User</Text>
      </TouchableOpacity>
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial state and token loading', () => {
    it('should initialize with loading state', () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);
      
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(getByTestId('loading')).toBeTruthy();
    });

    it('should load existing user token from secure store', async () => {
      const mockToken = 'existing-token-123';
      mockSecureStore.getItemAsync.mockResolvedValue(mockToken);

      const { getByTestId, getByText } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('user-status')).toBeTruthy();
      });

      expect(getByText('Logged in as Demo User')).toBeTruthy();
      expect(getByText('demo@example.com')).toBeTruthy();
      expect(getByText(mockToken)).toBeTruthy();
    });

    it('should create demo user when no token exists', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);
      mockSecureStore.setItemAsync.mockResolvedValue();

      const { getByTestId, getByText } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('user-status')).toBeTruthy();
      });

      expect(getByText(/Logged in as Demo User/)).toBeTruthy();
      expect(getByText('demo@tinderfordinner.com')).toBeTruthy();
      expect(mockSecureStore.setItemAsync).toHaveBeenCalled();
    });

    it('should handle secure store errors gracefully', async () => {
      mockSecureStore.getItemAsync.mockRejectedValue(new Error('SecureStore error'));

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('user-status')).toBeTruthy();
      });

      expect(console.error).toHaveBeenCalledWith('Error loading user from storage:', expect.any(Error));
    });
  });

  describe('Google authentication', () => {
    it('should sign in with Google successfully', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);
      mockSecureStore.setItemAsync.mockResolvedValue();

      const { getByTestId, getByText } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('sign-in-google')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByTestId('sign-in-google'));
        // Wait for the promise to resolve
        await new Promise(resolve => setTimeout(resolve, 1100));
      });

      await waitFor(() => {
        expect(getByText('Logged in as Google User')).toBeTruthy();
      });

      expect(getByText('google@example.com')).toBeTruthy();
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('userToken', 'mock-google-token');
    });

    it('should handle Google sign in errors', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);
      mockSecureStore.setItemAsync.mockRejectedValue(new Error('Google auth error'));

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('sign-in-google')).toBeTruthy();
      });

      // Clear console.error calls from initialization
      jest.clearAllMocks();
      jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await act(async () => {
          fireEvent.press(getByTestId('sign-in-google'));
          // Wait for the promise to resolve
          await new Promise(resolve => setTimeout(resolve, 1100));
        });
      } catch (error) {
        // Expected error, ignore
      }

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error signing in with Google:', expect.any(Error));
      });
    });
  });

  describe('Sign out', () => {
    it('should sign out user successfully', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('existing-token');
      mockSecureStore.deleteItemAsync.mockResolvedValue();

      const { getByTestId, getByText } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByText(/Logged in as/)).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByTestId('sign-out'));
      });

      await waitFor(() => {
        expect(getByText('Not logged in')).toBeTruthy();
      });

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('userToken');
    });

    it('should handle sign out errors', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('existing-token');
      mockSecureStore.deleteItemAsync.mockRejectedValue(new Error('Delete error'));

      const { getByTestId, getByText } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByText(/Logged in as/)).toBeTruthy();
      });

      // Clear console.error calls from initialization
      jest.clearAllMocks();
      jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await act(async () => {
          fireEvent.press(getByTestId('sign-out'));
        });
      } catch (error) {
        // Expected error, ignore
      }

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error signing out:', expect.any(Error));
      });
    });
  });

  describe('User updates', () => {
    it('should update user data', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('existing-token');

      const { getByTestId, getByText } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByText('Logged in as Demo User')).toBeTruthy();
      });

      act(() => {
        fireEvent.press(getByTestId('update-user'));
      });

      expect(getByText('Logged in as Updated Name')).toBeTruthy();
    });

    it('should not update user when no user exists', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const { getByTestId, getByText } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByText('Not logged in')).toBeTruthy();
      });

      act(() => {
        fireEvent.press(getByTestId('update-user'));
      });

      expect(getByText('Not logged in')).toBeTruthy();
    });
  });
});