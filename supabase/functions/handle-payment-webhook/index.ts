/**
 * POST /functions/v1/handle-payment-webhook
 * 
 * Handles webhook requests from Telegram Bot API for payment processing
 * Processes pre_checkout_query and successful_payment updates
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { answerPreCheckoutQuery } from '../_shared/telegram-bot-api.ts';
import { getTelegramBotTokens } from '../_shared/telegram-auth.ts';

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
  planType: 'monthly' | 'annually' | 'lifetime';
  telegramUserId: number;
  botId?: number;
  botUsername?: string;
  isTestPayment?: boolean;
  timestamp: number;
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
 * Check if plan is available (for pre_checkout_query)
 * This is a fast check - must respond within 10 seconds!
 */
async function checkPlanAvailability(planType: string): Promise<boolean> {
  // For now, all plans are always available
  // In the future, can add checks like:
  // - Plan type validation
  // - User eligibility checks
  // - Inventory checks (if applicable)
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
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Handle pre_checkout_query (must respond within 10 seconds!)
    if (update.pre_checkout_query) {
      const query = update.pre_checkout_query;
      
      try {
        // Parse payload
        const payload: InvoicePayload = JSON.parse(query.invoice_payload);
        
        // Fast check - must be quick!
        const canProcess = await checkPlanAvailability(payload.planType);
        
        // Get bot token to answer the query
        // We need to find which bot token to use
        // Since we have botId in payload, we could map it, but for simplicity
        // we'll try all tokens (answerPreCheckoutQuery will work with any token for the same bot)
        const botTokens = getTelegramBotTokens();
        const botToken = botTokens[0]; // Use first token (all tokens for same bot should work)
        
        // Answer within 10 seconds!
        await answerPreCheckoutQuery(botToken, {
          pre_checkout_query_id: query.id,
          ok: canProcess,
          error_message: canProcess ? undefined : 'This plan is currently unavailable'
        });
        
        console.log('[handle-payment-webhook] Pre-checkout query answered:', {
          queryId: query.id,
          canProcess,
          planType: payload.planType
        });
        
        return new Response('OK', {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
        
      } catch (error) {
        console.error('[handle-payment-webhook] Error processing pre_checkout_query:', error);
        
        // Try to answer with error
        try {
          const botTokens = getTelegramBotTokens();
          await answerPreCheckoutQuery(botTokens[0], {
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
    
    // Handle successful_payment
    if (update.message?.successful_payment) {
      const payment = update.message.successful_payment;
      const userId = update.message.from.id;
      
      try {
        // Parse payload
        const payload: InvoicePayload = JSON.parse(payment.invoice_payload);
        
        // Extract bot information from payload
        const botId = payload.botId || null;
        const botUsername = payload.botUsername || null;
        const isTestPayment = payload.isTestPayment === true;
        
        // Activate premium subscription
        await activatePremiumSubscription(supabase, {
          telegramUserId: userId,
          botId,
          botUsername,
          isTestPayment,
          planType: payload.planType,
          paymentChargeId: payment.telegram_payment_charge_id,
          invoiceMessageId: update.message.message_id
        });
        
        console.log('[handle-payment-webhook] Payment processed successfully:', {
          userId,
          planType: payload.planType,
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
