/**
 * POST /functions/v1/sync-user-data
 * 
 * Full sync of all user data (upload all localStorage data to Supabase)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateTelegramAuth, getTelegramBotToken } from '../_shared/telegram-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-init-data',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Access-Control-Allow-Credentials': 'false',
};

// Helper function to create CORS response
function corsResponse(body: any, status: number = 200, additionalHeaders: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: {
      ...corsHeaders,
      ...additionalHeaders,
    },
  });
}

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

interface SyncUserDataResponse {
  success: boolean;
  syncedTypes?: string[];
  conflicts?: Array<{
    type: string;
    resolved: 'remote' | 'merged' | 'local';
  }>;
  metadata?: {
    lastSyncAt: string;
    syncVersion: number;
  };
  error?: string;
  code?: string;
}

/**
 * Sync survey results
 */
async function syncSurveyResults(supabase: any, telegramUserId: number, data: any): Promise<void> {
  if (!data || typeof data !== 'object') return;

  await supabase
    .from('survey_results')
    .upsert({
      telegram_user_id: telegramUserId,
      screen01: data.screen01 || null,
      screen02: data.screen02 || null,
      screen03: data.screen03 || null,
      screen04: data.screen04 || null,
      screen05: data.screen05 || null,
      completed_at: data.completedAt || null,
      encrypted_data: data.encryptedData || null,
      version: 1,
    }, {
      onConflict: 'telegram_user_id',
    });
}

/**
 * Sync daily checkins
 * Uses upsert to preserve existing checkins that are not in the data object
 * Only updates/inserts the checkins provided in the data parameter
 */
async function syncDailyCheckins(supabase: any, telegramUserId: number, data: any): Promise<void> {
  if (!data || typeof data !== 'object') return;

  // Upsert checkins (update existing or insert new)
  // This preserves checkins in the database that are not in the data object
  const checkins = Object.keys(data).map(dateKey => ({
    telegram_user_id: telegramUserId,
    date_key: dateKey,
    mood: data[dateKey].mood || null,
    value: data[dateKey].value || null,
    color: data[dateKey].color || null,
    encrypted_data: data[dateKey].encryptedData || null,
    completed: data[dateKey].completed !== undefined ? data[dateKey].completed : true,
  }));

  console.log(`[syncDailyCheckins] Upserting ${checkins.length} checkins for user ${telegramUserId}`);

  if (checkins.length > 0) {
    const { error } = await supabase
      .from('daily_checkins')
      .upsert(checkins, {
        onConflict: 'telegram_user_id,date_key',
      });

    if (error) {
      console.error('[syncDailyCheckins] Error upserting checkins:', error);
      throw error;
    }
    console.log(`[syncDailyCheckins] Successfully upserted ${checkins.length} checkins`);
  }
}

/**
 * Sync user stats
 */
async function syncUserStats(supabase: any, telegramUserId: number, data: any): Promise<void> {
  if (!data || typeof data !== 'object') return;

  await supabase
    .from('user_stats')
    .upsert({
      telegram_user_id: telegramUserId,
      version: data.version || 1,
      checkins: data.checkins || 0,
      checkin_streak: data.checkinStreak || 0,
      last_checkin_date: data.lastCheckinDate || null,
      cards_opened: data.cardsOpened || {},
      topics_completed: data.topicsCompleted || [],
      cards_repeated: data.cardsRepeated || {},
      topics_repeated: data.topicsRepeated || [],
      articles_read: data.articlesRead || 0,
      read_article_ids: data.readArticleIds || [],
      opened_card_ids: data.openedCardIds || [],
      referrals_invited: data.referralsInvited || 0,
      referrals_premium: data.referralsPremium || 0,
      last_updated: data.lastUpdated || new Date().toISOString(),
    }, {
      onConflict: 'telegram_user_id',
    });
}

/**
 * Sync achievements
 */
async function syncAchievements(supabase: any, telegramUserId: number, data: any): Promise<void> {
  if (!data || typeof data !== 'object') return;

  await supabase
    .from('user_achievements')
    .upsert({
      telegram_user_id: telegramUserId,
      version: data.version || 1,
      achievements: data.achievements || {},
      total_xp: data.totalXP || 0,
      unlocked_count: data.unlockedCount || 0,
      last_synced_at: new Date().toISOString(),
    }, {
      onConflict: 'telegram_user_id',
    });
}

