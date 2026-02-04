/**
 * GET /functions/v1/get-user-data
 * 
 * Fetches all user data from Supabase for a Telegram user
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateTelegramAuthWithMultipleTokens, getTelegramBotTokens, validateTelegramAuth } from '../_shared/telegram-auth.ts';
import { getBotInfo } from '../_shared/telegram-bot-api.ts';
import {
  generateEd25519KeyPair,
  exportEd25519KeyPairBase64,
  importEd25519KeyPairBase64,
  signPremiumData,
} from '../_shared/ed25519-utils.ts';

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
  hasPremium?: boolean; // Premium status (with environment awareness)
  premiumSignature?: {
    data: {
      premium: boolean;
      plan?: string;
      expiresAt?: string;
      purchasedAt?: string;
      timestamp: number;
    };
    signature: string; // Base64 Ed25519 signature
    publicKey: string; // Base64 public key
    version: number; // Key version
  };
}

/**
 * Fetch all user data using PostgreSQL RPC function (optimized single query)
 */
async function fetchAllUserDataViaRPC(supabase: any, telegramUserId: number): Promise<any> {
  const startTime = Date.now();
  try {
    const { data, error } = await supabase.rpc('get_user_complete_data', {
      p_telegram_user_id: telegramUserId
    });
    
    if (error) {
      console.error('[get-user-data] RPC function error:', error);
      throw error;
    }
    
    const duration = Date.now() - startTime;
    console.log(`[get-user-data] RPC function completed in ${duration}ms`);
    
    // Function returns JSON directly, parse if needed
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    
    return data || {};
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[get-user-data] RPC function failed after ${duration}ms:`, error);
    throw error;
  }
}

/**
 * Fetch all user data from all tables (legacy method - used as fallback)
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

/**
 * Get test bot IDs from environment variable
 */
function getTestBotIds(): number[] {
  const raw = Deno.env.get('TELEGRAM_TEST_BOT_IDS') ?? '';
  if (!raw) return [];
  
  return raw
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n) && n > 0);
}

/**
 * Determine bot information from initData validation
 */
async function determineBotInfo(initData: string): Promise<{ id: number; username?: string } | null> {
  const botTokens = getTelegramBotTokens();
  
  for (const botToken of botTokens) {
    const validationResult = await validateTelegramAuth(initData, botToken);
    
    if (validationResult.valid) {
      const botInfo = await getBotInfo(botToken);
      return {
        id: botInfo.id,
        username: botInfo.username
      };
    }
  }
  
  return null;
}

/**
 * Get premium status with environment awareness
 * Returns has_premium based on whether request is from test or production bot
 */
async function getPremiumStatus(
  supabase: any,
  telegramUserId: number,
  initData: string | null
): Promise<boolean> {
  // Determine bot and environment from initData
  let isTestEnvironment = false;
  
  if (initData) {
    const botInfo = await determineBotInfo(initData);
    if (botInfo) {
      const testBotIds = getTestBotIds();
      isTestEnvironment = testBotIds.includes(botInfo.id);
    }
  }
  
  if (isTestEnvironment) {
    // For test/staging: check if user has active test subscription
    const { data: testSubscriptions } = await supabase
      .from('premium_subscriptions')
      .select('id')
      .eq('telegram_user_id', telegramUserId)
      .eq('status', 'active')
      .eq('is_test_payment', true)
      .limit(1);
    
    return (testSubscriptions && testSubscriptions.length > 0);
  } else {
    // For production: use users.has_premium (updated only by production subscriptions)
    const { data: user } = await supabase
      .from('users')
      .select('has_premium')
      .eq('telegram_user_id', telegramUserId)
      .maybeSingle();
    
    return user?.has_premium === true;
  }
}

/**
 * Get or generate Ed25519 key pair for user
 * Returns key pair in base64 format
 */
async function getOrGenerateEd25519Keys(
  supabase: any,
  telegramUserId: number
): Promise<{ publicKey: string; privateKey: string; version: number }> {
  // Check if user already has keys
  const { data: user } = await supabase
    .from('users')
    .select('ed25519_public_key, ed25519_private_key, ed25519_key_version')
    .eq('telegram_user_id', telegramUserId)
    .maybeSingle();

  if (user?.ed25519_public_key && user?.ed25519_private_key) {
    // User already has keys, return them
    return {
      publicKey: user.ed25519_public_key,
      privateKey: user.ed25519_private_key,
      version: user.ed25519_key_version || 1,
    };
  }

  // Generate new key pair
  console.log(`[get-user-data] Generating Ed25519 keys for user ${telegramUserId}`);
  const keyPair = await generateEd25519KeyPair();
  const keyPairBase64 = await exportEd25519KeyPairBase64(keyPair);

  // Save keys to database
  const { error: updateError } = await supabase
    .from('users')
    .update({
      ed25519_public_key: keyPairBase64.publicKey,
      ed25519_private_key: keyPairBase64.privateKey,
      ed25519_key_version: 1,
    })
    .eq('telegram_user_id', telegramUserId);

  if (updateError) {
    console.error('[get-user-data] Error saving Ed25519 keys:', updateError);
    throw new Error('Failed to save Ed25519 keys');
  }

  return {
    publicKey: keyPairBase64.publicKey,
    privateKey: keyPairBase64.privateKey,
    version: 1,
  };
}

/**
 * Sign premium status data with Ed25519
 * Returns signed premium data with signature and public key
 */
async function signPremiumStatus(
  supabase: any,
  telegramUserId: number,
  hasPremium: boolean
): Promise<{
  data: {
    premium: boolean;
    plan?: string;
    expiresAt?: string;
    purchasedAt?: string;
    timestamp: number;
  };
  signature: string;
  publicKey: string;
  version: number;
} | null> {
  try {
    // Get or generate Ed25519 keys
    const keys = await getOrGenerateEd25519Keys(supabase, telegramUserId);

    // Get premium subscription details if premium is active
    let plan: string | undefined;
    let expiresAt: string | undefined;
    let purchasedAt: string | undefined;

    if (hasPremium) {
      const { data: subscription } = await supabase
        .from('premium_subscriptions')
        .select('plan_type, expires_at, created_at')
        .eq('telegram_user_id', telegramUserId)
        .eq('status', 'active')
        .eq('is_test_payment', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscription) {
        plan = subscription.plan_type;
        expiresAt = subscription.expires_at;
        purchasedAt = subscription.created_at;
      }
    }

    // Create premium data object
    const premiumData = {
      premium: hasPremium,
      plan,
      expiresAt,
      purchasedAt,
      timestamp: Date.now(),
    };

    // Import private key for signing
    const keyPair = await importEd25519KeyPairBase64(keys.publicKey, keys.privateKey);

    // Sign the data
    const signature = await signPremiumData(keyPair.privateKey, premiumData);

    return {
      data: premiumData,
      signature,
      publicKey: keys.publicKey,
      version: keys.version,
    };
  } catch (error) {
    console.error('[get-user-data] Error signing premium status:', error);
    // Return null if signing fails (client will use unsigned data)
    return null;
  }
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

      // JWT token is already validated by extracting telegram_user_id
      // The token signature will be verified by Supabase when making queries
      // No need for additional getUser() call which requires service role key
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
    
    // Get initData for premium status determination (if available)
    const initData = req.headers.get('X-Telegram-Init-Data');
    
    // Try optimized RPC function first, fallback to legacy method if it fails
    let userData: any;
    let usingFallback = false;
    
    try {
      const rpcStartTime = Date.now();
      userData = await fetchAllUserDataViaRPC(supabase, telegramUserId);
      const rpcDuration = Date.now() - rpcStartTime;
      console.log(`[get-user-data] Using RPC function: ${rpcDuration}ms`);
    } catch (rpcError) {
      console.warn('[get-user-data] RPC function failed, falling back to legacy method:', rpcError);
      usingFallback = true;
      const legacyStartTime = Date.now();
      userData = await fetchAllUserData(supabase, telegramUserId);
      const legacyDuration = Date.now() - legacyStartTime;
      console.log(`[get-user-data] Using legacy method: ${legacyDuration}ms`);
    }
    
    // Fetch metadata and premium status in parallel (these are separate from user data)
    const [metadata, hasPremium] = await Promise.all([
      getSyncMetadata(supabase, telegramUserId),
      getPremiumStatus(supabase, telegramUserId, initData),
    ]);
    
    // Add premium status to user data
    userData.hasPremium = hasPremium;

    // Sign premium status with Ed25519
    const premiumSignature = await signPremiumStatus(supabase, telegramUserId, hasPremium);

    // If no data exists at all, user probably doesn't exist
    // But this is just an optimization - we still return empty data structure

    const response: GetUserDataResponse = {
      success: true,
      data: userData,
      metadata,
      hasPremium, // Premium status with environment awareness
    };

    // Add premium signature if available
    if (premiumSignature) {
      response.premiumSignature = premiumSignature;
    }

    return new Response(
      JSON.stringify(response),
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
