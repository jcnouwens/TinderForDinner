import { StyleSheet, Dimensions, Platform, TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { Theme } from './ThemeProvider';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Checks if the current device is an iPhone X or newer
 */
export const isIphoneX = (): boolean => {
  const dimen = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTV &&
    (dimen.height === 780 ||
      dimen.width === 780 ||
      dimen.height === 812 ||
      dimen.width === 812 ||
      dimen.height === 844 ||
      dimen.width === 844 ||
      dimen.height === 896 ||
      dimen.width === 896 ||
      dimen.height === 926 ||
      dimen.width === 926)
  );
};

/**
 * Gets the status bar height based on the device and platform
 * @param safe - Whether to return the safe area inset height (for iPhone X and above)
 */
export const getStatusBarHeight = (safe: boolean = false): number => {
  return Platform.select({
    ios: isIphoneX() ? (safe ? 44 : 30) : 20,
    android: 0,
    default: 0,
  }) as number;
};

/**
 * Gets the bottom safe area inset (for iPhone X and above)
 */
export const getBottomSpace = (): number => {
  return isIphoneX() ? 34 : 0;
};

/**
 * Type for StyleSheet styles with proper typing
 */
type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Creates a StyleSheet style reference from the given object with proper theming support
 */
export const createStyles = <T extends NamedStyles<T> | NamedStyles<any>>(
  styles: T | ((theme: Theme) => T)
) => {
  return (theme: Theme) => {
    const stylesWithTheme = typeof styles === 'function' ? styles(theme) : styles;
    return StyleSheet.create(stylesWithTheme as any);
  };
};

/**
 * Common styles used throughout the app with theming support
 */
const getCommonStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  flex: {
    flex: 1,
  },
  flexCenter: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  rowBetween: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  rowAround: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    alignItems: 'center' as const,
  },
  rowCenter: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  center: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  shadow: {
    shadowColor: theme.colors.common.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    ...(theme.shadows?.medium ? { shadow: theme.shadows.medium } : {}),
  },
  section: {
    marginVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.main,
    color: theme.colors.text.primary,
  },
  button: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  buttonText: {
    color: theme.colors.primary.contrastText,
    fontWeight: '600',
  },
  buttonOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
  },
  buttonOutlinedText: {
    color: theme.colors.primary.main,
  },
  buttonTextOnly: {
    backgroundColor: 'transparent',
  },
  buttonTextOnlyText: {
    color: theme.colors.primary.main,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});


/**
 * Gets text style based on theme and variant
 */
export const getTextStyle = (theme: Theme, variant: keyof Theme['typography'], style: TextStyle = {}) => {
  return {
    ...theme.typography[variant],
    color: theme.colors.text.primary,
    ...style,
  };
};

/**
 * Gets button style based on theme and variant
 */
export const getButtonStyle = (
  theme: Theme,
  variant: 'contained' | 'outlined' | 'text' = 'contained',
  style: ViewStyle = {}
) => {
  const baseStyle = {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  };

  switch (variant) {
    case 'outlined':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary.main,
        ...style,
      };
    case 'text':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        ...style,
      };
    case 'contained':
    default:
      return {
        ...baseStyle,
        backgroundColor: theme.colors.primary.main,
        ...style,
      };
  }
};

/**
 * Gets button text style based on theme and variant
 */
export const getButtonTextStyle = (
  theme: Theme,
  variant: 'contained' | 'outlined' | 'text' = 'contained',
  style: TextStyle = {}
): TextStyle => {
  const baseStyle: TextStyle = {
    ...theme.typography.button,
    textAlign: 'center',
  };

  switch (variant) {
    case 'contained':
      return {
        ...baseStyle,
        color: theme.colors.primary.contrastText,
        ...style,
      };
    case 'outlined':
    case 'text':
      return {
        ...baseStyle,
        color: theme.colors.primary.main,
        ...style,
      };
    default:
      return {
        ...baseStyle,
        ...style,
      };
  }
};

/**
 * Gets input style with error state support
 */
export const getInputStyle = (
  theme: Theme,
  error: boolean = false,
  style: ViewStyle & { color?: string } = {}
): ViewStyle & { color: string } => ({
  backgroundColor: theme.colors.background.paper,
  borderWidth: 1,
  borderColor: error ? theme.colors.status.error : theme.colors.border.main,
  borderRadius: theme.borderRadius.medium,
  padding: theme.spacing.sm,
  color: theme.colors.text.primary,
  ...(theme.typography.body1 as ViewStyle),
  ...style,
});
