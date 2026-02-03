/**
 * Telegram Bot API Utilities
 * 
 * Helper functions for interacting with Telegram Bot API
 * Used for creating invoices, handling payments, and refunds
 */

const BOT_API_BASE = 'https://api.telegram.org/bot';

export interface CreateInvoiceLinkParams {
  title: string;
  description: string;
  payload: string;
  currency: string;
  prices: Array<{ label: string; amount: number }>;
}

export interface AnswerPreCheckoutQueryParams {
  pre_checkout_query_id: string;
  ok: boolean;
  error_message?: string;
}

/**
 * Create invoice link for Telegram Stars payment
 * 
 * @param botToken - Telegram bot token
 * @param params - Invoice parameters
 * @returns Invoice URL
 */
export async function createInvoiceLink(
  botToken: string,
  params: CreateInvoiceLinkParams
): Promise<string> {
  const response = await fetch(`${BOT_API_BASE}${botToken}/createInvoiceLink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      provider_token: '', // Пустая строка для цифровых товаров
    })
  });

  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(`Failed to create invoice: ${data.description || 'Unknown error'}`);
  }
  
  return data.result;
}

/**
 * Answer pre-checkout query (must respond within 10 seconds!)
 * 
 * @param botToken - Telegram bot token
 * @param params - Answer parameters
 */
export async function answerPreCheckoutQuery(
  botToken: string,
  params: AnswerPreCheckoutQueryParams
): Promise<void> {
  const response = await fetch(`${BOT_API_BASE}${botToken}/answerPreCheckoutQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pre_checkout_query_id: params.pre_checkout_query_id,
      ok: params.ok,
      ...(params.error_message && { error_message: params.error_message })
    })
  });

  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(`Failed to answer pre-checkout query: ${data.description || 'Unknown error'}`);
  }
}

/**
 * Refund Telegram Stars payment
 * 
 * @param botToken - Telegram bot token
 * @param userId - Telegram user ID
 * @param telegramPaymentChargeId - Payment charge ID from successful_payment
 * @returns true if refund successful
 */
export async function refundStarPayment(
  botToken: string,
  userId: number,
  telegramPaymentChargeId: string
): Promise<boolean> {
  const response = await fetch(`${BOT_API_BASE}${botToken}/refundStarPayment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      telegram_payment_charge_id: telegramPaymentChargeId
    })
  });

  const data = await response.json();
  return data.ok === true;
}

/**
 * Get bot information (bot_id, username, etc.)
 * 
 * @param botToken - Telegram bot token
 * @returns Bot information
 */
export async function getBotInfo(botToken: string): Promise<{ id: number; username?: string; first_name?: string }> {
  const response = await fetch(`${BOT_API_BASE}${botToken}/getMe`);
  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(`Failed to get bot info: ${data.description || 'Unknown error'}`);
  }
  
  return {
    id: data.result.id,
    username: data.result.username,
    first_name: data.result.first_name
  };
}
