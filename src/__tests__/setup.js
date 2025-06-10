// Global test setup
import 'react-native-gesture-handler/jestSetup';

// Mock React Native modules
jest.mock('react-native', () => {
    return {
        // Core UI components
        View: 'View',
        Text: 'Text',
        Image: 'Image',
        ScrollView: 'ScrollView',
        TouchableOpacity: 'TouchableOpacity',
        TouchableHighlight: 'TouchableHighlight',
        TextInput: 'TextInput',
        Button: 'Button',
        FlatList: 'FlatList',
        SafeAreaView: 'SafeAreaView',

        // StyleSheet
        StyleSheet: {
            create: jest.fn((styles) => styles),
        },

        // Platform
        Platform: {
            OS: 'ios',
            select: jest.fn((obj) => obj.ios),
        },

        // Dimensions
        Dimensions: {
            get: jest.fn(() => ({
                width: 375,
                height: 812,
            })),
        },

        // Alert
        Alert: {
            alert: jest.fn(),
        },

        // Share
        Share: {
            share: jest.fn(),
        },

        // Linking
        Linking: {
            openURL: jest.fn(),
        },

        // Animated
        Animated: {
            View: 'Animated.View',
            Text: 'Animated.Text',
            Image: 'Animated.Image',
            ScrollView: 'Animated.ScrollView',
            FlatList: 'Animated.FlatList',
            timing: jest.fn(() => ({
                start: jest.fn(),
            })),
            spring: jest.fn(() => ({
                start: jest.fn(),
            })),
            Value: jest.fn(() => ({
                setValue: jest.fn(),
                addListener: jest.fn(),
                removeListener: jest.fn(),
                interpolate: jest.fn(() => ({
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                })),
            })),
            ValueXY: jest.fn(() => ({
                setValue: jest.fn(),
                addListener: jest.fn(),
                removeListener: jest.fn(),
                getLayout: jest.fn(() => ({
                    top: 0,
                    left: 0,
                })),
            })),
            createAnimatedComponent: jest.fn(() => 'AnimatedComponent'),
        },

        // PanResponder
        PanResponder: {
            create: jest.fn(() => ({
                panHandlers: {},
            })),
        },

        // Gesture components
        PanGestureHandler: 'PanGestureHandler',
        State: {},

        // Clipboard
        Clipboard: {
            setString: jest.fn(),
            getString: jest.fn(),
        },
    };
});

// Mock React Native modules that need specific implementations
jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

jest.mock('expo-clipboard', () => ({
    setStringAsync: jest.fn(),
}));

jest.mock('expo-linking', () => ({
    openURL: jest.fn(),
}));

// Mock Expo vector icons
jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');

    return {
        Ionicons: React.forwardRef(({ name, ...props }, ref) =>
            React.createElement(Text, { ...props, ref, testID: props.testID }, name)
        ),
        MaterialIcons: React.forwardRef(({ name, ...props }, ref) =>
            React.createElement(Text, { ...props, ref, testID: props.testID }, name)
        ),
    };
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
        push: jest.fn(),
        replace: jest.fn(),
    }),
    useRoute: () => ({
        params: {},
    }),
    useFocusEffect: jest.fn(),
}));

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => {
    const RN = jest.requireActual('react-native');
    return {
        ...RN,
        PanGestureHandler: RN.View,
        State: { BEGAN: 'BEGAN', FAILED: 'FAILED', ACTIVE: 'ACTIVE', END: 'END' },
        Directions: {},
    };
});

// Mock React Native reanimated
jest.mock('react-native-reanimated', () => {
    return {
        default: {
            call: jest.fn(),
            View: jest.fn(() => null),
            Value: jest.fn(),
            event: jest.fn(),
            add: jest.fn(),
            eq: jest.fn(),
            set: jest.fn(),
            cond: jest.fn(),
            interpolate: jest.fn(),
        },
        useSharedValue: jest.fn(() => ({ value: 0 })),
        useAnimatedStyle: jest.fn(() => ({})),
        useDerivedValue: jest.fn(),
        useAnimatedGestureHandler: jest.fn(),
        useAnimatedScrollHandler: jest.fn(),
        useWorkletCallback: jest.fn(),
        withTiming: jest.fn((value) => value),
        withSpring: jest.fn((value) => value),
        withDecay: jest.fn((value) => value),
        runOnJS: jest.fn((fn) => fn),
        runOnUI: jest.fn((fn) => fn),
    };
});

// Mock worklet functions
global.__reanimatedWorkletInit = jest.fn();
global.__reanimatedWorkletHash = jest.fn();
