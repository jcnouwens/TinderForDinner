import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { copyToClipboard, getFromClipboard } from '../utils/clipboardUtils';

/**
 * Custom hook for clipboard operations with loading state and user feedback
 * Follows existing patterns from context hooks in the codebase
 */
export function useClipboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastCopied, setLastCopied] = useState<string | null>(null);
  const [lastCopiedAt, setLastCopiedAt] = useState<Date | null>(null);

  /**
   * Copy text to clipboard with user feedback
   * PATTERN: Follow existing Alert.alert patterns from HomeScreen.tsx
   */
  const copyText = useCallback(async (text: string, showAlert: boolean = true) => {
    if (isLoading) return false;

    setIsLoading(true);
    
    try {
      console.log('🔄 useClipboard: Copying text to clipboard...');
      
      // PATTERN: Use utility function for consistency
      const result = await copyToClipboard(text);
      
      if (result.success) {
        setLastCopied(text);
        setLastCopiedAt(new Date());
        
        console.log('✅ useClipboard: Copy successful');
        
        // PATTERN: Show user feedback with Alert.alert
        if (showAlert) {
          Alert.alert('Copied!', result.message || 'Successfully copied to clipboard');
        }
        
        return true;
      } else {
        console.error('❌ useClipboard: Copy failed:', result.error);
        
        if (showAlert) {
          Alert.alert('Copy Failed', result.error || 'Failed to copy to clipboard');
        }
        
        return false;
      }
    } catch (error) {
      console.error('❌ useClipboard: Unexpected error:', error);
      
      if (showAlert) {
        Alert.alert('Error', 'An unexpected error occurred while copying');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  /**
   * Copy session code with specific feedback message
   * Follows patterns for session code handling
   */
  const copySessionCode = useCallback(async (sessionCode: string, showAlert: boolean = true) => {
    console.log('🎯 useClipboard: Copying session code:', sessionCode);
    
    const success = await copyText(sessionCode, false);
    
    if (success && showAlert) {
      // PATTERN: Session-specific feedback message
      Alert.alert(
        'Session Code Copied!',
        `Session code "${sessionCode}" has been copied to your clipboard. Share it with friends to invite them!`,
        [{ text: 'OK' }]
      );
    }
    
    return success;
  }, [copyText]);

  /**
   * Read current clipboard content
   */
  const readClipboard = useCallback(async () => {
    setIsLoading(true);
    
    try {
      console.log('📖 useClipboard: Reading clipboard content...');
      
      const content = await getFromClipboard();
      
      console.log('✅ useClipboard: Read successful');
      
      return content;
    } catch (error) {
      console.error('❌ useClipboard: Read failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check if we recently copied this text
   */
  const wasRecentlyCopied = useCallback((text: string, withinSeconds: number = 30) => {
    if (!lastCopied || !lastCopiedAt) return false;
    
    const timeDiff = (new Date().getTime() - lastCopiedAt.getTime()) / 1000;
    return lastCopied === text && timeDiff <= withinSeconds;
  }, [lastCopied, lastCopiedAt]);

  return {
    // State
    isLoading,
    lastCopied,
    lastCopiedAt,
    
    // Actions
    copyText,
    copySessionCode,
    readClipboard,
    
    // Utilities
    wasRecentlyCopied,
  };
}