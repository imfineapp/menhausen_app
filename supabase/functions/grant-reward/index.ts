/**
 * POST /functions/v1/grant-reward
 *
 * Centralized reward entrypoint.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateTelegramAuthWithMultipleTokens } from '../_shared/telegram-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-init-data',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false',
};

interface GrantRewardRequest {
  eventType: string;
  referenceId: string;
  payload?: Record<string, unknown>;
}

interface GrantRewardResponse {
  success: boolean;
  granted?: boolean;
  reason?: string;
  points?: number;
  balance?: number;
  transactionId?: string;
  error?: string;
  code?: string;
}

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
    return decoded.user_metadata?.telegram_user_id || null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('', { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Method not allowed. Use POST',
          code: 'INVALID_METHOD',
        } as GrantRewardResponse),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
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

    const authHeader = req.headers.get('Authorization');
    const jwtToken = authHeader?.replace('Bearer ', '');
    if (jwtToken) {
      const extractedUserId = getTelegramUserIdFromJWT(jwtToken);
      if (!extractedUserId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid JWT token',
            code: 'AUTH_FAILED',
          } as GrantRewardResponse),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      telegramUserId = extractedUserId;
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${jwtToken}` } },
      });
    } else {
      const initData = req.headers.get('X-Telegram-Init-Data');
      if (!initData) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'No authentication provided',
            code: 'AUTH_FAILED',
          } as GrantRewardResponse),
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
          } as GrantRewardResponse),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      telegramUserId = authResult.userId;
      if (!supabaseServiceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
      }
      supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    const body = (await req.json()) as GrantRewardRequest;
    if (!body?.eventType || !body?.referenceId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'eventType and referenceId are required',
          code: 'INVALID_REQUEST',
        } as GrantRewardResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { data, error } = await supabase.rpc('grant_reward', {
      p_telegram_user_id: telegramUserId,
      p_event_type: body.eventType,
      p_reference_id: body.referenceId,
      p_payload: body.payload || {},
    });

    if (error) {
      console.error('[grant-reward] RPC error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || 'grant_reward RPC failed',
          code: 'RPC_ERROR',
        } as GrantRewardResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const result = typeof data === 'string' ? JSON.parse(data) : data;
    return new Response(
      JSON.stringify({
        success: true,
        granted: !!result?.granted,
        reason: result?.reason,
        points: result?.points,
        balance: result?.balance,
        transactionId: result?.transaction_id,
      } as GrantRewardResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('[grant-reward] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      } as GrantRewardResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
