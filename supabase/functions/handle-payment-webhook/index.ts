/**
 * POST /functions/v1/handle-payment-webhook
 * 
 * Handles webhook requests from Telegram Bot API for payment processing
 * Processes pre_checkout_query and successful_payment updates
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { answerPreCheckoutQuery, getBotInfo } from '../_shared/telegram-bot-api.ts';
import { getTelegramBotTokens } from '../_shared/telegram-auth.ts';

/**
 * Find the bot token that corresponds to the given bot_id (from invoice payload).
 * Telegram requires answering pre_checkout_query with the SAME bot that created the invoice.
 * Without this, Telegram returns "query is too old or query ID is invalid".
 */
async function getBotTokenByBotId(payloadBotId: number): Promise<string> {
  const tokens = getTelegramBotTokens();
  const results = await Promise.all(
    tokens.map(async (token) => {
      try {
        const info = await getBotInfo(token);
        return { token, id: info.id };
      } catch {
        return { token, id: null };
      }
    })
  );
  const match = results.find((r) => r.id === payloadBotId);
  if (!match) {
    throw new Error(`No configured bot token found for bot_id ${payloadBotId}. Check that the bot token for this bot is set in Supabase secrets.`);
  }
  return match.token;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-bot-api-secret-token',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false',
};

interface TelegramUpdate {
  update_id: number;
  pre_checkout_query?: {
    id: string;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    currency: string;
    total_amount: number;
    invoice_payload: string;
  };
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    date: number;
    successful_payment?: {
      currency: string;
      total_amount: number;
      invoice_payload: string;
      telegram_payment_charge_id: string;
    };
  };
}

interface InvoicePayload {
  p: string; // planType: 'monthly' | 'annually' | 'lifetime'
  u: number; // telegramUserId
  b?: number; // botId
  t?: number; // isTestPayment (0 or 1)
  ts: number; // timestamp
  // Legacy fields for backward compatibility (if present)
  planType?: 'monthly' | 'annually' | 'lifetime';
  telegramUserId?: number;
  botId?: number;
  botUsername?: string;
  isTestPayment?: boolean;
  timestamp?: number;
}

/**
 * Activate premium subscription in database
 */
