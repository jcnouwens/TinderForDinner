import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useClipboard } from '../useClipboard';

// Mock the clipboard utils
jest.mock('../../utils/clipboardUtils', () => ({
  copyToClipboard: jest.fn(),
  getFromClipboard: jest.fn(),
}));

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

const mockClipboardUtils = require('../../utils/clipboardUtils');
const mockAlert = Alert as jest.Mocked<typeof Alert>;

describe('useClipboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useClipboard());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.lastCopied).toBeNull();
    expect(result.current.lastCopiedAt).toBeNull();
  });

  it('should copy text successfully with alert', async () => {
    mockClipboardUtils.copyToClipboard.mockResolvedValue({
      success: true,
      message: 'Copied to clipboard!'
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const success = await result.current.copyText('test-text');
      expect(success).toBe(true);
    });

    expect(result.current.lastCopied).toBe('test-text');
    expect(result.current.lastCopiedAt).toBeInstanceOf(Date);
    expect(mockAlert.alert).toHaveBeenCalledWith('Copied!', 'Copied to clipboard!');
  });

  it('should copy text without showing alert when specified', async () => {
    mockClipboardUtils.copyToClipboard.mockResolvedValue({
      success: true,
      message: 'Copied to clipboard!'
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const success = await result.current.copyText('test-text', false);
      expect(success).toBe(true);
    });

    expect(mockAlert.alert).not.toHaveBeenCalled();
  });

  it('should handle copy failure', async () => {
    mockClipboardUtils.copyToClipboard.mockResolvedValue({
      success: false,
      error: 'Copy failed'
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const success = await result.current.copyText('test-text');
      expect(success).toBe(false);
    });

    expect(result.current.lastCopied).toBeNull();
    expect(mockAlert.alert).toHaveBeenCalledWith('Copy Failed', 'Copy failed');
  });

  it('should copy session code with specific message', async () => {
    mockClipboardUtils.copyToClipboard.mockResolvedValue({
      success: true,
      message: 'Copied to clipboard!'
    });

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const success = await result.current.copySessionCode('HAPPY-PIZZA-42');
      expect(success).toBe(true);
    });

    expect(mockAlert.alert).toHaveBeenCalledWith(
      'Session Code Copied!',
      'Session code "HAPPY-PIZZA-42" has been copied to your clipboard. Share it with friends to invite them!',
      [{ text: 'OK' }]
    );
  });

  it('should prevent multiple concurrent copy operations', async () => {
    let resolveFirst: any;
    const firstCopyPromise = new Promise(resolve => {
      resolveFirst = resolve;
    });

    mockClipboardUtils.copyToClipboard
      .mockImplementationOnce(() => firstCopyPromise.then(() => ({ success: true })))
      .mockImplementationOnce(() => Promise.resolve({ success: true }));

    const { result } = renderHook(() => useClipboard());

    // Start first copy operation
    act(() => {
      result.current.copyText('text1');
    });

    // Try to start second copy operation while first is still loading
    act(() => {
      result.current.copyText('text2'); // This should be ignored
    });

    expect(result.current.isLoading).toBe(true);
    expect(mockClipboardUtils.copyToClipboard).toHaveBeenCalledTimes(1);

    // Resolve the first copy operation
    await act(async () => {
      resolveFirst();
      await firstCopyPromise;
    });
  });

  it('should read clipboard content', async () => {
    mockClipboardUtils.getFromClipboard.mockResolvedValue('clipboard-content');

    const { result } = renderHook(() => useClipboard());

    let content: string | null = null;
    await act(async () => {
      content = await result.current.readClipboard();
    });

    expect(content).toBe('clipboard-content');
    expect(mockClipboardUtils.getFromClipboard).toHaveBeenCalled();
  });

  it('should correctly identify recently copied text', async () => {
    mockClipboardUtils.copyToClipboard.mockResolvedValue({
      success: true,
      message: 'Copied to clipboard!'
    });

    const { result } = renderHook(() => useClipboard());

    // Perform an actual copy operation to set the state properly
    await act(async () => {
      await result.current.copyText('recent-text', false); // Don't show alert
    });

    // Fast forward time but stay within the window
    act(() => {
      jest.advanceTimersByTime(15000); // 15 seconds
    });

    expect(result.current.wasRecentlyCopied('recent-text', 30)).toBe(true);
    expect(result.current.wasRecentlyCopied('different-text', 30)).toBe(false);
    expect(result.current.wasRecentlyCopied('recent-text', 10)).toBe(false); // Outside time window
  });
});