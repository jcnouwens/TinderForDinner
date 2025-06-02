import React, { createContext, useContext, ReactNode, useCallback, useState, useMemo } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { useColorScheme } from 'react-native';
import colors, { Colors } from './colors';

// Define the theme type
interface ThemeType {
  colors: Colors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
    circle: string;
  };
  typography: {
    h1: TypographyStyle;
    h2: TypographyStyle;
    h3: TypographyStyle;
    h4: TypographyStyle;
    h5: TypographyStyle;
    h6: TypographyStyle;
    subtitle1: TypographyStyle;
    subtitle2: TypographyStyle;
    body1: TypographyStyle;
    body2: TypographyStyle;
    button: TypographyStyle;
    caption: TypographyStyle;
    overline: TypographyStyle;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
    extraLarge: string;
  };
}

interface TypographyStyle {
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
}

// Define the light theme
const lightTheme: ThemeType = {
  colors: {
    ...colors,
    // Override any light theme specific colors here
    background: {
      ...colors.background,
      default: '#F5F6FA',
      paper: '#FFFFFF',
    },
    text: {
      ...colors.text,
      primary: '#2D3436',
      secondary: '#636E72',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: colors.borderRadius,
  typography: {
    h1: { fontSize: 96, fontWeight: '300', lineHeight: 1.2, letterSpacing: -1.5 },
    h2: { fontSize: 60, fontWeight: '300', lineHeight: 1.2, letterSpacing: -0.5 },
    h3: { fontSize: 48, fontWeight: '400', lineHeight: 1.2 },
    h4: { fontSize: 34, fontWeight: '400', lineHeight: 1.2, letterSpacing: 0.25 },
    h5: { fontSize: 24, fontWeight: '400', lineHeight: 1.2 },
    h6: { fontSize: 20, fontWeight: '500', lineHeight: 1.2, letterSpacing: 0.15 },
    subtitle1: { fontSize: 16, fontWeight: '400', lineHeight: 1.5, letterSpacing: 0.15 },
    subtitle2: { fontSize: 14, fontWeight: '500', lineHeight: 1.5, letterSpacing: 0.1 },
    body1: { fontSize: 16, fontWeight: '400', lineHeight: 1.5, letterSpacing: 0.5 },
    body2: { fontSize: 14, fontWeight: '400', lineHeight: 1.5, letterSpacing: 0.25 },
    button: { fontSize: 14, fontWeight: '500', lineHeight: 1.14, letterSpacing: 0.4, textTransform: 'uppercase' },
    caption: { fontSize: 12, fontWeight: '400', lineHeight: 1.5, letterSpacing: 0.4 },
    overline: { fontSize: 10, fontWeight: '400', lineHeight: 1.5, letterSpacing: 1.5, textTransform: 'uppercase' },
  },
  shadows: colors.shadows,
};

// Define the dark theme
const darkTheme: ThemeType = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: {
      ...lightTheme.colors.background,
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      ...lightTheme.colors.text,
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
      hint: 'rgba(255, 255, 255, 0.3)',
    },
  },
};

// Create a context for the theme
interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

// Custom hook to use the theme
const useTheme = () => useContext(ThemeContext);

// Theme provider component
const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');
  
  const theme = isDark ? darkTheme : lightTheme;
  
  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const contextValue = React.useMemo(() => ({
    theme,
    isDark,
    toggleTheme,
  }), [theme, isDark, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

// Export the theme provider and hook
export { ThemeProvider, useTheme, lightTheme, darkTheme };

// Export the theme type
export type Theme = ThemeType;
