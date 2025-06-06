const mockDimensionsGet = jest.fn();
let platform = { OS: 'ios', isPad: false, isTV: false, select: (obj: any) => obj['ios'] };

jest.mock('react-native', () => ({
  Platform: platform,
  Dimensions: { get: mockDimensionsGet },
  StyleSheet: { create: (s: any) => s },
}));

describe('style helpers', () => {
  beforeEach(() => {
    mockDimensionsGet.mockReset();
    platform.OS = 'ios';
    platform.isPad = false;
    platform.isTV = false;
    platform.select = (obj: any) => obj[platform.OS] ?? obj.default;
  });

  test('isIphoneX detects iPhone X dimensions', () => {
    mockDimensionsGet.mockReturnValue({ width: 375, height: 812 });
    const { isIphoneX } = require('./styles');
    expect(isIphoneX()).toBe(true);
  });

  test('isIphoneX returns false for non matching device', () => {
    mockDimensionsGet.mockReturnValue({ width: 375, height: 667 });
    const { isIphoneX } = require('./styles');
    expect(isIphoneX()).toBe(false);
  });

  test('getStatusBarHeight returns iPhone X heights', () => {
    mockDimensionsGet.mockReturnValue({ width: 375, height: 812 });
    const { getStatusBarHeight } = require('./styles');
    expect(getStatusBarHeight()).toBe(30);
    expect(getStatusBarHeight(true)).toBe(44);
  });

  test('getStatusBarHeight returns defaults on android', () => {
    platform.OS = 'android';
    mockDimensionsGet.mockReturnValue({ width: 375, height: 812 });
    const { getStatusBarHeight } = require('./styles');
    expect(getStatusBarHeight()).toBe(0);
  });
});
