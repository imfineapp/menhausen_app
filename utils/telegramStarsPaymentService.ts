/**
 * Telegram Stars Payment Service
 * 
 * Handles Telegram Stars payment flow for premium subscriptions
 */

import { getTelegramUserId } from './telegramUserUtils';
import { getValidJWTToken } from './supabaseSync/authService';

interface CreateInvoiceRequest {
  planType: 'monthly' | 'annually' | 'lifetime';
}

interface CreateInvoiceResponse {
  success: boolean;
  invoiceUrl?: string;
  error?: string;
  code?: string;
}

class TelegramStarsPaymentService {
  private supabaseUrl: string;
  
  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    if (!this.supabaseUrl) {
      console.warn('[TelegramStarsPaymentService] VITE_SUPABASE_URL not configured');
    }
  }
  
  /**
   * Create invoice for premium subscription
   */
  async createInvoice(planType: 'monthly' | 'annually' | 'lifetime'): Promise<string> {
    const telegramUserId = getTelegramUserId();
    if (!telegramUserId) {
      throw new Error('Telegram user ID not available');
    }
    
    // Get JWT token for authentication
    const jwtToken = await getValidJWTToken();
    if (!jwtToken) {
      throw new Error('JWT token not available. Please authenticate first.');
    }
    
    const response = await fetch(`${this.supabaseUrl}/functions/v1/create-premium-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ planType } as CreateInvoiceRequest)
    });
    
    if (!response.ok) {
      const errorData: CreateInvoiceResponse = await response.json().catch(() => ({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(errorData.error || 'Failed to create invoice');
    }
    
    const data: CreateInvoiceResponse = await response.json();
    
    if (!data.success || !data.invoiceUrl) {
      throw new Error(data.error || 'Failed to create invoice');
    }
    
    return data.invoiceUrl;
  }
  
  /**
   * Open invoice in Telegram WebApp
   */
  async openInvoice(invoiceUrl: string): Promise<'paid' | 'cancelled' | 'failed' | 'pending'> {
    return new Promise((resolve) => {
      if (!window.Telegram?.WebApp?.openInvoice) {
        console.error('[TelegramStarsPaymentService] Telegram WebApp API not available');
        resolve('failed');
        return;
      }
      
      window.Telegram.WebApp.openInvoice(invoiceUrl, (status: 'paid' | 'cancelled' | 'failed' | 'pending') => {
        console.log('[TelegramStarsPaymentService] Payment status:', status);
        resolve(status);
      });
    });
  }
  
  /**
   * Handle payment result
   */
  async handlePaymentResult(
    status: 'paid' | 'cancelled' | 'failed' | 'pending',
    planType: 'monthly' | 'annually' | 'lifetime'
  ): Promise<void> {
    if (status === 'paid') {
      // Update premium status locally
      localStorage.setItem('user-premium-status', 'true');
      localStorage.setItem('user-premium-plan', planType);
      localStorage.setItem('user-premium-purchased-at', new Date().toISOString());
      
      // Sync with Supabase (will be done on next sync)
      // For immediate update, we could trigger a sync here
      
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('premium:activated', { 
        detail: { planType, timestamp: Date.now() } 
      }));
      
      // Haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } else if (status === 'cancelled') {
      // User cancelled - no action needed
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
      }
    } else if (status === 'failed') {
      // Payment failed
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  }
  
  /**
   * Complete payment flow: create invoice and open it
   */
  async purchasePremium(planType: 'monthly' | 'annually' | 'lifetime'): Promise<'paid' | 'cancelled' | 'failed' | 'pending'> {
    try {
      // Create invoice
      const invoiceUrl = await this.createInvoice(planType);
      
      // Open invoice in Telegram
      const paymentStatus = await this.openInvoice(invoiceUrl);
      
      // Handle result
      await this.handlePaymentResult(paymentStatus, planType);
      
      return paymentStatus;
    } catch (error) {
      console.error('[TelegramStarsPaymentService] Purchase error:', error);
      throw error;
    }
  }
}

export const telegramStarsPaymentService = new TelegramStarsPaymentService();
