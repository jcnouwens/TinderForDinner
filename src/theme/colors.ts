// Define the Colors interface
export interface Colors {
  primary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
  };
  background: {
    default: string;
    paper: string;
    dark: string;
  };
  status: {
    success: string;
    info: string;
    warning: string;
    error: string;
  };
  common: {
    black: string;
    white: string;
    transparent: string;
  };
  border: {
    light: string;
    main: string;
    dark: string;
  };
  social: {
    google: string;
    facebook: string;
    instagram: string;
    twitter: string;
    pinterest: string;
  };
  gradients: {
    primary: string[];
    secondary: string[];
    sunset: string[];
    ocean: string[];
    forest: string[];
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
    extraLarge: string;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
    circle: string;
  };
}

// Primary colors
const primary = {
  main: '#FF6B6B',
  light: '#FF8E8E',
  dark: '#E64A4A',
  contrastText: '#FFFFFF',
};

// Secondary colors
const secondary = {
  main: '#4ECDC4',
  light: '#7FFFD4',
  dark: '#2CAE92',
  contrastText: '#000000',
};

// Text colors
const text = {
  primary: '#2D3436',
  secondary: '#636E72',
  disabled: '#B2BEC3',
  hint: '#95A5A6',
};

// Background colors
const background = {
  default: '#F5F6FA',
  paper: '#FFFFFF',
  dark: '#2D3436',
};

// Status colors
const status = {
  success: '#2ECC71',
  info: '#3498DB',
  warning: '#F1C40F',
  error: '#E74C3C',
};

// Common colors
const common = {
  black: '#000000',
  white: '#FFFFFF',
  transparent: 'transparent',
};

// Border colors
const border = {
  light: '#E0E0E0',
  main: '#BDBDBD',
  dark: '#9E9E9E',
};

// Social media brand colors
const social = {
  google: '#DB4437',
  facebook: '#4267B2',
  instagram: '#E1306C',
  twitter: '#1DA1F2',
  pinterest: '#E60023',
};

// Gradient colors
const gradients = {
  primary: ['#FF6B6B', '#FF8E8E'],
  secondary: ['#4ECDC4', '#7FFFD4'],
  sunset: ['#FF6B6B', '#FF8E53', '#FFD166'],
  ocean: ['#4ECDC4', '#45B7D1', '#3D9EEC'],
  forest: ['#2ECC71', '#48C9B0', '#5DADE2'],
};

// Shadow styles
const shadows = {
  small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  large: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  extraLarge: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
};

// Border radius
const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  extraLarge: 16,
  circle: '50%',
};

// Create the colors object with proper typing
const colors: Colors = {
  primary,
  secondary,
  text,
  background,
  status,
  common,
  border,
  social,
  gradients,
  shadows,
  borderRadius,
};

export default colors;
