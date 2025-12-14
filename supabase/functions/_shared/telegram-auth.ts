/**
 * Telegram WebApp Authentication Validation
 * 
 * Validates Telegram WebApp initData for Edge Functions (Deno runtime)
 * Based on Telegram's official validation algorithm
 */

interface ValidationResult {
  valid: boolean;
  userId?: number;
  error?: string;
}

/**
 * Validate Telegram WebApp initData
 * 
 * @param initData - URL-encoded initData string from Telegram WebApp
 * @param botToken - Telegram bot token (from environment variable)
 * @returns Validation result with user ID if valid
 */
export async function validateTelegramAuth(
  initData: string,
  botToken: string
): Promise<ValidationResult> {
  try {
    // Parse initData (URL-encoded)
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    
    if (!hash) {
      return { valid: false, error: 'Missing hash in initData' };
    }
    
    if (!botToken) {
      return { valid: false, error: 'Bot token not configured' };
    }
    
    // Remove hash from params for signature calculation
    params.delete('hash');
    
    // Sort parameters by key
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b));
    
    // Create data-check-string
    const dataCheckString = sortedParams
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Calculate secret key using HMAC-SHA256
    // Secret key = HMAC_SHA256('WebAppData', bot_token)
    const encoder = new TextEncoder();
    const secretKeyData = encoder.encode('WebAppData');
    
    // Create HMAC key for secret key calculation
    const secretKey = await crypto.subtle.importKey(
      'raw',
      secretKeyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const botTokenData = encoder.encode(botToken);
    const secretKeyBuffer = await crypto.subtle.sign('HMAC', secretKey, botTokenData);
    
    // Calculate signature using secret key
    const signatureKey = await crypto.subtle.importKey(
      'raw',
      secretKeyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const dataCheckStringData = encoder.encode(dataCheckString);
    const calculatedHashBuffer = await crypto.subtle.sign('HMAC', signatureKey, dataCheckStringData);
    
    // Convert to hex string
    const calculatedHashArray = new Uint8Array(calculatedHashBuffer);
    const calculatedHash = Array.from(calculatedHashArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Verify signature
    if (calculatedHash !== hash) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    // Check expiration (if auth_date present)
    const authDate = params.get('auth_date');
    if (authDate) {
      const authTimestamp = parseInt(authDate, 10) * 1000;
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (now - authTimestamp > maxAge) {
        return { valid: false, error: 'Expired initData' };
      }
    }
    
    // Extract user ID
    const userParam = params.get('user');
    if (!userParam) {
      return { valid: false, error: 'Missing user in initData' };
    }
    
    const user = JSON.parse(userParam);
    const userId = user.id;
    
    if (!userId || typeof userId !== 'number') {
      return { valid: false, error: 'Missing or invalid user.id in initData' };
    }
    
    return { valid: true, userId };
  } catch (error) {
    return { 
      valid: false, 
      error: `Validation error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Extract telegram_user_id from initData (without validation)
 * Use only for logging/debugging, not for security
 * 
 * @param initData - URL-encoded initData string
 * @returns User ID or null
 */
export function extractTelegramUserId(initData: string): number | null {
  try {
    const params = new URLSearchParams(initData);
    const userParam = params.get('user');
    if (!userParam) return null;
    
    const user = JSON.parse(userParam);
    return user.id || null;
  } catch {
    return null;
  }
}

/**
 * Get Telegram bot token from environment
 * 
 * @returns Bot token or throws error
 */
export function getTelegramBotToken(): string {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN environment variable not set');
  }
  return botToken;
}
