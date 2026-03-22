/**
 * DELETE /functions/v1/delete-user-data
 *
 * Deletes the authenticated Telegram user's app data (public.users row cascades)
 * and removes the linked Supabase Auth user.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateTelegramAuthWithMultipleTokens } from '../_shared/telegram-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-init-data',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false',
};

function getTelegramUserIdFromJWT(jwtToken: string): number | null {
  try {
    const parts = jwtToken.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(
          atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
          (c) => c.charCodeAt(0),
        ),
      ),
    );
    return decoded.user_metadata?.telegram_user_id ?? null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'DELETE') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed', code: 'INVALID_METHOD' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    let telegramUserId: number;

    const authHeader = req.headers.get('Authorization');
    const jwtToken = authHeader?.replace('Bearer ', '');

    if (jwtToken) {
      const extracted = getTelegramUserIdFromJWT(jwtToken);
      if (!extracted) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid JWT token',
            code: 'AUTH_FAILED',
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      telegramUserId = extracted;
    } else {
      const initData = req.headers.get('X-Telegram-Init-Data');
      if (!initData) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Missing Authorization or X-Telegram-Init-Data',
            code: 'AUTH_FAILED',
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      const authResult = await validateTelegramAuthWithMultipleTokens(initData);
      if (!authResult.valid || !authResult.userId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: authResult.error || 'Authentication failed',
            code: 'AUTH_FAILED',
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      telegramUserId = authResult.userId;
    }

    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: mapping } = await admin
      .from('auth_user_mapping')
      .select('auth_user_id')
      .eq('telegram_user_id', telegramUserId)
      .maybeSingle();

    const authUserId = mapping?.auth_user_id as string | undefined;

    const { error: delUserErr } = await admin.from('users').delete().eq('telegram_user_id', telegramUserId);

    if (delUserErr) {
      console.error('[delete-user-data] delete users row:', delUserErr);
      return new Response(
        JSON.stringify({
          success: false,
          error: delUserErr.message,
          code: 'DELETE_FAILED',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (authUserId) {
      const { error: delAuthErr } = await admin.auth.admin.deleteUser(authUserId);
      if (delAuthErr) {
        console.error('[delete-user-data] delete auth user:', delAuthErr);
        return new Response(
          JSON.stringify({
            success: false,
            error: delAuthErr.message,
            code: 'AUTH_DELETE_FAILED',
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[delete-user-data]', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
