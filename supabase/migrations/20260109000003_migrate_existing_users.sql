-- Migrate existing users to Supabase Auth
-- Migration: 20260109000003_migrate_existing_users
-- Purpose: Create Supabase Auth users for existing users in the users table
--          and populate auth_user_mapping table

-- This migration creates Supabase Auth users for all existing users
-- that don't already have an auth user created

-- Function to migrate a single user
-- This will be called by an Edge Function or manual script
-- We create a helper function that can be called programmatically

CREATE OR REPLACE FUNCTION migrate_user_to_auth(
  p_telegram_user_id BIGINT
)
RETURNS UUID AS $$
DECLARE
  v_auth_user_id UUID;
  v_email TEXT;
  v_password TEXT;
BEGIN
  -- Check if user already has an auth user
  SELECT auth_user_id INTO v_auth_user_id
  FROM auth_user_mapping
  WHERE telegram_user_id = p_telegram_user_id;
  
  IF v_auth_user_id IS NOT NULL THEN
    -- User already migrated
    RETURN v_auth_user_id;
  END IF;
  
  -- Generate email for the user
  v_email := 'telegram_' || p_telegram_user_id || '@telegram.local';
  
  -- Generate a secure random password
  v_password := gen_random_uuid()::TEXT;
  
  -- Note: We cannot create auth.users directly from SQL
  -- This must be done via Supabase Auth Admin API in an Edge Function
  -- This function is a placeholder for the migration logic
  
  -- Return NULL to indicate migration needed
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION migrate_user_to_auth(BIGINT) IS 'Helper function to migrate existing user to Supabase Auth. Returns auth_user_id if already migrated, NULL if migration needed. Actual user creation must be done via Edge Function.';

-- Create a view to see users that need migration
CREATE OR REPLACE VIEW users_needing_migration AS
SELECT 
  u.telegram_user_id,
  u.created_at,
  u.updated_at,
  CASE 
    WHEN aum.auth_user_id IS NOT NULL THEN true
    ELSE false
  END AS has_auth_user
FROM users u
LEFT JOIN auth_user_mapping aum ON u.telegram_user_id = aum.telegram_user_id
WHERE aum.auth_user_id IS NULL
ORDER BY u.created_at;

-- Add comment
COMMENT ON VIEW users_needing_migration IS 'Shows all users that need to be migrated to Supabase Auth (users without auth_user_mapping entry)';
