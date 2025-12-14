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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-init-data',
};

interface GetUserDataResponse {
  success: boolean;
  data?: any;
  error?: string;
  code?: string;
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

    // Fetch all user data
    // Note: This is a simplified version - full implementation will fetch from all tables
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_user_id', telegramUserId)
      .single();

    if (userError && userError.code !== 'PGRST116') { // PGRST116 = not found
      throw userError;
    }

    // If user doesn't exist, return empty data
    if (!userData) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {},
        } as GetUserDataResponse),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // TODO: Fetch data from all tables (survey_results, daily_checkins, etc.)
    // This is a placeholder - full implementation will be completed in Phase 2

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          userId: telegramUserId,
          // TODO: Include all data types
        },
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
