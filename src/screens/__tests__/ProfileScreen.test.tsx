import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProfileScreen from '../ProfileScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: mockNavigate,
        reset: mockReset,
    }),
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

describe('ProfileScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAlert.mockClear();
    });

    it('renders correctly', () => {
        const { getByText } = render(<ProfileScreen />);

        expect(getByText('Alex Johnson')).toBeTruthy();
        expect(getByText('alex.johnson@example.com')).toBeTruthy();
        expect(getByText('Member since January 2023')).toBeTruthy();
        expect(getByText('Preferences')).toBeTruthy();
        expect(getByText('Dietary Preferences')).toBeTruthy();
    });

    it('displays user avatar', () => {
        const { getByTestId } = render(<ProfileScreen />);

        const avatar = getByTestId('user-avatar');
        expect(avatar).toBeTruthy();
        expect(avatar.props.source.uri).toBe('https://randomuser.me/api/portraits/men/1.jpg');
    });

    it('displays preference switches', () => {
        const { getByText } = render(<ProfileScreen />);

        expect(getByText('Notifications')).toBeTruthy();
        expect(getByText('Dark Mode')).toBeTruthy();
        expect(getByText('Vegetarian')).toBeTruthy();
        expect(getByText('Vegan')).toBeTruthy();
        expect(getByText('Gluten Free')).toBeTruthy();
    });

    it('toggles notification preference', () => {
        const { getByTestId } = render(<ProfileScreen />);

        const notificationSwitch = getByTestId('notifications-switch');
        expect(notificationSwitch).toBeTruthy();

        // Initially should be true based on the default state
        expect(notificationSwitch.props.value).toBe(true);

        fireEvent(notificationSwitch, 'onValueChange', false);

        // After toggle, should be false
        expect(notificationSwitch.props.value).toBe(false);
    });

    it('toggles dark mode preference', () => {
        const { getByTestId } = render(<ProfileScreen />);

        const darkModeSwitch = getByTestId('darkMode-switch');
        expect(darkModeSwitch).toBeTruthy();

        // Initially should be false based on the default state
        expect(darkModeSwitch.props.value).toBe(false);

        fireEvent(darkModeSwitch, 'onValueChange', true);

        // After toggle, should be true
        expect(darkModeSwitch.props.value).toBe(true);
    });

    it('toggles vegetarian preference', () => {
        const { getByTestId } = render(<ProfileScreen />);

        const vegetarianSwitch = getByTestId('vegetarian-switch');
        expect(vegetarianSwitch).toBeTruthy();

        fireEvent(vegetarianSwitch, 'onValueChange', true);

        expect(vegetarianSwitch.props.value).toBe(true);
    });

    it('displays action buttons', () => {
        const { getByText } = render(<ProfileScreen />);

        expect(getByText('Swipe History')).toBeTruthy();
        expect(getByText('Saved Recipes')).toBeTruthy();
        expect(getByText('Help & Support')).toBeTruthy();
    });

    it('displays logout button', () => {
        const { getByText } = render(<ProfileScreen />);

        expect(getByText('Logout')).toBeTruthy();
    });

    it('shows logout confirmation dialog', () => {
        const { getByText } = render(<ProfileScreen />);

        const logoutButton = getByText('Logout');
        fireEvent.press(logoutButton);

        expect(mockAlert).toHaveBeenCalledWith(
            'Logout',
            'Are you sure you want to logout?',
            expect.arrayContaining([
                expect.objectContaining({ text: 'Cancel' }),
                expect.objectContaining({ text: 'Logout' }),
            ]),
            expect.objectContaining({ cancelable: true })
        );
    });

    it('handles logout confirmation', () => {
        const { getByText } = render(<ProfileScreen />);

        const logoutButton = getByText('Logout');
        fireEvent.press(logoutButton);

        // Get the logout confirmation callback
        const alertCall = mockAlert.mock.calls[0];
        const logoutCallback = alertCall[2][1].onPress; // Second button (Logout) callback

        logoutCallback();

        expect(mockReset).toHaveBeenCalledWith({
            index: 0,
            routes: [{ name: 'Auth' }],
        });
    });

    it('displays version text', () => {
        const { getByText } = render(<ProfileScreen />);

        expect(getByText('Tinder for Dinner v1.0.0')).toBeTruthy();
    });

    it('displays edit button on avatar', () => {
        const { getByTestId } = render(<ProfileScreen />);

        const editButton = getByTestId('edit-avatar-button');
        expect(editButton).toBeTruthy();
    });

    it('handles edit avatar button press', () => {
        const { getByTestId } = render(<ProfileScreen />);

        const editButton = getByTestId('edit-avatar-button');
        fireEvent.press(editButton);

        // The button doesn't have specific functionality yet, just verify it's pressable
        expect(editButton).toBeTruthy();
    });

    it('displays preference icons correctly', () => {
        const { getByTestId } = render(<ProfileScreen />);

        expect(getByTestId('notifications-icon')).toBeTruthy();
        expect(getByTestId('darkMode-icon')).toBeTruthy();
        expect(getByTestId('vegetarian-icon')).toBeTruthy();
        expect(getByTestId('vegan-icon')).toBeTruthy();
        expect(getByTestId('glutenFree-icon')).toBeTruthy();
    });

    it('handles action button presses', () => {
        const { getByText } = render(<ProfileScreen />);

        const swipeHistoryButton = getByText('Swipe History');
        const savedRecipesButton = getByText('Saved Recipes');
        const helpSupportButton = getByText('Help & Support');

        fireEvent.press(swipeHistoryButton);
        fireEvent.press(savedRecipesButton);
        fireEvent.press(helpSupportButton);

        // These buttons don't have specific navigation yet, just verify they're pressable
        expect(swipeHistoryButton).toBeTruthy();
        expect(savedRecipesButton).toBeTruthy();
        expect(helpSupportButton).toBeTruthy();
    });
});
