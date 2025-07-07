import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useClipboard } from '../hooks/useClipboard';

interface CopyButtonProps {
  text: string;
  onCopy?: (success: boolean) => void;
  variant?: 'primary' | 'secondary' | 'small';
  style?: ViewStyle;
  textStyle?: TextStyle;
  showAlert?: boolean;
  children?: React.ReactNode;
}

/**
 * Reusable copy button component
 * PATTERN: Mirrors styling from HomeScreen.tsx button styles
 * PATTERN: Uses consistent color scheme (#FF6B6B)
 */
export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  onCopy,
  variant = 'secondary',
  style,
  textStyle,
  showAlert = true,
  children,
}) => {
  const { copyText, isLoading, wasRecentlyCopied } = useClipboard();
  
  const recentlyCopied = wasRecentlyCopied(text, 5); // 5 seconds

  const handlePress = async () => {
    if (isLoading) return;
    
    console.log('📋 CopyButton: Copying text:', text);
    
    const success = await copyText(text, showAlert);
    
    if (onCopy) {
      onCopy(success);
    }
  };

  // PATTERN: Follow existing button styling from HomeScreen.tsx
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button];
    
    if (variant === 'primary') {
      baseStyle.push(styles.primaryButton);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondaryButton);
    } else if (variant === 'small') {
      baseStyle.push(styles.smallButton);
    }
    
    if (isLoading) {
      baseStyle.push(styles.disabledButton);
    }
    
    if (recentlyCopied) {
      baseStyle.push(styles.successButton);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.buttonText];
    
    if (variant === 'secondary') {
      baseStyle.push(styles.secondaryButtonText);
    } else if (variant === 'small') {
      baseStyle.push(styles.smallButtonText);
    }
    
    if (recentlyCopied) {
      baseStyle.push(styles.successButtonText);
    }
    
    if (textStyle) {
      baseStyle.push(textStyle);
    }
    
    return baseStyle;
  };

  const getButtonText = () => {
    if (isLoading) return 'Copying...';
    if (recentlyCopied) return '✓ Copied!';
    return children || 'Copy';
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>
        {getButtonText()}
      </Text>
    </TouchableOpacity>
  );
};

// PATTERN: Mirror styles from HomeScreen.tsx
const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  smallButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    padding: 8,
    borderRadius: 8,
    minWidth: 60,
  },
  successButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#FF6B6B',
  },
  smallButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  successButtonText: {
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default CopyButton;