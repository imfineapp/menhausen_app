import { getValidJWTToken } from './authService';

export enum RewardEventType {
  DAILY_CHECKIN = 'daily_checkin',
  ACHIEVEMENT_UNLOCK = 'achievement_unlock',
  CARD_COMPLETE_LEVEL_1 = 'card_complete_level_1',
  CARD_COMPLETE_LEVEL_2 = 'card_complete_level_2',
  CARD_COMPLETE_LEVEL_3 = 'card_complete_level_3',
  CARD_COMPLETE_LEVEL_4 = 'card_complete_level_4',
  CARD_COMPLETE_LEVEL_5 = 'card_complete_level_5',
  BREATHING_46_COMPLETED = 'breathing_46_completed',
}

export interface GrantRewardInput {
  eventType: RewardEventType | string;
  referenceId: string;
  payload?: Record<string, unknown>;
}

export type GrantRewardReason =
  | 'missing_supabase_url'
  | 'missing_auth'
  | 'network_error'
  | `http_${number}`
  | string;

export interface GrantRewardOutput {
  success: boolean;
  granted: boolean;
  reason?: GrantRewardReason;
  points?: number;
  balance?: number;
  transactionId?: string;
}

export interface OfflineRewardQueueItem extends GrantRewardInput {
  queuedAt: string;
}

const OFFLINE_QUEUE_KEY = 'menhausen_reward_offline_queue';

function getInitDataOrNull(): string | null {
  const initData = window.Telegram?.WebApp?.initData;
  return initData || null;
}

function readOfflineQueue(): OfflineRewardQueueItem[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOfflineQueue(queue: OfflineRewardQueueItem[]) {
  if (queue.length === 0) {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    return;
  }
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function getOfflineRewardQueue(): OfflineRewardQueueItem[] {
  return readOfflineQueue();
}

export function queueOfflineReward(input: GrantRewardInput) {
  const queue = readOfflineQueue();
  const deduped = queue.filter(
    (item) => !(item.eventType === input.eventType && item.referenceId === input.referenceId),
  );
  deduped.push({
    eventType: input.eventType,
    referenceId: input.referenceId,
    payload: input.payload || {},
    queuedAt: new Date().toISOString(),
  });
  writeOfflineQueue(deduped);
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

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/grant-reward`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        eventType: input.eventType,
        referenceId: input.referenceId,
        payload: input.payload || {},
      }),
    });
  } catch {
    return { success: false, granted: false, reason: 'network_error' };
  }

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

export async function replayOfflineRewardQueue() {
  const queue = readOfflineQueue();
  if (queue.length === 0) return;

  const remaining: OfflineRewardQueueItem[] = [];
  for (const item of queue) {
    const result = await grantReward({
      eventType: item.eventType,
      referenceId: item.referenceId,
      payload: item.payload || {},
    });
    if (!(result.success && (result.granted || result.reason === 'already_granted'))) {
      remaining.push(item);
    }
  }

  writeOfflineQueue(remaining);
}

export async function reconcileRewardBalance(): Promise<GrantRewardOutput> {
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
    apikey: anonKey,
  };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  if (!jwt && initData) headers['X-Telegram-Init-Data'] = initData;

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/grant-reward?action=reconcile`, {
      method: 'GET',
      headers,
    });
  } catch {
    return { success: false, granted: false, reason: 'network_error' };
  }

  if (!response.ok) {
    return { success: false, granted: false, reason: `http_${response.status}` };
  }

  const data = await response.json();
  return {
    success: !!data?.success,
    granted: !!data?.reconciled,
    reason: data?.reason,
    balance: data?.balance,
  };
}