async function activatePremiumSubscription(
  supabase: any,
  params: {
    telegramUserId: number;
    botId: number | null;
    botUsername: string | null;
    isTestPayment: boolean;
    planType: 'monthly' | 'annually' | 'lifetime';
    paymentChargeId: string;
    invoiceMessageId: number;
  }
): Promise<void> {
  const { telegramUserId, botId, botUsername, isTestPayment, planType, paymentChargeId, invoiceMessageId } = params;
  
  const startsAt = new Date();
  let expiresAt: Date | null = null;
  
  // Calculate expiration date
  if (planType === 'monthly') {
    expiresAt = new Date(startsAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else if (planType === 'annually') {
    expiresAt = new Date(startsAt.getTime() + 365 * 24 * 60 * 60 * 1000);
  }
  // lifetime: expiresAt remains null
  
  // Check for duplicate payment
  const { data: existing } = await supabase
    .from('premium_subscriptions')
    .select('id')
    .eq('telegram_payment_charge_id', paymentChargeId)
    .maybeSingle();
  
  if (existing) {
    console.log('[handle-payment-webhook] Duplicate payment detected:', paymentChargeId);
    return; // Already processed
  }
  
  // Insert subscription
  const { error } = await supabase
    .from('premium_subscriptions')
    .insert({
      telegram_user_id: telegramUserId,
      bot_id: botId,
      bot_username: botUsername,
      is_test_payment: isTestPayment,
      plan_type: planType,
      telegram_payment_charge_id: paymentChargeId,
      invoice_message_id: invoiceMessageId,
      status: 'active',
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt?.toISOString() || null
    });
  
  if (error) {
    console.error('[handle-payment-webhook] Error inserting subscription:', error);
    throw error;
  }
  
  console.log('[handle-payment-webhook] Premium subscription activated:', {
    telegramUserId,
    planType,
    botId,
    isTestPayment,
    paymentChargeId
  });
}

/**
 * Sync check if plan is available (for pre_checkout_query).
 * Must be fast - no async work to stay within Telegram's 10s limit.
 */
function checkPlanAvailabilitySync(planType: string): boolean {
  return ['monthly', 'annually', 'lifetime'].includes(planType);
}

serve(async (req) => {
  try {
    // ВАЖНО: Проверка secret token ПЕРВЫМ делом!
    const secretToken = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
    const expectedToken = Deno.env.get('TELEGRAM_WEBHOOK_SECRET');
    
    if (!secretToken || secretToken !== expectedToken) {
      console.error('[handle-payment-webhook] Invalid or missing secret token');
      return new Response('Unauthorized', { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }
    
    // Parse webhook update
    const update: TelegramUpdate = await req.json();
    
    // Handle pre_checkout_query first (must respond within 10 seconds!)
    // Do NOT create Supabase client here - we don't need it for answering, saves time
    if (update.pre_checkout_query) {
      const query = update.pre_checkout_query;
      
      try {
        // Parse payload (supports both compact and legacy formats)
        const payload: InvoicePayload = JSON.parse(query.invoice_payload);
        
        // Extract planType (support both compact and legacy formats)
        const planType = payload.p || payload.planType || 'monthly';
        
        // Fast check - must be quick (sync)
        const canProcess = checkPlanAvailabilitySync(planType);
        
        // CRITICAL: Use the SAME bot token that created the invoice (payload.b = botId).
        // Answering with a different bot's token causes "query is too old or query ID is invalid".
        const payloadBotId = payload.b ?? payload.botId;
        let botToken: string;
        if (payloadBotId != null && typeof payloadBotId === 'number') {
          botToken = await getBotTokenByBotId(payloadBotId);
          console.log('[handle-payment-webhook] Using token for bot_id:', payloadBotId);
        } else {
          const botTokens = getTelegramBotTokens();
          botToken = botTokens[0];
          console.log('[handle-payment-webhook] No bot_id in payload, using first configured token');
        }
        
        await answerPreCheckoutQuery(botToken, {
          pre_checkout_query_id: query.id,
          ok: canProcess,
          error_message: canProcess ? undefined : 'This plan is currently unavailable'
        });
        
        console.log('[handle-payment-webhook] Pre-checkout query answered:', {
          queryId: query.id,
          canProcess,
          planType
        });
        
        return new Response('OK', {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
        
      } catch (error) {
        console.error('[handle-payment-webhook] Error processing pre_checkout_query:', error);
        
        // Try to answer with error using correct bot (if we can parse payload)
        try {
          const payload: InvoicePayload = JSON.parse(query.invoice_payload);
          const payloadBotId = payload.b ?? payload.botId;
          const botToken = (payloadBotId != null && typeof payloadBotId === 'number')
            ? await getBotTokenByBotId(payloadBotId)
            : getTelegramBotTokens()[0];
          await answerPreCheckoutQuery(botToken, {
            pre_checkout_query_id: query.id,
            ok: false,
            error_message: 'Internal error processing request'
          });
        } catch (answerError) {
          console.error('[handle-payment-webhook] Failed to answer pre_checkout_query:', answerError);
        }
        
        return new Response('Error', {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
      }
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Handle successful_payment
    if (update.message?.successful_payment) {
      const payment = update.message.successful_payment;
      const userId = update.message.from.id;
      
      try {
        // Parse payload (supports both compact and legacy formats)
        const payload: InvoicePayload = JSON.parse(payment.invoice_payload);
        
        // Extract data from payload (support both compact and legacy formats)
        const planType = payload.p || payload.planType || 'monthly';
        const telegramUserId = payload.u || payload.telegramUserId || userId;
        const botId = payload.b !== undefined ? payload.b : (payload.botId || null);
        const botUsername = payload.botUsername || null; // Not in compact format, can be retrieved via botId if needed
        const isTestPayment = payload.t === 1 || payload.isTestPayment === true;
        
        // Activate premium subscription
        await activatePremiumSubscription(supabase, {
          telegramUserId: telegramUserId,
          botId,
          botUsername,
          isTestPayment,
          planType: planType as 'monthly' | 'annually' | 'lifetime',
          paymentChargeId: payment.telegram_payment_charge_id,
          invoiceMessageId: update.message.message_id
        });
        
        // Note: Premium signature will be generated on next get-user-data call
        // This ensures signature is always fresh and includes latest subscription data
        // No need to sign here - signature generation happens in get-user-data
        
        console.log('[handle-payment-webhook] Payment processed successfully:', {
          userId: telegramUserId,
          planType,
          paymentChargeId: payment.telegram_payment_charge_id
        });
        
        return new Response('OK', {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
        
      } catch (error) {
        console.error('[handle-payment-webhook] Error processing successful_payment:', error);
        return new Response('Error', {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
      }
    }
    
    // Unknown update type - just acknowledge
    console.log('[handle-payment-webhook] Unknown update type:', update);
    return new Response('OK', {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    console.error('[handle-payment-webhook] Unexpected error:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  }
});
