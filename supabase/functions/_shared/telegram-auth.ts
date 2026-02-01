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
 * Check if running in local development environment
 */
function isLocalDevelopment(): boolean {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  // Check if URL contains localhost or 127.0.0.1
  const isLocalUrl = supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost');
  
  // Also check if we're using local service key pattern (local keys often start with specific prefixes)
  // Local Supabase uses keys like sb_publishable_* and sb_secret_*
  const isLocalKey = serviceKey.startsWith('sb_') || serviceKey.includes('localhost');
  
  // Debug logging
  console.log('[TelegramAuth] SUPABASE_URL:', supabaseUrl);
  console.log('[TelegramAuth] isLocalUrl:', isLocalUrl, 'isLocalKey:', isLocalKey);
  
  return isLocalUrl || isLocalKey;
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
    
    // Debug logging for local development
    const isLocal = isLocalDevelopment();
    console.log('[TelegramAuth] isLocalDevelopment:', isLocal);
    console.log('[TelegramAuth] initData:', initData);
    console.log('[TelegramAuth] hash:', hash);
    
    // Local development: allow mock initData without hash for user ID 111
    // Allow if hash is missing and user ID is 111 (for local dev - production always has hash)
    if (!hash) {
      const userParam = params.get('user');
      console.log('[TelegramAuth] userParam:', userParam);
      if (userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          console.log('[TelegramAuth] parsed user:', user);
          if (user.id === 111) {
            console.log('[TelegramAuth] Allowing user ID 111 without signature (isLocal:', isLocal, ')');
            return { valid: true, userId: 111 };
          }
        } catch (error) {
          console.log('[TelegramAuth] Error parsing user param:', error);
          // Invalid user param, continue with normal validation
        }
      }
    }
    
    if (!hash) {
      return { valid: false, error: 'Missing hash in initData' };
    }
    
    if (!botToken) {
      return { valid: false, error: 'Bot token not configured' };
    }
    
    // Remove hash and signature from params for data-check-string calculation
    // hash is excluded as per Telegram validation spec
    // signature (Bot API 8.0+) is for third-party Ed25519 validation and is computed
    // separately - it must also be excluded from hash validation
    params.delete('hash');
    params.delete('signature');
    
    // Sort parameters by key
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b));
    
    // Create data-check-string using decoded values (URLSearchParams provides decoded)
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
    
    // Debug: log data-check-string and hash comparison
    console.log('[TelegramAuth] dataCheckString keys:', sortedParams.map(([k]) => k).join(', '));
    console.log('[TelegramAuth] calculatedHash:', calculatedHash);
    console.log('[TelegramAuth] expectedHash:', hash);
    console.log('[TelegramAuth] hashMatch:', calculatedHash === hash);
    
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
 * Get all Telegram bot tokens from environment
 * Supports multiple bots for staging and production environments
 * 
 * @returns Array of bot tokens (at least one required)
 */
export function getTelegramBotTokens(): string[] {
  const tokens: string[] = [];
  
  // Primary token (required for backward compatibility)
  const primaryToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (primaryToken) {
    tokens.push(primaryToken);
  }
  
  // Staging bot token (optional)
  const stagingToken = Deno.env.get('TELEGRAM_BOT_TOKEN_STAGING');
  if (stagingToken) {
    tokens.push(stagingToken);
  }
  
  // Production bot token (optional)
  const productionToken = Deno.env.get('TELEGRAM_BOT_TOKEN_PRODUCTION');
  if (productionToken) {
    tokens.push(productionToken);
  }
  
  // Additional tokens (TELEGRAM_BOT_TOKEN_2, TELEGRAM_BOT_TOKEN_3, etc.)
  let index = 2;
  while (true) {
    const additionalToken = Deno.env.get(`TELEGRAM_BOT_TOKEN_${index}`);
    if (!additionalToken) {
      break;
    }
    tokens.push(additionalToken);
    index++;
  }
  
  if (tokens.length === 0) {
    throw new Error('No Telegram bot tokens configured. Set at least TELEGRAM_BOT_TOKEN environment variable');
  }
  
  console.log(`[TelegramAuth] Found ${tokens.length} bot token(s) configured`);
  return tokens;
}

/**
 * Get Telegram bot token from environment (backward compatibility)
 * Returns the primary token (TELEGRAM_BOT_TOKEN)
 * 
 * @returns Bot token or throws error
 * @deprecated Use validateTelegramAuthWithMultipleTokens() instead for multi-bot support
 */
export function getTelegramBotToken(): string {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN environment variable not set');
  }
  return botToken;
}

/**
 * Validate Telegram WebApp initData with multiple bot tokens
 * Tries each token until one succeeds
 * 
 * @param initData - URL-encoded initData string from Telegram WebApp
 * @returns Validation result with user ID if valid
 */
export async function validateTelegramAuthWithMultipleTokens(
  initData: string
): Promise<ValidationResult> {
  const botTokens = getTelegramBotTokens();
  
  // Try each token until one succeeds
  for (let i = 0; i < botTokens.length; i++) {
    const botToken = botTokens[i];
    console.log(`[TelegramAuth] Trying bot token ${i + 1}/${botTokens.length}`);
    
    const result = await validateTelegramAuth(initData, botToken);
    
    if (result.valid) {
      console.log(`[TelegramAuth] Validation succeeded with bot token ${i + 1}`);
      return result;
    }
    
    // If signature validation failed, try next token
    // Other errors (missing hash, expired, etc.) should be returned immediately
    if (result.error && result.error !== 'Invalid signature') {
      console.log(`[TelegramAuth] Validation failed with non-signature error: ${result.error}`);
      return result;
    }
  }
  
  // All tokens failed
  return {
    valid: false,
    error: 'Invalid signature - none of the configured bot tokens matched',
  };
}
