/**
 * Authentication Service for Supabase Auth Integration
 * 
 * Handles JWT token management for Telegram authentication
 */

const JWT_TOKEN_KEY = 'supabase_jwt_token';
const JWT_TOKEN_EXPIRY_KEY = 'supabase_jwt_token_expiry';

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    telegram_user_id: number;
  };
  error?: string;
  code?: string;
}

/**
 * Get Telegram initData for authentication
 */
function getTelegramInitData(): string | null {
  try {
    // Check if we're in Telegram WebApp environment
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
      return window.Telegram.WebApp.initData;
    }

    // For local development, create mock initData
    // This matches the pattern used in supabaseSyncService.ts
    const telegramUserId = getTelegramUserId();
    if (telegramUserId === '111') {
      // Local development - create mock initData
      const user = {
        id: 111,
        first_name: 'Local',
        username: 'local_dev',
      };
      const authDate = Math.floor(Date.now() / 1000);
      return `user=${encodeURIComponent(JSON.stringify(user))}&auth_date=${authDate}`;
    }

    return null;
  } catch (error) {
    console.error('Error getting Telegram initData:', error);
    return null;
  }
}

/**
 * Get Telegram user ID (from utils/telegramUserUtils.ts pattern)
 */
function getTelegramUserId(): string | null {
  try {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return String(window.Telegram.WebApp.initDataUnsafe.user.id);
    }
    // Local development fallback
    return '111';
  } catch (error) {
    console.warn('Error getting Telegram user ID:', error);
    return '111';
  }
}

/**
 * Authenticate with Telegram and get JWT token
 */
export async function authenticateWithTelegram(): Promise<AuthResponse> {
  try {
    const initData = getTelegramInitData();
    if (!initData) {
      return {
        success: false,
        error: 'Telegram initData not available',
        code: 'NO_INIT_DATA',
      };
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      return {
        success: false,
        error: 'VITE_SUPABASE_URL not configured',
        code: 'CONFIG_MISSING',
      };
    }

    const url = `${supabaseUrl}/functions/v1/auth-telegram`;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    
    console.log('[authService] Making request to:', url);
    console.log('[authService] Headers:', { 'Content-Type': 'application/json', 'apikey': anonKey ? 'present' : 'missing', 'X-Telegram-Init-Data': initData ? 'present' : 'missing' });
    
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'X-Telegram-Init-Data': initData,
      },
    });
    
    console.log('[authService] Response status:', response.status, response.statusText);
    console.log('[authService] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}`,
        code: errorData.code || 'AUTH_FAILED',
      };
    }

    const data: AuthResponse = await response.json();
    
    if (data.success && data.token) {
      // Store JWT token
      storeJWTToken(data.token);
      return data;
    }

    return {
      success: false,
      error: data.error || 'Authentication failed',
      code: data.code || 'AUTH_FAILED',
    };
  } catch (error) {
    console.error('Error authenticating with Telegram:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'NETWORK_ERROR',
    };
  }
}

/**
 * Store JWT token in localStorage
 */
export function storeJWTToken(token: string): void {
  try {
    localStorage.setItem(JWT_TOKEN_KEY, token);
    
    // Extract expiry from JWT token
    const expiry = getTokenExpiry(token);
    if (expiry) {
      localStorage.setItem(JWT_TOKEN_EXPIRY_KEY, expiry.toString());
    }
  } catch (error) {
    console.error('Error storing JWT token:', error);
  }
}

/**
 * Retrieve JWT token from localStorage
 */
export function getJWTToken(): string | null {
  try {
    return localStorage.getItem(JWT_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving JWT token:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isJWTTokenExpired(): boolean {
  try {
    const token = getJWTToken();
    if (!token) {
      return true;
    }

    const expiry = localStorage.getItem(JWT_TOKEN_EXPIRY_KEY);
    if (!expiry) {
      // If no expiry stored, check token itself
      return isTokenExpired(token);
    }

    const expiryTime = parseInt(expiry, 10);
    return Date.now() >= expiryTime;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
}

/**
 * Extract expiry time from JWT token
 */
function getTokenExpiry(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(
          atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
          c => c.charCodeAt(0)
        )
      )
    );

    // JWT exp is in seconds, convert to milliseconds
    if (decoded.exp) {
      return decoded.exp * 1000;
    }

    return null;
  } catch (error) {
    console.error('Error extracting token expiry:', error);
    return null;
  }
}

/**
 * Check if token is expired by decoding it
 */
function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) {
    return true; // If we can't determine expiry, assume expired
  }
  return Date.now() >= expiry;
}

/**
 * Refresh JWT token by re-authenticating
 */
export async function refreshJWTToken(): Promise<AuthResponse> {
  // Clear existing token
  clearJWTToken();
  
  // Re-authenticate
  return authenticateWithTelegram();
}

/**
 * Clear JWT token from localStorage
 */
export function clearJWTToken(): void {
  try {
    localStorage.removeItem(JWT_TOKEN_KEY);
    localStorage.removeItem(JWT_TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Error clearing JWT token:', error);
  }
}

/**
 * Get JWT token, refreshing if expired
 */
export async function getValidJWTToken(): Promise<string | null> {
  let token = getJWTToken();
  
  if (!token || isJWTTokenExpired()) {
    // Token missing or expired, refresh it
    const authResult = await refreshJWTToken();
    if (authResult.success && authResult.token) {
      token = authResult.token;
    } else {
      console.error('Failed to refresh JWT token:', authResult.error);
      return null;
    }
  }

  return token;
}
