import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

// Mock the navigation and all providers
jest.mock('@react-navigation/native', () => ({
    NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../context/AuthContext', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: () => ({ user: null, signIn: jest.fn(), signOut: jest.fn() }),
}));

jest.mock('../context/SessionContext', () => ({
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../theme/ThemeProvider', () => ({
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../navigation/AppNavigator', () => {
    const { View, Text } = require('react-native');
    return function MockAppNavigator() {
        return (
            <View testID="app-navigator">
                <Text>App Navigator</Text>
            </View>
        );
    };
});

describe('App', () => {
    it('renders without crashing', () => {
        const { getByTestId } = render(<App />);
        expect(getByTestId('app-navigator')).toBeTruthy();
    });
});
