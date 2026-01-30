-- Link Supabase Auth users with Telegram user IDs
-- Migration: 20260109000000_link_auth_users
-- Purpose: Create mapping table to link auth.users.id (UUID) with telegram_user_id (BIGINT)

-- Create auth_user_mapping table
CREATE TABLE IF NOT EXISTS auth_user_mapping (
  auth_user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_user_id BIGINT UNIQUE NOT NULL REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups by telegram_user_id
CREATE INDEX IF NOT EXISTS idx_auth_user_mapping_telegram_id ON auth_user_mapping(telegram_user_id);

-- Create index for fast lookups by auth_user_id (though it's already PRIMARY KEY)
-- This is redundant but explicit for clarity
CREATE INDEX IF NOT EXISTS idx_auth_user_mapping_auth_id ON auth_user_mapping(auth_user_id);

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_auth_user_mapping_updated_at BEFORE UPDATE ON auth_user_mapping
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE auth_user_mapping IS 'Maps Supabase Auth users (auth.users.id) to Telegram user IDs (users.telegram_user_id)';
