/**
 * POST /functions/v1/migrate-existing-users
 * 
 * Migrates existing users from users table to Supabase Auth
 * Creates auth.users entries and populates auth_user_mapping
 * 
 * This is a one-time migration function that should be run after
 * deploying the auth integration
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
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
 * Hash password for storage
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create Supabase Auth user for Telegram user
 */
async function createAuthUser(
  supabase: any,
  telegramUserId: number
): Promise<{ user: any; session: any }> {
  const email = `telegram_${telegramUserId}@telegram.local`;
  const password = crypto.randomUUID();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      telegram_user_id: telegramUserId,
      provider: 'telegram',
    },
    app_metadata: {
      telegram_user_id: telegramUserId,
      password_hash: await hashPassword(password),
    },
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Failed to create auth user');
  }

  // Sign in to get session
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
 * Link auth user to telegram_user_id
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
    if (error.code === '23505') {
      console.log('Auth user mapping already exists, continuing...');
      return;
    }
    throw error;
  }
}

serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('', {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== 'POST') {
      return corsResponse(
        JSON.stringify({
          success: false,
          error: 'Method not allowed. Use POST',
          code: 'INVALID_METHOD',
        }),
        405,
        { 'Content-Type': 'application/json' }
      );
    }

    // Initialize Supabase client with Service Role Key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('telegram_user_id');

    if (allUsersError) {
      throw allUsersError;
    }

    // Get all existing mappings
    const { data: existingMappings, error: mappingsError } = await supabase
      .from('auth_user_mapping')
      .select('telegram_user_id');

    if (mappingsError) {
      throw mappingsError;
    }

    const existingTelegramIds = new Set(
      (existingMappings || []).map((m: any) => m.telegram_user_id)
    );

    // Filter users that need migration (users without auth_user_mapping entry)
    const usersNeedingMigration = (allUsers || []).filter(
      (u: any) => !existingTelegramIds.has(u.telegram_user_id)
    );

    console.log(`[migrate-existing-users] Found ${usersNeedingMigration.length} users to migrate`);

    const results = {
      total: usersNeedingMigration.length,
      migrated: 0,
      skipped: 0,
      errors: [] as Array<{ telegram_user_id: number; error: string }>,
    };

    // Migrate users in batches
    for (const user of usersNeedingMigration) {
      try {
        const telegramUserId = user.telegram_user_id;
        
        // Check if user already exists by email
        const email = `telegram_${telegramUserId}@telegram.local`;
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existingUser = listData?.users.find((u: any) => u.email === email);

        let authUserId: string;

        if (existingUser) {
          // User exists, use it
          authUserId = existingUser.id;
          console.log(`[migrate-existing-users] User ${telegramUserId} already exists in auth.users, using existing user`);
        } else {
          // Create new user
          const result = await createAuthUser(supabase, telegramUserId);
          authUserId = result.user.id;
          console.log(`[migrate-existing-users] Created new auth user for telegram_user_id: ${telegramUserId}`);
        }

        // Create mapping
        await linkAuthUser(supabase, authUserId, telegramUserId);
        results.migrated++;
      } catch (error) {
        console.error(`[migrate-existing-users] Error migrating user ${user.telegram_user_id}:`, error);
        results.errors.push({
          telegram_user_id: user.telegram_user_id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        results.skipped++;
      }
    }

    return corsResponse(
      JSON.stringify({
        success: true,
        results,
      }),
      200,
      { 'Content-Type': 'application/json' }
    );
  } catch (error) {
    console.error('[migrate-existing-users] Error:', error);
    return corsResponse(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      }),
      500,
      { 'Content-Type': 'application/json' }
    );
  }
});
