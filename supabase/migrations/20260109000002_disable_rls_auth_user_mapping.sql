-- Disable RLS on auth_user_mapping table
-- Migration: 20260109000002_disable_rls_auth_user_mapping
-- Purpose: auth_user_mapping is managed exclusively by service role (Edge Functions)
--          and should not have RLS enabled

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can view own auth mapping" ON auth_user_mapping;

-- Disable RLS on auth_user_mapping
ALTER TABLE auth_user_mapping DISABLE ROW LEVEL SECURITY;

-- Add comment explaining why RLS is disabled
COMMENT ON TABLE auth_user_mapping IS 'Maps Supabase Auth users (auth.users.id) to Telegram user IDs (users.telegram_user_id). RLS disabled - managed exclusively by service role in Edge Functions.';
