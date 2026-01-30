/**
 * GET /functions/v1/get-user-data
 * 
 * Fetches all user data from Supabase for a Telegram user
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateTelegramAuthWithMultipleTokens } from '../_shared/telegram-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-init-data',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Access-Control-Allow-Credentials': 'false',
};

/**
 * Extract telegram_user_id from JWT token
 */
function getTelegramUserIdFromJWT(jwtToken: string): number | null {
  try {
    // JWT format: header.payload.signature
    const parts = jwtToken.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (base64url)
    const payload = parts[1];
    const decoded = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(
          atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
          c => c.charCodeAt(0)
        )
      )
    );

    // Extract telegram_user_id from user_metadata
    return decoded.user_metadata?.telegram_user_id || null;
  } catch (error) {
    console.error('Error extracting telegram_user_id from JWT:', error);
    return null;
  }
}

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
    .maybeSingle();

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
    .maybeSingle();

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
    .maybeSingle();

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
    .maybeSingle();

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
    .maybeSingle();

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
    .maybeSingle();

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
    .maybeSingle();

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
    .maybeSingle();

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
  // Use maybeSingle() to avoid exception if user doesn't exist
  const { data: user } = await supabase
    .from('users')
    .select('last_sync_at')
    .eq('telegram_user_id', telegramUserId)
    .maybeSingle();

  return {
    lastSyncAt: user?.last_sync_at || null,
    syncVersion: 1,
  };
}

serve(async (req) => {
  try {
    // Handle CORS preflight - MUST be absolute first, before any other code
    if (req.method === 'OPTIONS') {
      const origin = req.headers.get('Origin') || '*';
      console.log('[get-user-data] OPTIONS preflight handled, origin:', origin);
      return new Response('', {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-init-data',
          'Access-Control-Max-Age': '86400',
          'Content-Length': '0',
        },
      });
    }

    const method = req.method;
    const origin = req.headers.get('Origin') || '*';
    
    console.log('[get-user-data] Request received:', {
      method,
      url: req.url,
      origin,
      hasInitData: !!req.headers.get('X-Telegram-Init-Data'),
      hasAuth: !!req.headers.get('Authorization'),
    });
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    let telegramUserId: number;
    let supabase: any;

    // Try to get JWT token from Authorization header (new method)
    const authHeader = req.headers.get('Authorization');
    const jwtToken = authHeader?.replace('Bearer ', '');

    if (jwtToken) {
      // New JWT-based authentication
      // Extract telegram_user_id from JWT
      const extractedUserId = getTelegramUserIdFromJWT(jwtToken);
      
      if (!extractedUserId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid JWT token: missing telegram_user_id in claims',
            code: 'AUTH_FAILED',
          } as GetUserDataResponse),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      telegramUserId = extractedUserId;

      // Create Supabase client with JWT token (uses Anon Key + JWT)
      // This will respect RLS policies
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      });

      // Verify the JWT token is valid by getting the user
      const { data: { user }, error: userError } = await supabase.auth.getUser(jwtToken);
      
      if (userError || !user) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid or expired JWT token',
            code: 'AUTH_FAILED',
          } as GetUserDataResponse),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      // Fallback: Telegram initData authentication (backward compatibility)
      const initData = req.headers.get('X-Telegram-Init-Data');
      if (!initData) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Missing Authorization header (JWT token) or X-Telegram-Init-Data header',
            code: 'AUTH_FAILED',
          } as GetUserDataResponse),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Validate Telegram authentication (tries multiple bot tokens)
      const authResult = await validateTelegramAuthWithMultipleTokens(initData);
      
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

      telegramUserId = authResult.userId;

      // Use Service Role Key for backward compatibility (bypasses RLS)
      // Note: This should be deprecated in favor of JWT tokens
      if (!supabaseServiceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
      }

      supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    // Optimize: Skip separate existence check, fetch data directly
    // If user doesn't exist, all queries will return null/empty, which is fine
    // This eliminates one round-trip to the database (~400ms saved)
    
    // Fetch all user data in parallel (faster than sequential)
    const [userData, metadata] = await Promise.all([
      fetchAllUserData(supabase, telegramUserId),
      getSyncMetadata(supabase, telegramUserId),
    ]);

    // If no data exists at all, user probably doesn't exist
    // But this is just an optimization - we still return empty data structure

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
    console.error('[get-user-data] Error:', error);
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
