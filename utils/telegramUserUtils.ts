/**
 * Telegram User ID Utility Functions
 * Provides utilities for detecting Telegram environment and formatting user IDs
 */

/**
 * Check if the application is running in Telegram WebApp environment
 * @returns {boolean} True if running in Telegram WebApp, false otherwise
 */
export function isTelegramEnvironment(): boolean {
  try {
    return !!(window.Telegram?.WebApp);
  } catch (error) {
    console.warn('Error checking Telegram environment:', error);
    return false;
  }
}

/**
 * Get the Telegram user ID from WebApp API
 * @returns {string | null} User ID as string, or null if not available
 */
export function getTelegramUserId(): string | null {
  try {
    if (!isTelegramEnvironment()) {
      return null;
    }

    const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    return userId ? String(userId) : null;
  } catch (error) {
    console.warn('Error getting Telegram user ID:', error);
    return null;
  }
}

/**
 * Format user ID for display with # prefix
 * @param {number | string} userId - User ID to format
 * @returns {string} Formatted user ID with # prefix
 */
export function formatUserDisplayId(userId?: number | string): string {
  if (userId === null || userId === undefined || userId === '') {
    return '#MNHSNDEV';
  }
  
  const idString = String(userId);
  return `#${idString}`;
}

/**
 * Get the user display ID based on environment
 * Returns Telegram user ID if in Telegram environment, otherwise returns development fallback
 * @returns {string} Formatted user ID for display
 */
export function getUserDisplayId(): string {
  try {
    if (isTelegramEnvironment()) {
      const telegramUserId = getTelegramUserId();
      if (telegramUserId) {
        return formatUserDisplayId(telegramUserId);
      }
    }
    
    // Fallback to development mode
    return '#MNHSNDEV';
  } catch (error) {
    console.warn('Error getting user display ID:', error);
    return '#MNHSNDEV';
  }
}

/**
 * Get additional Telegram user information for debugging/logging
 * @returns {object | null} User information object or null if not available
 */
export function getTelegramUserInfo(): {
  id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  isPremium?: boolean;
} | null {
  try {
    if (!isTelegramEnvironment()) {
      return null;
    }

    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!user) {
      return null;
    }

    return {
      id: user.id ? String(user.id) : undefined,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      languageCode: user.language_code,
      isPremium: user.is_premium
    };
  } catch (error) {
    console.warn('Error getting Telegram user info:', error);
    return null;
  }
}

/**
 * Detect if the app is opened via direct-link (t.me/bot/app) vs inline mode
 * Uses multiple detection methods for reliable identification
 * @returns {boolean} True if opened via direct-link, false otherwise
 */
export function isDirectLinkMode(): boolean {
  try {
    if (!isTelegramEnvironment()) return false;

    // Method 1: Check URL parameters for direct-link indicators
    const urlParams = new URLSearchParams(window.location.search);
    const hasStartParam = urlParams.has('startapp') || urlParams.has('tgWebAppStartParam');

    // Method 2: Check WebApp start_param (set by direct-link)
    const webAppStartParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;

    // Method 3: Check if URL path indicates direct-link (t.me/bot/app format)
    const isDirectLinkPath = window.location.pathname.includes('/') &&
                           window.location.hostname === 't.me';

    // Method 4: Check referrer (might be empty for direct links)
    const hasTelegramReferrer = document.referrer.includes('t.me') ||
                               document.referrer.includes('telegram');

    // Consider it a direct link if any of these indicators are present
    const isLikelyDirectLink = hasStartParam || !!webAppStartParam || isDirectLinkPath;

    return isLikelyDirectLink;
  } catch (error) {
    console.warn('Error detecting direct link mode:', error);
    return false;
  }
}

/**
 * Get the Telegram platform (iOS, Android, Desktop)
 * Useful for platform-specific optimizations
 * @returns {'ios' | 'android' | 'desktop' | 'unknown'} The detected platform
 */
export function getTelegramPlatform(): 'ios' | 'android' | 'desktop' | 'unknown' {
  try {
    const platform = window.Telegram?.WebApp?.platform || 'unknown';
    return platform as 'ios' | 'android' | 'desktop' | 'unknown';
  } catch {
    return 'unknown';
  }
}
