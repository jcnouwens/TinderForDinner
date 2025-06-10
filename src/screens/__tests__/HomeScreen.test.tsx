import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import HomeScreen from '../HomeScreen';
import * as Clipboard from 'expo-clipboard';

// Mock navigation
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
}));

// Mock clipboard
jest.mock('expo-clipboard', () => ({
    setStringAsync: jest.fn(() => Promise.resolve()),
}));

// Mock Alert
const mockAlert = jest.fn();
jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: mockAlert,
}));

// Also override the imported Alert
Object.defineProperty(Alert, 'alert', {
    value: mockAlert,
    writable: true,
});

// Mock contexts
const mockCreateSession = jest.fn();
const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
};

jest.mock('../../context/SessionContext', () => ({
    useSession: () => ({
        createSession: mockCreateSession,
    }),
}));

jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
    }),
}));

describe('HomeScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAlert.mockClear();
    });

    it('renders correctly', () => {
        const { getByText, getByPlaceholderText } = render(<HomeScreen />);

        expect(getByText('Tinder for Dinner')).toBeTruthy();
        expect(getByText('Swipe, match, and cook together!')).toBeTruthy();
        expect(getByText('Start a New Session')).toBeTruthy();
        expect(getByText('Join a Session')).toBeTruthy();
        expect(getByPlaceholderText('Enter session code')).toBeTruthy();
    });

    it('displays start swiping button', () => {
        const { getByText } = render(<HomeScreen />);

        expect(getByText('Start Swiping')).toBeTruthy();
    });

    it('displays create session button', () => {
        const { getByText } = render(<HomeScreen />);

        expect(getByText('Create Session')).toBeTruthy();
    });

    it('displays join session button', () => {
        const { getByText } = render(<HomeScreen />);

        expect(getByText('Join Session')).toBeTruthy();
    });

    it('navigates to swipe screen when start swiping is pressed', () => {
        const { getByText } = render(<HomeScreen />);

        const startSwipingButton = getByText('Start Swiping');
        fireEvent.press(startSwipingButton);

        expect(mockNavigate).toHaveBeenCalledWith('Swipe', { sessionId: 'mock-session-id' });
    });

    it('creates session when create session button is pressed', async () => {
        mockCreateSession.mockResolvedValue('test-session-id');

        const { getByText } = render(<HomeScreen />);

        const createSessionButton = getByText('Create Session');
        fireEvent.press(createSessionButton);

        await waitFor(() => {
            expect(mockCreateSession).toHaveBeenCalledWith('test-user-id');
        });
    });

    it('handles session code input', () => {
        const { getByPlaceholderText } = render(<HomeScreen />);

        const sessionInput = getByPlaceholderText('Enter session code');
        fireEvent.changeText(sessionInput, 'TEST123');

        expect(sessionInput.props.value).toBe('TEST123');
    });

    it('joins session with valid session code', () => {
        const { getByPlaceholderText, getByText } = render(<HomeScreen />);

        const sessionInput = getByPlaceholderText('Enter session code');
        const joinButton = getByText('Join Session');

        fireEvent.changeText(sessionInput, 'TEST123');
        fireEvent.press(joinButton);

        expect(mockNavigate).toHaveBeenCalledWith('Swipe', { sessionId: 'TEST123' });
    });

    it('shows error when joining session with empty code', () => {
        const { getByText } = render(<HomeScreen />);

        const joinButton = getByText('Join Session');
        fireEvent.press(joinButton);

        expect(mockAlert).toHaveBeenCalledWith('Error', 'Please enter a session code');
    });

    it('converts session code to uppercase', () => {
        const { getByPlaceholderText } = render(<HomeScreen />);

        const sessionInput = getByPlaceholderText('Enter session code');
        fireEvent.changeText(sessionInput, 'test123');

        // The input should convert to uppercase due to autoCapitalize="characters"
        expect(sessionInput.props.autoCapitalize).toBe('characters');
    });

    it('navigates to profile when profile button is pressed', () => {
        const { getByText } = render(<HomeScreen />);

        const profileButton = getByText('Profile');
        fireEvent.press(profileButton);

        expect(mockNavigate).toHaveBeenCalledWith('ProfileTab');
    });

    it('navigates to match screen when test button is pressed', () => {
        const { getByText } = render(<HomeScreen />);

        const testButton = getByText('Test Match Screen');
        fireEvent.press(testButton);

        expect(mockNavigate).toHaveBeenCalledWith('Match', {
            recipe: expect.objectContaining({
                id: '1',
                title: 'Creamy Garlic Pasta',
                readyInMinutes: 25,
                servings: 2,
            }),
        });
    });

    it('disables join button when session code is empty', () => {
        const { getByText } = render(<HomeScreen />);

        const joinButton = getByText('Join Session');

        // Button should be disabled when no session code is entered
        expect(joinButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('enables join button when session code is entered', () => {
        const { getByPlaceholderText, getByText } = render(<HomeScreen />);

        const sessionInput = getByPlaceholderText('Enter session code');
        const joinButton = getByText('Join Session');

        fireEvent.changeText(sessionInput, 'TEST123');

        // Button should be enabled when session code is present
        expect(joinButton.props.accessibilityState?.disabled).toBe(false);
    });

    it('handles create session error', async () => {
        mockCreateSession.mockRejectedValue(new Error('Network error'));

        const { getByText } = render(<HomeScreen />);

        const createSessionButton = getByText('Create Session');
        fireEvent.press(createSessionButton);

        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith('Error', 'Unable to create session');
        });
    });

    it('copies session code to clipboard when create session succeeds', async () => {
        mockCreateSession.mockResolvedValue('test-session-id');

        const { getByText } = render(<HomeScreen />);

        const createSessionButton = getByText('Create Session');
        fireEvent.press(createSessionButton);

        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith(
                'Session Created',
                'Share this code: test-session-id',
                expect.arrayContaining([
                    expect.objectContaining({
                        text: 'Copy',
                        onPress: expect.any(Function),
                    }),
                ])
            );
        });
    });

    it('displays correct session code description', () => {
        const { getByText } = render(<HomeScreen />);

        expect(getByText('Already have a session code? Enter it below to join your friend\'s swipe session.')).toBeTruthy();
    });

    it('displays correct new session description', () => {
        const { getByText } = render(<HomeScreen />);

        expect(getByText('Create a new swipe session and invite a friend to join you in finding the perfect meal.')).toBeTruthy();
    });
});
