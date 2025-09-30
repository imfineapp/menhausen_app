/**
 * Unit tests for telegramUserUtils
 */

import { 
  isTelegramEnvironment, 
  getTelegramUserId, 
  formatUserDisplayId, 
  getUserDisplayId,
  getTelegramUserInfo 
} from '../../utils/telegramUserUtils';

// Mock window.Telegram for testing
const mockTelegramWebApp = {
  initDataUnsafe: {
    user: {
      id: 123456789,
      first_name: 'John',
      last_name: 'Doe',
      username: 'johndoe',
      language_code: 'en',
      is_premium: false
    }
  }
};

const mockTelegramWebAppWithoutUser = {
  initDataUnsafe: {}
};

describe('telegramUserUtils', () => {
  let originalTelegram: any;

  beforeEach(() => {
    // Store original Telegram object if it exists
    originalTelegram = (global as any).window?.Telegram;
    // Clear any existing mocks
    if ((global as any).window) {
      try {
        (global as any).window.Telegram = undefined;
      } catch {
        // Ignore errors when setting Telegram property
      }
    }
  });

  afterEach(() => {
    // Restore original Telegram object
    if ((global as any).window) {
      try {
        (global as any).window.Telegram = originalTelegram;
      } catch {
        // Ignore errors when restoring Telegram property
      }
    }
  });

  describe('isTelegramEnvironment', () => {
    it('should return true when Telegram WebApp is available', () => {
      (global as any).window.Telegram = { WebApp: mockTelegramWebApp };
      expect(isTelegramEnvironment()).toBe(true);
    });

    it('should return false when Telegram WebApp is not available', () => {
      expect(isTelegramEnvironment()).toBe(false);
    });

    it('should return false when window.Telegram exists but WebApp is missing', () => {
      (global as any).window.Telegram = {};
      expect(isTelegramEnvironment()).toBe(false);
    });

    it('should handle errors gracefully', () => {
      // Mock window to throw an error
      const originalWindow = global.window;
      global.window = {
        get Telegram() {
          throw new Error('Access denied');
        }
      } as any;

      expect(isTelegramEnvironment()).toBe(false);
      
      // Restore original window
      global.window = originalWindow;
    });
  });

  describe('getTelegramUserId', () => {
    it('should return user ID as string when available', () => {
      (global as any).window.Telegram = { WebApp: mockTelegramWebApp };
      expect(getTelegramUserId()).toBe('123456789');
    });

    it('should return null when not in Telegram environment', () => {
      expect(getTelegramUserId()).toBe(null);
    });

    it('should return null when user data is not available', () => {
      (global as any).window.Telegram = { WebApp: mockTelegramWebAppWithoutUser };
      expect(getTelegramUserId()).toBe(null);
    });

    it('should handle errors gracefully', () => {
      const originalWindow = global.window;
      global.window = {
        get Telegram() {
          throw new Error('Access denied');
        }
      } as any;

      expect(getTelegramUserId()).toBe(null);
      
      // Restore original window
      global.window = originalWindow;
    });
  });

  describe('formatUserDisplayId', () => {
    it('should format number user ID with # prefix', () => {
      expect(formatUserDisplayId(123456789)).toBe('#123456789');
    });

    it('should format string user ID with # prefix', () => {
      expect(formatUserDisplayId('123456789')).toBe('#123456789');
    });

    it('should return development fallback when no user ID provided', () => {
      expect(formatUserDisplayId()).toBe('#MNHSNDEV');
    });

    it('should return development fallback when user ID is null', () => {
      expect(formatUserDisplayId(null as any)).toBe('#MNHSNDEV');
    });

    it('should return development fallback when user ID is undefined', () => {
      expect(formatUserDisplayId(undefined)).toBe('#MNHSNDEV');
    });

    it('should handle zero user ID', () => {
      expect(formatUserDisplayId(0)).toBe('#0');
    });
  });

  describe('getUserDisplayId', () => {
    it('should return formatted Telegram user ID when in Telegram environment', () => {
      (global as any).window.Telegram = { WebApp: mockTelegramWebApp };
      expect(getUserDisplayId()).toBe('#123456789');
    });

    it('should return development fallback when not in Telegram environment', () => {
      expect(getUserDisplayId()).toBe('#MNHSNDEV');
    });

    it('should return development fallback when Telegram environment exists but no user ID', () => {
      (global as any).window.Telegram = { WebApp: mockTelegramWebAppWithoutUser };
      expect(getUserDisplayId()).toBe('#MNHSNDEV');
    });

    it('should handle errors gracefully and return development fallback', () => {
      const originalWindow = global.window;
      global.window = {
        get Telegram() {
          throw new Error('Access denied');
        }
      } as any;

      expect(getUserDisplayId()).toBe('#MNHSNDEV');
      
      // Restore original window
      global.window = originalWindow;
    });
  });

  describe('getTelegramUserInfo', () => {
    it('should return user info object when available', () => {
      (global as any).window.Telegram = { WebApp: mockTelegramWebApp };
      const userInfo = getTelegramUserInfo();
      
      expect(userInfo).toEqual({
        id: '123456789',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        languageCode: 'en',
        isPremium: false
      });
    });

    it('should return null when not in Telegram environment', () => {
      expect(getTelegramUserInfo()).toBe(null);
    });

    it('should return null when user data is not available', () => {
      (global as any).window.Telegram = { WebApp: mockTelegramWebAppWithoutUser };
      expect(getTelegramUserInfo()).toBe(null);
    });

    it('should handle partial user data', () => {
      const partialUserData = {
        initDataUnsafe: {
          user: {
            id: 987654321,
            first_name: 'Jane'
            // Missing other fields
          }
        }
      };
      
      (global as any).window.Telegram = { WebApp: partialUserData };
      const userInfo = getTelegramUserInfo();
      
      expect(userInfo).toEqual({
        id: '987654321',
        firstName: 'Jane',
        lastName: undefined,
        username: undefined,
        languageCode: undefined,
        isPremium: undefined
      });
    });

    it('should handle errors gracefully', () => {
      const originalWindow = global.window;
      global.window = {
        get Telegram() {
          throw new Error('Access denied');
        }
      } as any;

      expect(getTelegramUserInfo()).toBe(null);
      
      // Restore original window
      global.window = originalWindow;
    });
  });

  describe('Integration tests', () => {
    it('should work with real-world Telegram WebApp data structure', () => {
      const realWorldData = {
        initDataUnsafe: {
          user: {
            id: 1234567890,
            is_bot: false,
            first_name: 'Alice',
            last_name: 'Smith',
            username: 'alice_smith',
            language_code: 'ru',
            is_premium: true
          },
          chat: {
            id: -1001234567890,
            type: 'supergroup',
            title: 'Test Group'
          }
        }
      };

      (global as any).window.Telegram = { WebApp: realWorldData };
      
      expect(isTelegramEnvironment()).toBe(true);
      expect(getTelegramUserId()).toBe('1234567890');
      expect(getUserDisplayId()).toBe('#1234567890');
      
      const userInfo = getTelegramUserInfo();
      expect(userInfo?.id).toBe('1234567890');
      expect(userInfo?.firstName).toBe('Alice');
      expect(userInfo?.isPremium).toBe(true);
    });
  });
});
