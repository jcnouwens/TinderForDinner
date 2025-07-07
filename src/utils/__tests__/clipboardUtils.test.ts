import { copyToClipboard, getFromClipboard, hasClipboardContent } from '../clipboardUtils';

// Mock expo-clipboard
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
  getStringAsync: jest.fn(),
  hasStringAsync: jest.fn(),
}));

const mockClipboard = require('expo-clipboard');

describe('clipboardUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard successfully', async () => {
      mockClipboard.setStringAsync.mockResolvedValue(undefined);

      const result = await copyToClipboard('TEST-PASTA-42');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Copied to clipboard!');
      expect(result.error).toBeUndefined();
      expect(mockClipboard.setStringAsync).toHaveBeenCalledWith('TEST-PASTA-42');
    });

    it('should handle clipboard errors gracefully', async () => {
      const mockError = new Error('Mock clipboard error');
      mockClipboard.setStringAsync.mockRejectedValue(mockError);

      const result = await copyToClipboard('TEST-PASTA-42');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to copy to clipboard');
      expect(result.message).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith('❌ Clipboard copy failed:', mockError);
    });

    it('should handle empty text', async () => {
      mockClipboard.setStringAsync.mockResolvedValue(undefined);

      const result = await copyToClipboard('');

      expect(result.success).toBe(true);
      expect(mockClipboard.setStringAsync).toHaveBeenCalledWith('');
    });

    it('should handle session code format correctly', async () => {
      mockClipboard.setStringAsync.mockResolvedValue(undefined);

      const sessionCode = 'HAPPY-PIZZA-99';
      const result = await copyToClipboard(sessionCode);

      expect(result.success).toBe(true);
      expect(mockClipboard.setStringAsync).toHaveBeenCalledWith(sessionCode);
    });
  });

  describe('getFromClipboard', () => {
    it('should read text from clipboard successfully', async () => {
      const clipboardContent = 'SPICY-TACOS-42';
      mockClipboard.getStringAsync.mockResolvedValue(clipboardContent);

      const result = await getFromClipboard();

      expect(result).toBe(clipboardContent);
      expect(mockClipboard.getStringAsync).toHaveBeenCalled();
    });

    it('should return null for empty clipboard', async () => {
      mockClipboard.getStringAsync.mockResolvedValue('');

      const result = await getFromClipboard();

      expect(result).toBeNull();
    });

    it('should handle clipboard read errors', async () => {
      const mockError = new Error('Read error');
      mockClipboard.getStringAsync.mockRejectedValue(mockError);

      const result = await getFromClipboard();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('❌ Clipboard read failed:', mockError);
    });
  });

  describe('hasClipboardContent', () => {
    it('should return true when clipboard has content', async () => {
      mockClipboard.hasStringAsync.mockResolvedValue(true);

      const result = await hasClipboardContent();

      expect(result).toBe(true);
      expect(mockClipboard.hasStringAsync).toHaveBeenCalled();
    });

    it('should return false when clipboard is empty', async () => {
      mockClipboard.hasStringAsync.mockResolvedValue(false);

      const result = await hasClipboardContent();

      expect(result).toBe(false);
    });

    it('should handle check errors gracefully', async () => {
      const mockError = new Error('Check error');
      mockClipboard.hasStringAsync.mockRejectedValue(mockError);

      const result = await hasClipboardContent();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('❌ Clipboard check failed:', mockError);
    });
  });
});