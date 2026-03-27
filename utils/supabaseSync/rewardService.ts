import { getValidJWTToken } from './authService';

export enum RewardEventType {
  DAILY_CHECKIN = 'daily_checkin',
  ACHIEVEMENT_XP = 'achievement_xp',
  CARD_COMPLETE_LEVEL_1 = 'card_complete_level_1',
  CARD_COMPLETE_LEVEL_2 = 'card_complete_level_2',
  CARD_COMPLETE_LEVEL_3 = 'card_complete_level_3',
  CARD_COMPLETE_LEVEL_4 = 'card_complete_level_4',
  CARD_COMPLETE_LEVEL_5 = 'card_complete_level_5',
}

export interface GrantRewardInput {
  eventType: RewardEventType | string;
  referenceId: string;
  payload?: Record<string, unknown>;
}

export interface GrantRewardOutput {
  success: boolean;
  granted: boolean;
  reason?: string;
  points?: number;
  balance?: number;
  transactionId?: string;
}

function getInitDataOrNull(): string | null {
  const initData = window.Telegram?.WebApp?.initData;
  return initData || null;
}

export async function grantReward(input: GrantRewardInput): Promise<GrantRewardOutput> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl) {
    return { success: false, granted: false, reason: 'missing_supabase_url' };
  }

  const jwt = await getValidJWTToken();
  const initData = jwt ? null : getInitDataOrNull();
  if (!jwt && !initData) {
    return { success: false, granted: false, reason: 'missing_auth' };
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: anonKey,
  };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  if (!jwt && initData) headers['X-Telegram-Init-Data'] = initData;

  const response = await fetch(`${supabaseUrl}/functions/v1/grant-reward`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      eventType: input.eventType,
      referenceId: input.referenceId,
      payload: input.payload || {},
    }),
  });

  if (!response.ok) {
    return { success: false, granted: false, reason: `http_${response.status}` };
  }

  const data = await response.json();
  return {
    success: !!data?.success,
    granted: !!data?.granted,
    reason: data?.reason,
    points: data?.points,
    balance: data?.balance,
    transactionId: data?.transactionId,
  };
}
