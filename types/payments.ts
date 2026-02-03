/**
 * Payment-related TypeScript types
 */

export type PlanType = 'monthly' | 'annually' | 'lifetime';

export type PaymentStatus = 'paid' | 'cancelled' | 'failed' | 'pending';

export interface PremiumPlan {
  id: PlanType;
  title: string;
  price: number; // Price in Telegram Stars
  period: string;
  features: string[];
  recommended?: boolean;
  savings?: string;
}

export interface PremiumSubscription {
  id: string;
  telegramUserId: number;
  botId: number | null;
  botUsername: string | null;
  isTestPayment: boolean;
  planType: PlanType;
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'refunded';
  startsAt: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceResponse {
  success: boolean;
  invoiceUrl?: string;
  error?: string;
  code?: string;
}
