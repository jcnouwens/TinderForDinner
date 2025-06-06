import '@testing-library/react-native/extend-expect';

// Mock Expo modules
jest.mock('expo-status-bar', () => ({
    StatusBar: 'StatusBar',
}));

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

jest.mock('expo-auth-session', () => ({
    makeRedirectUri: jest.fn(),
    useAuthRequest: jest.fn(),
    ResponseType: {
        Code: 'code',
    },
    AuthRequest: jest.fn(),
}));

jest.mock('expo-web-browser', () => ({
    openBrowserAsync: jest.fn(),
}));

// Mock React Native modules
jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native/Libraries/Components/View/View');
    return {
        Swipeable: View,
        DrawerLayout: View,
        State: {},
        ScrollView: View,
        Slider: View,
        Switch: View,
        TextInput: View,
        ToolbarAndroid: View,
        ViewPagerAndroid: View,
        DrawerLayoutAndroid: View,
        WebView: View,
        NativeViewGestureHandler: View,
        TapGestureHandler: View,
        FlingGestureHandler: View,
        ForceTouchGestureHandler: View,
        LongPressGestureHandler: View,
        PanGestureHandler: View,
        PinchGestureHandler: View,
        RotationGestureHandler: View,
        createNativeWrapper: jest.fn(),
        gestureHandlerRootHOC: jest.fn(),
        Directions: {},
    };
});

jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => { };
    return Reanimated;
});

// Mock styled-components
jest.mock('styled-components/native', () => {
    const React = require('react');
    const ReactNative = require('react-native');

    const styled = (Component: any) => (styles: any) => (props: any) =>
        React.createElement(Component, props);

    styled.View = styled(ReactNative.View);
    styled.Text = styled(ReactNative.Text);
    styled.TouchableOpacity = styled(ReactNative.TouchableOpacity);
    styled.ScrollView = styled(ReactNative.ScrollView);
    styled.Image = styled(ReactNative.Image);

    return {
        default: styled,
        ...styled,
    };
});

// Global test setup
global.__DEV__ = true;
