import * as Clipboard from 'expo-clipboard';
import { ClipboardResult } from '../types';

/**
 * Copy text to clipboard with comprehensive error handling
 * Returns a result object with success status and feedback message
 */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  try {
    console.log('📋 Copying to clipboard:', text);
    
    // PATTERN: Always use async clipboard operations
    await Clipboard.setStringAsync(text);
    
    console.log('✅ Successfully copied to clipboard');
    
    // PATTERN: Return consistent result format
    return {
      success: true,
      message: 'Copied to clipboard!'
    };
  } catch (error) {
    // PATTERN: Follow existing error handling
    console.error('❌ Clipboard copy failed:', error);
    
    return {
      success: false,
      error: 'Failed to copy to clipboard'
    };
  }
}

/**
 * Get text from clipboard
 * Returns the clipboard content or null if failed/empty
 */
export async function getFromClipboard(): Promise<string | null> {
  try {
    console.log('📋 Reading from clipboard...');
    
    const clipboardContent = await Clipboard.getStringAsync();
    
    console.log('✅ Successfully read from clipboard');
    
    return clipboardContent || null;
  } catch (error) {
    console.error('❌ Clipboard read failed:', error);
    return null;
  }
}

/**
 * Check if clipboard has content
 */
export async function hasClipboardContent(): Promise<boolean> {
  try {
    const hasString = await Clipboard.hasStringAsync();
    return hasString;
  } catch (error) {
    console.error('❌ Clipboard check failed:', error);
    return false;
  }
}