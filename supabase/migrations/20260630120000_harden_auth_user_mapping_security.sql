-- Harden auth_user_mapping and users_needing_migration for public API exposure
-- Migration: 20260630120000_harden_auth_user_mapping_security
-- Purpose: Fix Supabase linter findings:
--   - rls_disabled_in_public on auth_user_mapping
--   - security_definer_view on users_needing_migration
--
-- auth_user_mapping is accessed only by Edge Functions using service_role.
-- users_needing_migration is an admin diagnostic view (not used by client or Edge Functions).

-- ============================================================================
-- auth_user_mapping: enable RLS, deny client roles, keep service_role access
-- ============================================================================

ALTER TABLE public.auth_user_mapping ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.auth_user_mapping FROM anon, authenticated;
GRANT ALL ON TABLE public.auth_user_mapping TO service_role;

COMMENT ON TABLE public.auth_user_mapping IS
  'Maps Supabase Auth users (auth.users.id) to Telegram user IDs (users.telegram_user_id). RLS enabled with no client policies — service_role only via Edge Functions.';

-- ============================================================================
-- users_needing_migration: security invoker + revoke client API access
-- ============================================================================

CREATE OR REPLACE VIEW public.users_needing_migration
WITH (security_invoker = true)
AS
SELECT
  u.telegram_user_id,
  u.created_at,
  u.updated_at,
  (aum.auth_user_id IS NOT NULL) AS has_auth_user
FROM users u
LEFT JOIN auth_user_mapping aum ON u.telegram_user_id = aum.telegram_user_id
WHERE aum.auth_user_id IS NULL
ORDER BY u.created_at;

REVOKE ALL ON TABLE public.users_needing_migration FROM anon, authenticated;
GRANT SELECT ON TABLE public.users_needing_migration TO service_role;

COMMENT ON VIEW public.users_needing_migration IS
  'Admin diagnostic: users without auth_user_mapping entry. Not exposed to client API (service_role / SQL editor only).';
