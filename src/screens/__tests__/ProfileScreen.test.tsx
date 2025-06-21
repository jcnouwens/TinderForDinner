import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import ProfileScreen from '../ProfileScreen';

type Navigation = StackNavigationProp<RootStackParamList, 'Profile'>;

// Use the global mock functions from jest.setup.js
const mockNavigate = global.mockNavigate;
const mockReset = global.mockReset;
const mockGoBack = global.mockGoBack;

// Mock Alert.alert
const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => ({}));

// Setup mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Reset the navigation mock functions
  mockNavigate.mockClear();
  mockReset.mockClear();
  mockGoBack.mockClear();
});

describe('ProfileScreen', () => {
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
    // Check if the avatar source is an object with a uri property
    expect(avatar.props.source).toHaveProperty('uri', 'https://randomuser.me/api/portraits/men/1.jpg');
  });

  it('displays preference switches', () => {
    const { getByText } = render(<ProfileScreen />);

    expect(getByText('Enable Notifications')).toBeTruthy();
    expect(getByText('Dark Mode')).toBeTruthy();
    expect(getByText('Vegetarian')).toBeTruthy();
    expect(getByText('Vegan')).toBeTruthy();
    expect(getByText('Gluten Free')).toBeTruthy();
  });

  it('handles logout button press', () => {
    const { getByText } = render(<ProfileScreen />);
    const logoutButton = getByText('Logout');
    
    fireEvent.press(logoutButton);
    
    // Check if Alert.alert was called
    expect(Alert.alert).toHaveBeenCalledWith(
      'Logout',
      'Are you sure you want to logout?',
      expect.any(Array)
    );
    
    // Get the alert buttons from the last call
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const alertButtons = alertCall[2] as Array<{ text: string; onPress?: () => void }>;
    
    // Find and call the Logout button's onPress handler
    const logoutButtonAction = alertButtons.find(btn => btn.text === 'Logout');
    if (logoutButtonAction && logoutButtonAction.onPress) {
      logoutButtonAction.onPress();
      
      // Check if navigation.reset was called with the correct arguments
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } else {
      // Fail the test if the logout button wasn't found
      throw new Error('Logout button not found in alert');
    }
  });

  it('toggles preference switches', () => {
    const { getByTestId } = render(<ProfileScreen />);
    
    // Test notifications toggle
    const notificationsSwitch = getByTestId('notifications-switch');
    expect(notificationsSwitch).toBeTruthy();
    fireEvent(notificationsSwitch, 'onValueChange', false);
    expect(notificationsSwitch.props.value).toBe(false);
    
    // Test dark mode toggle
    const darkModeSwitch = getByTestId('darkMode-switch');
    expect(darkModeSwitch).toBeTruthy();
    fireEvent(darkModeSwitch, 'onValueChange', true);
    expect(darkModeSwitch.props.value).toBe(true);
    
    // Test dietary preferences
    const vegetarianSwitch = getByTestId('vegetarian-switch');
    expect(vegetarianSwitch).toBeTruthy();
    fireEvent(vegetarianSwitch, 'onValueChange', true);
    expect(vegetarianSwitch.props.value).toBe(true);
  });

  it('displays all action buttons', () => {
    const { getByText } = render(<ProfileScreen />);
    expect(getByText('Swipe History')).toBeTruthy();
    expect(getByText('Saved Recipes')).toBeTruthy();
    expect(getByText('Help & Support')).toBeTruthy();
    expect(getByText('Logout')).toBeTruthy();
  });

  it('displays version and edit button', () => {
    const { getByText, getByTestId } = render(<ProfileScreen />);
    expect(getByText(/Tinder for Dinner v\d+\.\d+\.\d+/)).toBeTruthy();
    expect(getByTestId('edit-avatar-button')).toBeTruthy();
  });
});