/**
 * Sync points
 */
async function syncPoints(supabase: any, telegramUserId: number, data: any): Promise<void> {
  if (!data || typeof data !== 'object') return;

  // Sync balance
  await supabase
    .from('user_points')
    .upsert({
      telegram_user_id: telegramUserId,
      balance: data.balance || 0,
    }, {
      onConflict: 'telegram_user_id',
    });

  // Sync transactions
  if (data.transactions && Array.isArray(data.transactions)) {
    // Delete existing transactions for this user
    await supabase
      .from('points_transactions')
      .delete()
      .eq('telegram_user_id', telegramUserId);

    // Insert all transactions
    const transactions = data.transactions.map((tx: any) => ({
      telegram_user_id: telegramUserId,
      transaction_id: tx.id,
      type: tx.type,
      amount: tx.amount,
      balance_after: tx.balanceAfter,
      note: tx.note || null,
      correlation_id: tx.correlationId || null,
      timestamp: tx.timestamp,
    }));

    if (transactions.length > 0) {
      await supabase
        .from('points_transactions')
        .insert(transactions);
    }
  }
}

/**
 * Sync preferences
 */
async function syncPreferences(supabase: any, telegramUserId: number, data: any): Promise<void> {
  if (!data || typeof data !== 'object') return;

  await supabase
    .from('user_preferences')
    .upsert({
      telegram_user_id: telegramUserId,
      language: data.language || 'en',
      theme: data.theme || 'light',
      notifications: data.notifications !== undefined ? data.notifications : true,
      analytics: data.analytics !== undefined ? data.analytics : false,
    }, {
      onConflict: 'telegram_user_id',
    });
}

/**
 * Sync flow progress
 */
async function syncFlowProgress(supabase: any, telegramUserId: number, data: any): Promise<void> {
  if (!data || typeof data !== 'object') return;

  await supabase
    .from('app_flow_progress')
    .upsert({
      telegram_user_id: telegramUserId,
      onboarding_completed: data.onboardingCompleted || false,
      survey_completed: data.surveyCompleted || false,
      psychological_test_completed: data.psychologicalTestCompleted || false,
      pin_enabled: data.pinEnabled || false,
      pin_completed: data.pinCompleted || false,
      first_checkin_done: data.firstCheckinDone || false,
      first_reward_shown: data.firstRewardShown || false,
    }, {
      onConflict: 'telegram_user_id',
    });
}

/**
 * Sync psychological test results
 */
async function syncPsychologicalTest(supabase: any, telegramUserId: number, data: any): Promise<void> {
  if (!data || typeof data !== 'object') return;

  await supabase
    .from('psychological_test_results')
    .upsert({
      telegram_user_id: telegramUserId,
      last_completed_at: data.lastCompletedAt || null,
      scores: data.scores || null,
      percentages: data.percentages || null,
      history: data.history || [],
      encrypted_data: data.encryptedData || null,
    }, {
      onConflict: 'telegram_user_id',
    });
}

/**
 * Sync card progress
 */
async function syncCardProgress(supabase: any, telegramUserId: number, data: any): Promise<void> {
  if (!data || typeof data !== 'object') return;

  // Delete existing card progress for this user
  await supabase
    .from('card_progress')
    .delete()
    .eq('telegram_user_id', telegramUserId);

  // Insert all card progress
  const cardProgress = Object.keys(data).map(cardId => ({
    telegram_user_id: telegramUserId,
    card_id: cardId,
    completed_attempts: data[cardId].completedAttempts || [],
    is_completed: data[cardId].isCompleted || false,
    total_completed_attempts: data[cardId].totalCompletedAttempts || 0,
  }));

  if (cardProgress.length > 0) {
    await supabase
      .from('card_progress')
      .insert(cardProgress);
  }
}

/**
 * Sync referral data
 */
async function syncReferralData(supabase: any, telegramUserId: number, data: any): Promise<void> {
  if (!data || typeof data !== 'object') return;

  await supabase
    .from('referral_data')
    .upsert({
      telegram_user_id: telegramUserId,
      referred_by: data.referredBy || null,
      referral_code: data.referralCode || null,
      referral_registered: data.referralRegistered || false,
      referral_list: data.referralList || [],
    }, {
      onConflict: 'telegram_user_id',
    });
}

/**
 * Update sync metadata for a data type
 */
