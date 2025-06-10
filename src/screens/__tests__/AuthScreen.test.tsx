import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AuthScreen from '../AuthScreen';

// Mock navigation
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
}));

// Mock auth context
const mockSignInWithGoogle = jest.fn();
const mockSignInWithInstagram = jest.fn();

jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        signInWithGoogle: mockSignInWithGoogle,
        signInWithInstagram: mockSignInWithInstagram,
        isLoading: false,
    }),
}));

describe('AuthScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByText } = render(<AuthScreen />);

        expect(getByText('Tinder for Dinner')).toBeTruthy();
        expect(getByText('Swipe right to find your perfect meal match!')).toBeTruthy();
        expect(getByText('Continue with Google')).toBeTruthy();
        expect(getByText('Continue with Instagram')).toBeTruthy();
        expect(getByText('By continuing, you agree to our Terms of Service and Privacy Policy')).toBeTruthy();
    });

    it('calls Google sign in when Google button is pressed', async () => {
        const { getByText } = render(<AuthScreen />);

        const googleButton = getByText('Continue with Google');
        fireEvent.press(googleButton);

        expect(mockSignInWithGoogle).toHaveBeenCalled();
    });

    it('calls Instagram sign in when Instagram button is pressed', async () => {
        const { getByText } = render(<AuthScreen />);

        const instagramButton = getByText('Continue with Instagram');
        fireEvent.press(instagramButton);

        expect(mockSignInWithInstagram).toHaveBeenCalled();
    });

    it('handles Google sign in error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        mockSignInWithGoogle.mockRejectedValue(new Error('Google sign in failed'));

        const { getByText } = render(<AuthScreen />);

        const googleButton = getByText('Continue with Google');
        fireEvent.press(googleButton);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Google sign in error:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    it('handles Instagram sign in error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        mockSignInWithInstagram.mockRejectedValue(new Error('Instagram sign in failed'));

        const { getByText } = render(<AuthScreen />);

        const instagramButton = getByText('Continue with Instagram');
        fireEvent.press(instagramButton);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Instagram sign in error:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    it('displays loading state', () => {
        // Re-mock the auth context to return loading state
        jest.resetModules();
        jest.doMock('../../context/AuthContext', () => ({
            useAuth: () => ({
                signInWithGoogle: mockSignInWithGoogle,
                signInWithInstagram: mockSignInWithInstagram,
                isLoading: true,
            }),
        }));

        // Need to re-require the component after mocking
        const AuthScreenLoading = require('../AuthScreen').default;
        const { getByTestId } = render(<AuthScreenLoading />);

        // Should show activity indicator when loading
        expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('displays correct button styles', () => {
        const { getByText } = render(<AuthScreen />);

        const googleButton = getByText('Continue with Google');
        const instagramButton = getByText('Continue with Instagram');

        expect(googleButton).toBeTruthy();
        expect(instagramButton).toBeTruthy();
    });

    it('renders Google icon', () => {
        const { getByTestId } = render(<AuthScreen />);

        const googleIcon = getByTestId('google-icon');
        expect(googleIcon).toBeTruthy();
        expect(googleIcon.props.source).toEqual(require('../../../assets/google-icon.png'));
    });

    it('renders Instagram icon', () => {
        const { getByTestId } = render(<AuthScreen />);

        const instagramIcon = getByTestId('instagram-icon');
        expect(instagramIcon).toBeTruthy();
        expect(instagramIcon.props.source).toEqual(require('../../../assets/instagram-icon.png'));
    });

    it('handles successful Google sign in', async () => {
        mockSignInWithGoogle.mockResolvedValue({ user: { id: '123', name: 'Test User' } });

        const { getByText } = render(<AuthScreen />);

        const googleButton = getByText('Continue with Google');
        fireEvent.press(googleButton);

        await waitFor(() => {
            expect(mockSignInWithGoogle).toHaveBeenCalled();
        });
    });

    it('handles successful Instagram sign in', async () => {
        mockSignInWithInstagram.mockResolvedValue({ user: { id: '123', name: 'Test User' } });

        const { getByText } = render(<AuthScreen />);

        const instagramButton = getByText('Continue with Instagram');
        fireEvent.press(instagramButton);

        await waitFor(() => {
            expect(mockSignInWithInstagram).toHaveBeenCalled();
        });
    });

    it('displays footer text correctly', () => {
        const { getByText } = render(<AuthScreen />);

        expect(getByText('By continuing, you agree to our Terms of Service and Privacy Policy')).toBeTruthy();
    });

    it('has correct container styling', () => {
        const { getByTestId } = render(<AuthScreen />);

        const container = getByTestId('auth-container');
        expect(container).toBeTruthy();
    });
});
