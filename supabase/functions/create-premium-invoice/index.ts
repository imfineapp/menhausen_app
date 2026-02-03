/**
 * POST /functions/v1/create-premium-invoice
 * 
 * Creates a Telegram Stars invoice link for premium subscription purchase
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { validateTelegramAuthWithMultipleTokens, getTelegramBotTokens, validateTelegramAuth } from '../_shared/telegram-auth.ts';
import { createInvoiceLink, getBotInfo } from '../_shared/telegram-bot-api.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-init-data',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false',
};

/**
 * Extract telegram_user_id from JWT token
 */
function getTelegramUserIdFromJWT(jwtToken: string): number | null {
  try {
    const parts = jwtToken.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(
          atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
          c => c.charCodeAt(0)
        )
      )
    );
    
    return decoded.user_metadata?.telegram_user_id || null;
  } catch (error) {
    console.error('Error extracting telegram_user_id from JWT:', error);
    return null;
  }
}

/**
 * Get test bot IDs from environment variable
 * Format: TELEGRAM_TEST_BOT_IDS=123456789,987654321
 */
function getTestBotIds(): number[] {
  const raw = Deno.env.get('TELEGRAM_TEST_BOT_IDS') ?? '';
  if (!raw) return [];
  
  return raw
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n) && n > 0);
}

/**
 * Check if bot is a test/staging bot
 */
async function isTestEnvironmentBot(botId: number): Promise<boolean> {
  const testBotIds = getTestBotIds();
  return testBotIds.includes(botId);
}

/**
 * Determine bot information from initData validation
 * Returns bot_id, bot_username, and the token that was used
 */
/**
 * Determine bot information from initData validation
 * Returns bot_id, bot_username, and the token that was used
 */
async function determineBotInfo(initData: string): Promise<{ id: number; username?: string; token: string } | null> {
  const botTokens = getTelegramBotTokens();
  
  // Перебираем токены и находим тот, который успешно валидирует initData
  for (const botToken of botTokens) {
    const validationResult = await validateTelegramAuth(initData, botToken);
    
    if (validationResult.valid) {
      // Этот токен прошёл валидацию - получаем информацию о боте
      const botInfo = await getBotInfo(botToken);
      return {
        id: botInfo.id,
        username: botInfo.username,
        token: botToken
      };
    }
  }
  
  return null;
}

/**
 * Get plan configuration (price in Stars)
 */
function getPlanConfig(planType: 'monthly' | 'annually' | 'lifetime') {
  const plans = {
    monthly: {
      price: 150,
      label: 'Premium Monthly',
      title: 'Premium Monthly Subscription',
      description: 'Unlock all themes and premium features for 1 month'
    },
    annually: {
      price: 1500,
      label: 'Premium Annual',
      title: 'Premium Annual Subscription',
      description: 'Unlock all themes and premium features for 1 year. Save 16%!'
    },
    lifetime: {
      price: 2500,
      label: 'Premium Lifetime',
      title: 'Premium Lifetime Subscription',
      description: 'Unlock all themes and premium features forever'
    }
  };
  
  return plans[planType];
}

interface CreateInvoiceRequest {
  planType: 'monthly' | 'annually' | 'lifetime';
}

interface CreateInvoiceResponse {
  success: boolean;
  invoiceUrl?: string;
  error?: string;
  code?: string;
}

serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('', {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Method not allowed. Use POST',
          code: 'INVALID_METHOD',
        } as CreateInvoiceResponse),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let telegramUserId: number;

    // Try to get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    const jwtToken = authHeader?.replace('Bearer ', '');

    if (jwtToken) {
      // JWT-based authentication
      const extractedUserId = getTelegramUserIdFromJWT(jwtToken);
      if (!extractedUserId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid JWT token',
            code: 'INVALID_JWT',
          } as CreateInvoiceResponse),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      telegramUserId = extractedUserId;
    } else {
      // Telegram initData authentication (backward compatibility)
      const initData = req.headers.get('X-Telegram-Init-Data');
      if (!initData) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'No authentication provided (JWT token or Telegram initData required)',
            code: 'UNAUTHORIZED',
          } as CreateInvoiceResponse),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const validationResult = await validateTelegramAuthWithMultipleTokens(initData);
      if (!validationResult.valid || !validationResult.userId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: validationResult.error || 'Invalid Telegram authentication',
            code: 'INVALID_TELEGRAM_AUTH',
          } as CreateInvoiceResponse),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      telegramUserId = validationResult.userId;
    }

    // Parse request body
    const body: CreateInvoiceRequest = await req.json();
    const { planType } = body;

    if (!planType || !['monthly', 'annually', 'lifetime'].includes(planType)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid plan type. Must be: monthly, annually, or lifetime',
          code: 'INVALID_PLAN_TYPE',
        } as CreateInvoiceResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Determine bot information
    // Если используем initData, можем определить бота
    // Если используем JWT, нужно получить initData из запроса или определить по другому способу
    let botId: number | null = null;
    let botToken: string | null = null;
    let isTestPayment = false;

    const initData = req.headers.get('X-Telegram-Init-Data');
    if (initData) {
      const botInfo = await determineBotInfo(initData);
      if (botInfo) {
        botId = botInfo.id;
        botToken = botInfo.token;
        isTestPayment = await isTestEnvironmentBot(botId);
      }
    } else {
      // Если нет initData (только JWT), используем первый токен как fallback
      // В этом случае bot_id будет null, но инвойс всё равно создастся
      const botTokens = getTelegramBotTokens();
      if (botTokens.length > 0) {
        botToken = botTokens[0];
        const botInfo = await getBotInfo(botToken);
        botId = botInfo.id;
        isTestPayment = await isTestEnvironmentBot(botId);
      }
    }

    if (!botToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unable to determine bot token',
          code: 'BOT_TOKEN_ERROR',
        } as CreateInvoiceResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get plan configuration
    const planConfig = getPlanConfig(planType);

    // Create invoice payload (must be <= 128 bytes)
    // Using compact format to stay within Telegram's limit
    const payload = JSON.stringify({
      p: planType, // planType: 'monthly' | 'annually' | 'lifetime'
      u: telegramUserId, // user ID
      b: botId, // bot ID
      t: isTestPayment ? 1 : 0, // test payment flag (0 or 1)
      ts: Date.now() // timestamp
      // botUsername removed to save space - can be retrieved via botId if needed
    });
    
    // Validate payload size (Telegram limit: 128 bytes)
    const payloadBytes = new TextEncoder().encode(payload).length;
    if (payloadBytes > 128) {
      console.error('[create-premium-invoice] Payload too large:', payloadBytes, 'bytes');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payload size exceeds Telegram limit',
          code: 'PAYLOAD_TOO_LARGE',
        } as CreateInvoiceResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log('[create-premium-invoice] Payload size:', payloadBytes, 'bytes, payload:', payload);

    // Create invoice link via Telegram Bot API
    const invoiceUrl = await createInvoiceLink(botToken, {
      title: planConfig.title,
      description: planConfig.description,
      payload,
      currency: 'XTR', // Telegram Stars
      prices: [{ label: planConfig.label, amount: planConfig.price }]
    });

    console.log('[create-premium-invoice] Invoice created:', {
      telegramUserId,
      planType,
      botId,
      isTestPayment,
      invoiceUrl: invoiceUrl.substring(0, 50) + '...'
    });

    return new Response(
      JSON.stringify({
        success: true,
        invoiceUrl,
      } as CreateInvoiceResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[create-premium-invoice] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      } as CreateInvoiceResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