async function updateSyncMetadata(supabase: any, telegramUserId: number, dataType: string): Promise<void> {
  await supabase
    .from('sync_metadata')
    .upsert({
      telegram_user_id: telegramUserId,
      data_type: dataType,
      last_synced_at: new Date().toISOString(),
      sync_version: 1,
    }, {
      onConflict: 'telegram_user_id,data_type',
    });
}

serve(async (req) => {
  try {
    // Handle CORS preflight - MUST be absolute first, before any other code
    if (req.method === 'OPTIONS') {
      const origin = req.headers.get('Origin') || '*';
      console.log('[sync-user-data] OPTIONS preflight handled, origin:', origin);
      return new Response('', {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-init-data',
          'Access-Control-Max-Age': '86400',
          'Content-Length': '0',
        },
      });
    }

    const method = req.method;
    const origin = req.headers.get('Origin') || '*';
    
    console.log('[sync-user-data] Request received:', {
      method,
      url: req.url,
      origin,
      hasInitData: !!req.headers.get('X-Telegram-Init-Data'),
      hasAuth: !!req.headers.get('Authorization'),
    });

    // Support both POST (full sync) and PATCH (incremental sync)
    if (req.method !== 'POST' && req.method !== 'PATCH') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Method not allowed. Use POST for full sync or PATCH for incremental sync',
          code: 'INVALID_REQUEST',
        } as SyncUserDataResponse),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
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
          } as SyncUserDataResponse),
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
          } as SyncUserDataResponse),
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
          } as SyncUserDataResponse),
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
          } as SyncUserDataResponse),
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

    // Parse request body
    const requestData = await req.json();
    
    // Handle PATCH (incremental sync) vs POST (full sync)
    if (req.method === 'PATCH') {
      // PATCH request: sync single data type
      if (!requestData || !requestData.dataType || requestData.data === undefined) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid request body - missing dataType or data field for PATCH',
            code: 'INVALID_REQUEST',
          } as SyncUserDataResponse),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // supabase client already initialized above

      // Ensure user exists
      const now = new Date().toISOString();
      await supabase
        .from('users')
        .upsert({
          telegram_user_id: telegramUserId,
          updated_at: now,
          last_sync_at: now,
        }, {
          onConflict: 'telegram_user_id',
        });

      // Sync single data type
      const dataType = requestData.dataType as string;
      const syncedTypes: string[] = [];
      const data = { [dataType]: requestData.data };

      // Use existing sync functions
      if (dataType === 'surveyResults' && data.surveyResults) {
        await syncSurveyResults(supabase, telegramUserId, data.surveyResults);
        await updateSyncMetadata(supabase, telegramUserId, 'surveyResults');
        syncedTypes.push('surveyResults');
      } else if (dataType === 'dailyCheckins' && data.dailyCheckins) {
        await syncDailyCheckins(supabase, telegramUserId, data.dailyCheckins);
        await updateSyncMetadata(supabase, telegramUserId, 'dailyCheckins');
        syncedTypes.push('dailyCheckins');
      } else if (dataType === 'userStats' && data.userStats) {
        await syncUserStats(supabase, telegramUserId, data.userStats);
        await updateSyncMetadata(supabase, telegramUserId, 'userStats');
        syncedTypes.push('userStats');
      } else if (dataType === 'achievements' && data.achievements) {
        await syncAchievements(supabase, telegramUserId, data.achievements);
        await updateSyncMetadata(supabase, telegramUserId, 'achievements');
        syncedTypes.push('achievements');
      } else if (dataType === 'points' && data.points) {
        await syncPoints(supabase, telegramUserId, data.points);
        await updateSyncMetadata(supabase, telegramUserId, 'points');
        syncedTypes.push('points');
      } else if (dataType === 'preferences' && data.preferences) {
        await syncPreferences(supabase, telegramUserId, data.preferences);
        await updateSyncMetadata(supabase, telegramUserId, 'preferences');
        syncedTypes.push('preferences');
      } else if (dataType === 'flowProgress' && data.flowProgress) {
        await syncFlowProgress(supabase, telegramUserId, data.flowProgress);
        await updateSyncMetadata(supabase, telegramUserId, 'flowProgress');
        syncedTypes.push('flowProgress');
      } else if (dataType === 'psychologicalTest' && data.psychologicalTest) {
        await syncPsychologicalTest(supabase, telegramUserId, data.psychologicalTest);
        await updateSyncMetadata(supabase, telegramUserId, 'psychologicalTest');
        syncedTypes.push('psychologicalTest');
      } else if (dataType === 'cardProgress' && data.cardProgress) {
        await syncCardProgress(supabase, telegramUserId, data.cardProgress);
        await updateSyncMetadata(supabase, telegramUserId, 'cardProgress');
        syncedTypes.push('cardProgress');
      } else if (dataType === 'referralData' && data.referralData) {
        await syncReferralData(supabase, telegramUserId, data.referralData);
        await updateSyncMetadata(supabase, telegramUserId, 'referralData');
        syncedTypes.push('referralData');
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Unknown or unsupported dataType: ${dataType}`,
            code: 'INVALID_REQUEST',
          } as SyncUserDataResponse),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
  }

  return new Response(
        JSON.stringify({
          success: true,
          syncedTypes,
          metadata: {
            lastSyncAt: now,
            syncVersion: 1,
          },
        } as SyncUserDataResponse),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // POST request: full sync (existing logic)
    if (!requestData || !requestData.data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request body - missing data field',
          code: 'INVALID_REQUEST',
        } as SyncUserDataResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = requestData.data;

    // Supabase client already initialized above (supabase variable)
    // No need to reinitialize

    // Ensure user exists
    const now = new Date().toISOString();
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        telegram_user_id: telegramUserId,
        updated_at: now,
        last_sync_at: now,
      }, {
        onConflict: 'telegram_user_id',
      });

    if (upsertError) {
      throw upsertError;
    }

    // Sync all data types
    const syncedTypes: string[] = [];

    if (data.surveyResults) {
      await syncSurveyResults(supabase, telegramUserId, data.surveyResults);
      await updateSyncMetadata(supabase, telegramUserId, 'surveyResults');
      syncedTypes.push('surveyResults');
    }

    if (data.dailyCheckins) {
      await syncDailyCheckins(supabase, telegramUserId, data.dailyCheckins);
      await updateSyncMetadata(supabase, telegramUserId, 'dailyCheckins');
      syncedTypes.push('dailyCheckins');
    }

    if (data.userStats) {
      await syncUserStats(supabase, telegramUserId, data.userStats);
      await updateSyncMetadata(supabase, telegramUserId, 'userStats');
      syncedTypes.push('userStats');
    }

    if (data.achievements) {
      await syncAchievements(supabase, telegramUserId, data.achievements);
      await updateSyncMetadata(supabase, telegramUserId, 'achievements');
      syncedTypes.push('achievements');
    }

    if (data.points) {
      await syncPoints(supabase, telegramUserId, data.points);
      await updateSyncMetadata(supabase, telegramUserId, 'points');
      syncedTypes.push('points');
    }

    if (data.preferences) {
      await syncPreferences(supabase, telegramUserId, data.preferences);
      await updateSyncMetadata(supabase, telegramUserId, 'preferences');
      syncedTypes.push('preferences');
    }

    if (data.flowProgress) {
      await syncFlowProgress(supabase, telegramUserId, data.flowProgress);
      await updateSyncMetadata(supabase, telegramUserId, 'flowProgress');
      syncedTypes.push('flowProgress');
    }

    if (data.psychologicalTest) {
      await syncPsychologicalTest(supabase, telegramUserId, data.psychologicalTest);
      await updateSyncMetadata(supabase, telegramUserId, 'psychologicalTest');
      syncedTypes.push('psychologicalTest');
    }

    if (data.cardProgress) {
      await syncCardProgress(supabase, telegramUserId, data.cardProgress);
      await updateSyncMetadata(supabase, telegramUserId, 'cardProgress');
      syncedTypes.push('cardProgress');
    }

    if (data.referralData) {
      await syncReferralData(supabase, telegramUserId, data.referralData);
      await updateSyncMetadata(supabase, telegramUserId, 'referralData');
      syncedTypes.push('referralData');
    }

    // Note: language and hasShownFirstAchievement are stored in preferences/flowProgress
    // They don't need separate sync

    return new Response(
      JSON.stringify({
        success: true,
        syncedTypes,
        metadata: {
          lastSyncAt: now,
          syncVersion: 1,
        },
      } as SyncUserDataResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[sync-user-data] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      } as SyncUserDataResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
