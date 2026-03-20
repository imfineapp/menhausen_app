import { telegramStarsPaymentService } from '@/utils/telegramStarsPaymentService'

export type PlanId = 'monthly' | 'annually' | 'lifetime'

export async function purchasePremium(planType: PlanId): Promise<'paid' | 'cancelled' | 'failed' | 'pending'> {
  return telegramStarsPaymentService.purchasePremium(planType)
}

