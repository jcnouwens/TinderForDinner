import * as Clipboard from 'expo-clipboard';
import { ClipboardResult } from '../types';

/**
 * Enhanced clipboard utilities for session code management
 * Follows existing patterns from clipboardUtils.ts with session-specific features
 */

/**
 * Copy session code to clipboard with enhanced feedback
 * Includes validation and user-friendly messaging
 */
export async function copySessionCode(sessionCode: string): Promise<ClipboardResult> {
  try {
    if (!sessionCode) {
      return {
        success: false,
        error: 'No session code provided'
      };
    }

    if (sessionCode.length < 3) {
      return {
        success: false,
        error: 'Invalid session code format'
      };
    }

    console.log('📋 Copying session code to clipboard:', sessionCode);
    
    await Clipboard.setStringAsync(sessionCode);
    
    console.log('✅ Session code successfully copied to clipboard');
    
    return {
      success: true,
      message: 'Session code copied! Share it with friends to join.'
    };
  } catch (error) {
    console.error('❌ Failed to copy session code:', error);
    
    return {
      success: false,
      error: 'Could not copy session code. Please try again.'
    };
  }
}

/**
 * Get session code from clipboard with validation
 * Validates that clipboard content looks like a session code
 */
export async function getSessionCodeFromClipboard(): Promise<string | null> {
  try {
    console.log('📋 Reading session code from clipboard...');
    
    const clipboardContent = await Clipboard.getStringAsync();
    
    if (!clipboardContent) {
      console.log('⚠️ Clipboard is empty');
      return null;
    }

    // Basic validation for session code format (e.g., HAPPY-PASTA-42)
    const sessionCodePattern = /^[A-Z]+-[A-Z]+-\d+$/;
    if (sessionCodePattern.test(clipboardContent.trim())) {
      console.log('✅ Valid session code found in clipboard:', clipboardContent.trim());
      return clipboardContent.trim();
    }

    console.log('ℹ️ Clipboard content does not match session code format');
    return null;
  } catch (error) {
    console.error('❌ Failed to read from clipboard:', error);
    return null;
  }
}

/**
 * Check if clipboard contains a valid session code
 */
export async function hasSessionCodeInClipboard(): Promise<boolean> {
  try {
    const sessionCode = await getSessionCodeFromClipboard();
    return sessionCode !== null;
  } catch (error) {
    console.error('❌ Failed to check clipboard for session code:', error);
    return false;
  }
}

/**
 * Format session code for sharing with additional context
 */
export function formatSessionCodeForSharing(sessionCode: string): string {
  return `Join my TinderForDinner session!\n\nSession Code: ${sessionCode}\n\nDownload the app and enter this code to join the swiping session.`;
}