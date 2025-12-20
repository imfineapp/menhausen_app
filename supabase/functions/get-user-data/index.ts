/**
 * GET /functions/v1/get-user-data
 * 
 * Fetches all user data from Supabase for a Telegram user
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateTelegramAuth, getTelegramBotToken } from '../_shared/telegram-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-init-data',
};

interface GetUserDataResponse {
  success: boolean;
  data?: any;
  error?: string;
  code?: string;
  metadata?: {
    lastSyncAt: string | null;
    syncVersion: number;
  };
}

/**
 * Fetch all user data from all tables
 */
async function fetchAllUserData(supabase: any, telegramUserId: number): Promise<any> {
  const data: any = {};

  // Fetch survey results
  const { data: surveyResults } = await supabase
    .from('survey_results')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .single();

  if (surveyResults) {
    data.surveyResults = {
      screen01: surveyResults.screen01 || [],
      screen02: surveyResults.screen02 || [],
      screen03: surveyResults.screen03 || [],
      screen04: surveyResults.screen04 || [],
      screen05: surveyResults.screen05 || [],
      completedAt: surveyResults.completed_at,
    };
  }

  // Fetch daily checkins
  const { data: checkins } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .order('date_key', { ascending: false });

  if (checkins && checkins.length > 0) {
    const checkinsObj: Record<string, any> = {};
    checkins.forEach((checkin: any) => {
      checkinsObj[checkin.date_key] = {
        mood: checkin.mood,
        value: checkin.value,
        color: checkin.color,
        completed: checkin.completed,
      };
    });
    data.dailyCheckins = checkinsObj;
  }

  // Fetch user stats
  const { data: userStats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .single();

  if (userStats) {
    data.userStats = {
      version: userStats.version || 1,
      checkins: userStats.checkins || 0,
      checkinStreak: userStats.checkin_streak || 0,
      lastCheckinDate: userStats.last_checkin_date,
      cardsOpened: userStats.cards_opened || {},
      topicsCompleted: userStats.topics_completed || [],
      cardsRepeated: userStats.cards_repeated || {},
      topicsRepeated: userStats.topics_repeated || [],
      articlesRead: userStats.articles_read || 0,
      readArticleIds: userStats.read_article_ids || [],
      openedCardIds: userStats.opened_card_ids || [],
      referralsInvited: userStats.referrals_invited || 0,
      referralsPremium: userStats.referrals_premium || 0,
      lastUpdated: userStats.last_updated,
    };
  }

  // Fetch achievements
  const { data: achievements } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .single();

  if (achievements) {
    data.achievements = {
      version: achievements.version || 1,
      achievements: achievements.achievements || {},
      totalXP: achievements.total_xp || 0,
      unlockedCount: achievements.unlocked_count || 0,
    };
  }

  // Fetch points
  const { data: userPoints } = await supabase
    .from('user_points')
    .select('balance')
    .eq('telegram_user_id', telegramUserId)
    .single();

  const { data: transactions } = await supabase
    .from('points_transactions')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .order('timestamp', { ascending: true });

  if (userPoints || (transactions && transactions.length > 0)) {
    data.points = {
      balance: userPoints?.balance || 0,
      transactions: (transactions || []).map((tx: any) => ({
        id: tx.transaction_id,
        type: tx.type,
        amount: tx.amount,
        balanceAfter: tx.balance_after,
        note: tx.note,
        correlationId: tx.correlation_id,
        timestamp: tx.timestamp,
      })),
    };
  }

  // Fetch preferences
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .single();

  if (preferences) {
    data.preferences = {
      language: preferences.language || 'en',
      theme: preferences.theme || 'light',
      notifications: preferences.notifications ?? true,
      analytics: preferences.analytics ?? false,
    };
  }

  // Fetch flow progress
  const { data: flowProgress } = await supabase
    .from('app_flow_progress')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .single();

  if (flowProgress) {
    data.flowProgress = {
      onboardingCompleted: flowProgress.onboarding_completed || false,
      surveyCompleted: flowProgress.survey_completed || false,
      psychologicalTestCompleted: flowProgress.psychological_test_completed || false,
      pinEnabled: flowProgress.pin_enabled || false,
      pinCompleted: flowProgress.pin_completed || false,
      firstCheckinDone: flowProgress.first_checkin_done || false,
      firstRewardShown: flowProgress.first_reward_shown || false,
    };
  }

  // Fetch psychological test results
  const { data: psychologicalTest } = await supabase
    .from('psychological_test_results')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .single();

  if (psychologicalTest) {
    data.psychologicalTest = {
      lastCompletedAt: psychologicalTest.last_completed_at,
      scores: psychologicalTest.scores || {},
      percentages: psychologicalTest.percentages || {},
      history: psychologicalTest.history || [],
    };
  }

  // Fetch card progress
  const { data: cardProgress } = await supabase
    .from('card_progress')
    .select('*')
    .eq('telegram_user_id', telegramUserId);

  if (cardProgress && cardProgress.length > 0) {
    const cardProgressObj: Record<string, any> = {};
    cardProgress.forEach((card: any) => {
      cardProgressObj[card.card_id] = {
        cardId: card.card_id,
        completedAttempts: card.completed_attempts || [],
        isCompleted: card.is_completed || false,
        totalCompletedAttempts: card.total_completed_attempts || 0,
      };
    });
    data.cardProgress = cardProgressObj;
  }

  // Fetch referral data
  const { data: referralData } = await supabase
    .from('referral_data')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .single();

  if (referralData) {
    data.referralData = {
      referredBy: referralData.referred_by,
      referralCode: referralData.referral_code,
      referralRegistered: referralData.referral_registered || false,
      referralList: referralData.referral_list || [],
    };
  }

  return data;
}

/**
 * Get sync metadata
 */
async function getSyncMetadata(supabase: any, telegramUserId: number): Promise<{ lastSyncAt: string | null; syncVersion: number }> {
  const { data: user } = await supabase
    .from('users')
    .select('last_sync_at')
    .eq('telegram_user_id', telegramUserId)
    .single();

  return {
    lastSyncAt: user?.last_sync_at || null,
    syncVersion: 1,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Telegram initData from header
    const initData = req.headers.get('X-Telegram-Init-Data');
    if (!initData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing X-Telegram-Init-Data header',
          code: 'AUTH_FAILED',
        } as GetUserDataResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate Telegram authentication
    const botToken = getTelegramBotToken();
    const authResult = await validateTelegramAuth(initData, botToken);
    
    if (!authResult.valid || !authResult.userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: authResult.error || 'Authentication failed',
          code: 'AUTH_FAILED',
        } as GetUserDataResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const telegramUserId = authResult.userId;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('telegram_user_id')
      .eq('telegram_user_id', telegramUserId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      throw userError;
    }

    // If user doesn't exist, return empty data
    if (!user) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {},
          metadata: {
            lastSyncAt: null,
            syncVersion: 1,
          },
        } as GetUserDataResponse),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch all user data
    const userData = await fetchAllUserData(supabase, telegramUserId);
    const metadata = await getSyncMetadata(supabase, telegramUserId);

    return new Response(
      JSON.stringify({
        success: true,
        data: userData,
        metadata,
      } as GetUserDataResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-user-data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      } as GetUserDataResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
