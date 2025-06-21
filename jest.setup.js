import 'react-native-gesture-handler/jestSetup';
import { jest } from '@jest/globals';

// Mock react-native components properly for jest-expo compatibility
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  return {
    ...RN,
    // Ensure these core components are properly defined
    View: 'View',
    Text: 'Text',
    ScrollView: 'ScrollView',
    TouchableOpacity: 'TouchableOpacity',
    Image: 'Image',
    TextInput: 'TextInput',
    Switch: 'Switch',
    ActivityIndicator: 'ActivityIndicator',
    FlatList: 'FlatList',
    Alert: {
      ...RN.Alert,
      alert: jest.fn(),
    },
  };
});

// Create global mock functions that can be accessed by tests
const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();

// Make them globally available
global.mockNavigate = mockNavigate;
global.mockDispatch = mockDispatch;
global.mockGoBack = mockGoBack;
global.mockReset = mockReset;

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      dispatch: mockDispatch,
      goBack: mockGoBack,
      reset: mockReset,
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// StyleSheet.flatten should be handled by jest-expo preset

// Mock other common dependencies
jest.mock('expo-secure-store', () => ({}));
jest.mock('@supabase/supabase-js', () => ({}));

// Mock expo modules
jest.mock('expo-constants', () => ({}));
jest.mock('expo-font', () => ({}));

// Mock vector icons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  Ionicons: 'Ionicons',
  FontAwesome: 'FontAwesome',
}));

// Mock Alert
const mockAlert = jest.fn();
const Alert = {
  alert: mockAlert,
};

global.Alert = Alert;
