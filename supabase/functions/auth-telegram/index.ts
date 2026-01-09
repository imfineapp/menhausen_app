/**
 * POST /functions/v1/auth-telegram
 * 
 * Authenticates Telegram user and returns JWT token with telegram_user_id claim
 * Creates Supabase Auth user if doesn't exist
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateTelegramAuth, getTelegramBotToken } from '../_shared/telegram-auth.ts';

/**
 * Hash password for storage (simple implementation - in production use proper hashing)
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

interface AuthTelegramResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    telegram_user_id: number;
  };
  error?: string;
  code?: string;
}

/**
 * Check if auth user exists for telegram_user_id
 */
async function getAuthUserByTelegramId(
  supabase: any,
  telegramUserId: number
): Promise<{ authUserId: string | null; exists: boolean }> {
  const { data, error } = await supabase
    .from('auth_user_mapping')
    .select('auth_user_id')
    .eq('telegram_user_id', telegramUserId)
    .single();

  if (error) {
    // If no rows found, user doesn't exist
    if (error.code === 'PGRST116') {
      return { authUserId: null, exists: false };
    }
    throw error;
  }

  return { authUserId: data?.auth_user_id || null, exists: !!data?.auth_user_id };
}

/**
 * Create Supabase Auth user for Telegram user
 */
async function createAuthUser(
  supabase: any,
  telegramUserId: number
): Promise<{ user: any; session: any }> {
  // Generate a unique email for the user (Telegram users don't have emails)
  // Format: telegram_{telegram_user_id}@telegram.local
  const email = `telegram_${telegramUserId}@telegram.local`;
  
  // Generate a secure random password (user won't use it, but we'll store it for future logins)
  const password = crypto.randomUUID();

  // Create user with telegram_user_id in user_metadata
  // Store password in app_metadata for future authentication
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email since it's a Telegram user
    user_metadata: {
      telegram_user_id: telegramUserId,
      provider: 'telegram',
    },
    app_metadata: {
      telegram_user_id: telegramUserId,
      // Store password hash for future authentication (in production, use proper encryption)
      // Note: In production, consider using a more secure approach
      password_hash: await hashPassword(password),
    },
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Failed to create auth user');
  }

  // Sign in with the password to get a session with JWT token
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    throw new Error(`Failed to create session: ${signInError.message}`);
  }

  if (!signInData.session) {
    throw new Error('Failed to create session: no session returned');
  }

  return { user: data.user, session: signInData.session };
}

/**
 * Hash password for storage (simple implementation - in production use proper hashing)
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Link auth user to telegram_user_id in auth_user_mapping table
 */
async function linkAuthUser(
  supabase: any,
  authUserId: string,
  telegramUserId: number
): Promise<void> {
  const { error } = await supabase
    .from('auth_user_mapping')
    .insert({
      auth_user_id: authUserId,
      telegram_user_id: telegramUserId,
    });

  if (error) {
    // If duplicate, that's okay (race condition)
    if (error.code === '23505') {
      console.log('Auth user mapping already exists, continuing...');
      return;
    }
    throw error;
  }
}

/**
 * Ensure user exists in users table
 */
async function ensureUserExists(
  supabase: any,
  telegramUserId: number
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .upsert({
      telegram_user_id: telegramUserId,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'telegram_user_id',
    });

  if (error) {
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight - MUST be absolute first, before any other code
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('Origin') || '*';
    console.log('[auth-telegram] OPTIONS preflight handled, origin:', origin);
    return new Response('', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-init-data',
        'Access-Control-Max-Age': '86400',
        'Content-Length': '0',
      },
    });
  }

  const method = req.method;
  const origin = req.headers.get('Origin') || '*';
  
  console.log('[auth-telegram] Request received:', {
    method,
    url: req.url,
    origin,
    hasInitData: !!req.headers.get('X-Telegram-Init-Data'),
    hasAuth: !!req.headers.get('Authorization'),
  });

  if (method !== 'POST') {
    return corsResponse(
      JSON.stringify({
        success: false,
        error: 'Method not allowed. Use POST',
        code: 'INVALID_METHOD',
      } as AuthTelegramResponse),
      405,
      { 'Content-Type': 'application/json' }
    );
  }

  try {
    // Get Telegram initData from header
    const initData = req.headers.get('X-Telegram-Init-Data');
    if (!initData) {
      return corsResponse(
        JSON.stringify({
          success: false,
          error: 'Missing X-Telegram-Init-Data header',
          code: 'AUTH_FAILED',
        } as AuthTelegramResponse),
        401,
        { 'Content-Type': 'application/json' }
      );
    }

    // Validate Telegram authentication
    const botToken = getTelegramBotToken();
    const authResult = await validateTelegramAuth(initData, botToken);
    
    if (!authResult.valid || !authResult.userId) {
      return corsResponse(
        JSON.stringify({
          success: false,
          error: authResult.error || 'Authentication failed',
          code: 'AUTH_FAILED',
        } as AuthTelegramResponse),
        401,
        { 'Content-Type': 'application/json' }
      );
    }

    const telegramUserId = authResult.userId;

    // Initialize Supabase client with Service Role Key (for admin operations)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Ensure user exists in users table
    await ensureUserExists(supabase, telegramUserId);

    // Check if auth user already exists
    const { authUserId: existingAuthUserId, exists } = await getAuthUserByTelegramId(
      supabase,
      telegramUserId
    );

    let authUser;
    let session;

    if (exists && existingAuthUserId) {
      // User exists, get their user data
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
        existingAuthUserId
      );

      if (userError) {
        throw userError;
      }

      authUser = userData.user;

      // Get stored password from app_metadata (if available)
      // If not available, generate a new password and update user
      const storedPasswordHash = authUser.app_metadata?.password_hash;
      const email = authUser.email || `telegram_${telegramUserId}@telegram.local`;

      let password: string;
      
      if (storedPasswordHash) {
        // We have stored hash, but we can't reverse it
        // Generate new password and update user
        password = crypto.randomUUID();
        
        // Update user with new password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingAuthUserId,
          {
            password,
            app_metadata: {
              ...authUser.app_metadata,
              password_hash: await hashPassword(password),
            },
          }
        );

        if (updateError) {
          throw updateError;
        }
      } else {
        // No stored password, generate new one
        password = crypto.randomUUID();
        
        // Update user with new password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingAuthUserId,
          {
            password,
            app_metadata: {
              ...authUser.app_metadata,
              password_hash: await hashPassword(password),
            },
          }
        );

        if (updateError) {
          throw updateError;
        }
      }

      // Sign in with the password to get a session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error(`Failed to create session for existing user: ${signInError.message}`);
      }

      if (!signInData.session) {
        throw new Error('Failed to create session: no session returned');
      }

      session = signInData.session;
    } else {
      // Create new auth user
      const result = await createAuthUser(supabase, telegramUserId);
      authUser = result.user;
      session = result.session;

      // Link auth user to telegram_user_id
      await linkAuthUser(supabase, authUser.id, telegramUserId);
    }

    if (!session || !session.access_token) {
      throw new Error('Failed to create session with access token');
    }

    return corsResponse(
      JSON.stringify({
        success: true,
        token: session.access_token,
        user: {
          id: authUser.id,
          telegram_user_id: telegramUserId,
        },
      } as AuthTelegramResponse),
      200,
      { 'Content-Type': 'application/json' }
    );
  } catch (error) {
    console.error('Error in auth-telegram:', error);
    return corsResponse(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      } as AuthTelegramResponse),
      500,
      { 'Content-Type': 'application/json' }
    );
  }
});
