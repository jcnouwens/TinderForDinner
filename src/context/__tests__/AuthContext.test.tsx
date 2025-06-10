import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock AsyncStorage
const mockAsyncStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Test component that uses the auth context
const TestComponent = () => {
    const { user, isLoading, signInWithGoogle, signInWithInstagram, signOut } = useAuth();

    return (
        <>
            <Text testID="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</Text>
            <Text testID="user-state">{user ? `User: ${user.name}` : 'No User'}</Text>
        </>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('provides initial auth state', async () => {
        mockAsyncStorage.getItem.mockResolvedValue(null);

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(getByTestId('loading-state')).toHaveTextContent('Not Loading');
            expect(getByTestId('user-state')).toHaveTextContent('No User');
        });
    });

    it('loads user from storage on initialization', async () => {
        const storedUser = JSON.stringify({
            id: '123',
            name: 'John Doe',
            email: 'john@example.com'
        });

        mockAsyncStorage.getItem.mockResolvedValue(storedUser);

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(getByTestId('user-state')).toHaveTextContent('User: John Doe');
        });
    });

    it('handles storage errors gracefully', async () => {
        mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(getByTestId('user-state')).toHaveTextContent('No User');
            expect(consoleSpy).toHaveBeenCalledWith('Error loading user from storage:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    it('shows loading state initially', () => {
        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Initially should be loading
        expect(getByTestId('loading-state')).toHaveTextContent('Loading');
    });

    it('provides auth methods', () => {
        const TestMethodsComponent = () => {
            const { signInWithGoogle, signInWithInstagram, signOut } = useAuth();

            return (
                <>
                    <Text testID="google-method">{typeof signInWithGoogle}</Text>
                    <Text testID="instagram-method">{typeof signInWithInstagram}</Text>
                    <Text testID="signout-method">{typeof signOut}</Text>
                </>
            );
        };

        const { getByTestId } = render(
            <AuthProvider>
                <TestMethodsComponent />
            </AuthProvider>
        );

        expect(getByTestId('google-method')).toHaveTextContent('function');
        expect(getByTestId('instagram-method')).toHaveTextContent('function');
        expect(getByTestId('signout-method')).toHaveTextContent('function');
    });

    it('throws error when used outside provider', () => {
        const TestComponentWithoutProvider = () => {
            try {
                useAuth();
                return <Text>No Error</Text>;
            } catch (error) {
                return <Text testID="error">Error: {(error as Error).message}</Text>;
            }
        };

        const { getByTestId } = render(<TestComponentWithoutProvider />);

        expect(getByTestId('error')).toHaveTextContent('Error: useAuth must be used within an AuthProvider');
    });

    it('handles invalid JSON in storage', async () => {
        mockAsyncStorage.getItem.mockResolvedValue('invalid json');
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(getByTestId('user-state')).toHaveTextContent('No User');
            expect(consoleSpy).toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });
});
