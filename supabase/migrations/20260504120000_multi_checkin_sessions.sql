-- Allow multiple check-in sessions per day
-- Migration: 20260504120000_multi_checkin_sessions

-- Remove the unique constraint that prevents multiple check-ins per day
ALTER TABLE daily_checkins
  DROP CONSTRAINT IF EXISTS daily_checkins_telegram_user_id_date_key_key;

-- Add session_id column for distinguishing check-ins within same day
ALTER TABLE daily_checkins
  ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);

-- Create index for looking up all check-ins for a user on a given day
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date
  ON daily_checkins(telegram_user_id, date_key, created_at);

-- Populate session_id for existing rows (use existing id as fallback)
UPDATE daily_checkins
  SET session_id = id::text
  WHERE session_id IS NULL;
