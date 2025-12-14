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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-init-data',
};

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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed',
        code: 'INVALID_REQUEST',
      } as SyncUserDataResponse),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
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

    const telegramUserId = authResult.userId;

    // Parse request body
    const requestData = await req.json();
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Ensure user exists
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        telegram_user_id: telegramUserId,
        updated_at: new Date().toISOString(),
        last_sync_at: new Date().toISOString(),
      }, {
        onConflict: 'telegram_user_id',
      });

    if (upsertError) {
      throw upsertError;
    }

    // TODO: Sync data to all tables (survey_results, daily_checkins, etc.)
    // This is a placeholder - full implementation will be completed in Phase 2
    const syncedTypes: string[] = [];

    // Update sync metadata
    const now = new Date().toISOString();
    // TODO: Update sync_metadata table for each synced data type

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
    console.error('Error in sync-user-data:', error);
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
