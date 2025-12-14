-- Initial database schema for Telegram User API Sync
-- Migration: 20251214141751_initial_sync_schema

-- Users table (linked to Telegram user ID)
CREATE TABLE IF NOT EXISTS users (
  telegram_user_id BIGINT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Survey results table
CREATE TABLE IF NOT EXISTS survey_results (
  telegram_user_id BIGINT PRIMARY KEY REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  screen01 JSONB,
  screen02 JSONB,
  screen03 JSONB,
  screen04 JSONB,
  screen05 JSONB,
  completed_at TIMESTAMPTZ,
  encrypted_data TEXT,
  version INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily check-ins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  date_key VARCHAR(10) NOT NULL, -- YYYY-MM-DD format
  mood VARCHAR(50),
  value INTEGER,
  color VARCHAR(50),
  encrypted_data TEXT,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(telegram_user_id, date_key)
);

-- User statistics table
CREATE TABLE IF NOT EXISTS user_stats (
  telegram_user_id BIGINT PRIMARY KEY REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  checkins INTEGER DEFAULT 0,
  checkin_streak INTEGER DEFAULT 0,
  last_checkin_date DATE,
  cards_opened JSONB DEFAULT '{}'::jsonb,
  topics_completed JSONB DEFAULT '[]'::jsonb,
  cards_repeated JSONB DEFAULT '{}'::jsonb,
  topics_repeated JSONB DEFAULT '[]'::jsonb,
  articles_read INTEGER DEFAULT 0,
  read_article_ids JSONB DEFAULT '[]'::jsonb,
  opened_card_ids JSONB DEFAULT '[]'::jsonb,
  referrals_invited INTEGER DEFAULT 0,
  referrals_premium INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  telegram_user_id BIGINT PRIMARY KEY REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  achievements JSONB DEFAULT '{}'::jsonb,
  total_xp INTEGER DEFAULT 0,
  unlocked_count INTEGER DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points table
CREATE TABLE IF NOT EXISTS user_points (
  telegram_user_id BIGINT PRIMARY KEY REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  transaction_id VARCHAR(255) NOT NULL, -- From localStorage tx.id
  type VARCHAR(20) NOT NULL, -- 'earn' or 'spend'
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  note TEXT,
  correlation_id VARCHAR(255),
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(telegram_user_id, transaction_id)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  telegram_user_id BIGINT PRIMARY KEY REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  language VARCHAR(10) DEFAULT 'en',
  theme VARCHAR(20) DEFAULT 'light',
  notifications BOOLEAN DEFAULT true,
  analytics BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- App flow progress table
CREATE TABLE IF NOT EXISTS app_flow_progress (
  telegram_user_id BIGINT PRIMARY KEY REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  onboarding_completed BOOLEAN DEFAULT false,
  survey_completed BOOLEAN DEFAULT false,
  psychological_test_completed BOOLEAN DEFAULT false,
  pin_enabled BOOLEAN DEFAULT false,
  pin_completed BOOLEAN DEFAULT false,
  first_checkin_done BOOLEAN DEFAULT false,
  first_reward_shown BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Psychological test results table
CREATE TABLE IF NOT EXISTS psychological_test_results (
  telegram_user_id BIGINT PRIMARY KEY REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  last_completed_at TIMESTAMPTZ,
  scores JSONB,
  percentages JSONB,
  history JSONB DEFAULT '[]'::jsonb,
  encrypted_data TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card progress table (without answers)
CREATE TABLE IF NOT EXISTS card_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  card_id VARCHAR(100) NOT NULL,
  completed_attempts JSONB DEFAULT '[]'::jsonb, -- Without question1/question2
  is_completed BOOLEAN DEFAULT false,
  total_completed_attempts INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(telegram_user_id, card_id)
);

-- Referral data table
CREATE TABLE IF NOT EXISTS referral_data (
  telegram_user_id BIGINT PRIMARY KEY REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  referred_by VARCHAR(255),
  referral_code VARCHAR(255),
  referral_registered BOOLEAN DEFAULT false,
  referral_list JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync metadata table (for tracking sync state)
CREATE TABLE IF NOT EXISTS sync_metadata (
  telegram_user_id BIGINT NOT NULL REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_version INTEGER DEFAULT 1,
  UNIQUE(telegram_user_id, data_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON daily_checkins(telegram_user_id, date_key);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user ON points_transactions(telegram_user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_card_progress_user ON card_progress(telegram_user_id, card_id);
CREATE INDEX IF NOT EXISTS idx_sync_metadata_user ON sync_metadata(telegram_user_id, data_type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_results_updated_at BEFORE UPDATE ON survey_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_checkins_updated_at BEFORE UPDATE ON daily_checkins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON user_achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at BEFORE UPDATE ON user_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_flow_progress_updated_at BEFORE UPDATE ON app_flow_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_psychological_test_results_updated_at BEFORE UPDATE ON psychological_test_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_progress_updated_at BEFORE UPDATE ON card_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_data_updated_at BEFORE UPDATE ON referral_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

