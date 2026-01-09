-- Enable Row Level Security (RLS) on all tables
-- Migration: 20260109000001_enable_rls
-- Purpose: Enable RLS and create policies for all user data tables

-- Helper function to extract telegram_user_id from JWT claims
-- This function reads the telegram_user_id from the JWT token's user_metadata
CREATE OR REPLACE FUNCTION get_telegram_user_id_from_jwt()
RETURNS BIGINT AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'telegram_user_id')::BIGINT;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Grant execute permission to authenticated role
GRANT EXECUTE ON FUNCTION get_telegram_user_id_from_jwt() TO authenticated;

-- Add comment to function
COMMENT ON FUNCTION get_telegram_user_id_from_jwt() IS 'Extracts telegram_user_id from JWT token user_metadata claim for RLS policies';

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_flow_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychological_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_user_mapping ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR users TABLE
-- ============================================================================

CREATE POLICY "Users can view own user record"
ON users FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can insert own user record"
ON users FOR INSERT
TO authenticated
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can update own user record"
ON users FOR UPDATE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt())
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

-- ============================================================================
-- RLS POLICIES FOR survey_results TABLE
-- ============================================================================

CREATE POLICY "Users can view own survey results"
ON survey_results FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can insert own survey results"
ON survey_results FOR INSERT
TO authenticated
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can update own survey results"
ON survey_results FOR UPDATE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt())
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

-- ============================================================================
-- RLS POLICIES FOR daily_checkins TABLE
-- ============================================================================

CREATE POLICY "Users can view own checkins"
ON daily_checkins FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can insert own checkins"
ON daily_checkins FOR INSERT
TO authenticated
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can update own checkins"
ON daily_checkins FOR UPDATE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt())
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can delete own checkins"
ON daily_checkins FOR DELETE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

-- ============================================================================
-- RLS POLICIES FOR user_stats TABLE
-- ============================================================================

CREATE POLICY "Users can view own stats"
ON user_stats FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can insert own stats"
ON user_stats FOR INSERT
TO authenticated
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can update own stats"
ON user_stats FOR UPDATE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt())
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

-- ============================================================================
-- RLS POLICIES FOR user_achievements TABLE
-- ============================================================================

CREATE POLICY "Users can view own achievements"
ON user_achievements FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can insert own achievements"
ON user_achievements FOR INSERT
TO authenticated
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can update own achievements"
ON user_achievements FOR UPDATE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt())
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

-- ============================================================================
-- RLS POLICIES FOR user_points TABLE
-- ============================================================================

CREATE POLICY "Users can view own points"
ON user_points FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can insert own points"
ON user_points FOR INSERT
TO authenticated
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can update own points"
ON user_points FOR UPDATE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt())
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

-- ============================================================================
-- RLS POLICIES FOR points_transactions TABLE
-- ============================================================================

CREATE POLICY "Users can view own transactions"
ON points_transactions FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can insert own transactions"
ON points_transactions FOR INSERT
TO authenticated
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can update own transactions"
ON points_transactions FOR UPDATE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt())
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can delete own transactions"
ON points_transactions FOR DELETE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

-- ============================================================================
-- RLS POLICIES FOR user_preferences TABLE
-- ============================================================================

CREATE POLICY "Users can view own preferences"
ON user_preferences FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can insert own preferences"
ON user_preferences FOR INSERT
TO authenticated
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can update own preferences"
ON user_preferences FOR UPDATE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt())
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

-- ============================================================================
-- RLS POLICIES FOR app_flow_progress TABLE
-- ============================================================================

CREATE POLICY "Users can view own flow progress"
ON app_flow_progress FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can insert own flow progress"
ON app_flow_progress FOR INSERT
TO authenticated
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can update own flow progress"
ON app_flow_progress FOR UPDATE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt())
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

-- ============================================================================
-- RLS POLICIES FOR psychological_test_results TABLE
-- ============================================================================

CREATE POLICY "Users can view own test results"
ON psychological_test_results FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can insert own test results"
ON psychological_test_results FOR INSERT
TO authenticated
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can update own test results"
ON psychological_test_results FOR UPDATE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt())
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

-- ============================================================================
-- RLS POLICIES FOR card_progress TABLE
-- ============================================================================

CREATE POLICY "Users can view own card progress"
ON card_progress FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can insert own card progress"
ON card_progress FOR INSERT
TO authenticated
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can update own card progress"
ON card_progress FOR UPDATE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt())
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can delete own card progress"
ON card_progress FOR DELETE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

-- ============================================================================
-- RLS POLICIES FOR referral_data TABLE
-- ============================================================================

CREATE POLICY "Users can view own referral data"
ON referral_data FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can insert own referral data"
ON referral_data FOR INSERT
TO authenticated
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can update own referral data"
ON referral_data FOR UPDATE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt())
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

-- ============================================================================
-- RLS POLICIES FOR sync_metadata TABLE
-- ============================================================================

CREATE POLICY "Users can view own sync metadata"
ON sync_metadata FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can insert own sync metadata"
ON sync_metadata FOR INSERT
TO authenticated
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can update own sync metadata"
ON sync_metadata FOR UPDATE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt())
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can delete own sync metadata"
ON sync_metadata FOR DELETE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

-- ============================================================================
-- RLS POLICIES FOR auth_user_mapping TABLE
-- ============================================================================

-- Users can view their own mapping
CREATE POLICY "Users can view own auth mapping"
ON auth_user_mapping FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

-- Note: INSERT and UPDATE for auth_user_mapping should be done by service role
-- in the auth-telegram Edge Function, so we don't create policies for those
