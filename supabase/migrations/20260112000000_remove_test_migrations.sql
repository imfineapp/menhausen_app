-- Remove Test Migrations
-- Migration: 20260112000000_remove_test_migrations
-- Purpose: Remove test helper functions and views created for RLS testing
-- Note: These were created for testing purposes and are no longer needed

-- Drop test functions from 20260109000004_test_rls_policies.sql
DROP FUNCTION IF EXISTS test_rls_policy(BIGINT, TEXT, TEXT);

-- Drop test views from 20260109000004_test_rls_policies.sql
DROP VIEW IF EXISTS rls_status_check CASCADE;
DROP VIEW IF EXISTS rls_policies_summary CASCADE;

-- Drop test functions from 20260109000005_fix_rls_testing.sql
DROP FUNCTION IF EXISTS check_rls_status(TEXT);
DROP FUNCTION IF EXISTS test_rls_enforcement(TEXT, BIGINT);

-- Drop test view from 20260109000005_fix_rls_testing.sql
DROP VIEW IF EXISTS rls_verification CASCADE;

-- Note: If you need monitoring views for RLS in the future, create them in a separate migration
-- with proper naming and documentation
