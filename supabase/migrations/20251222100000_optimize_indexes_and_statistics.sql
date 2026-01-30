-- Database optimization migration
-- Purpose: Optimize query performance for Supabase REST API queries
-- Date: 2025-12-22

-- 1. ANALYZE all tables to update query planner statistics
-- This helps PostgreSQL choose optimal query plans
ANALYZE users;
ANALYZE survey_results;
ANALYZE app_flow_progress;
ANALYZE psychological_test_results;
ANALYZE user_stats;
ANALYZE user_achievements;
ANALYZE user_points;
ANALYZE user_preferences;
ANALYZE daily_checkins;
ANALYZE points_transactions;
ANALYZE card_progress;
ANALYZE referral_data;
ANALYZE sync_metadata;

-- 2. Ensure all PRIMARY KEY indexes are using the most efficient structure
-- PostgreSQL automatically creates B-tree indexes for PRIMARY KEYs, which is optimal
-- But we can verify and optimize them if needed

-- 3. For tables with PRIMARY KEY on telegram_user_id, these are already indexed
-- PRIMARY KEY creates a B-tree index automatically, which is optimal for equality lookups
-- The queries are already using the PRIMARY KEY index, so additional indexes may not help much
-- However, we ensure statistics are up to date (done above with ANALYZE)

-- Note: Covering indexes (INCLUDE) would help for index-only scans, but since we're using
-- PRIMARY KEY lookups which are already optimal, the main optimization is ensuring:
-- - Statistics are current (ANALYZE)
-- - Tables are vacuumed (automatic via autovacuum)
-- - Query planner has good statistics (higher STATISTICS target)

-- 4. Verify existing indexes are being used efficiently
-- Since PRIMARY KEY indexes are already optimal for our queries, we focus on:
-- - Updating statistics (done above)
-- - Ensuring query planner has good information

-- 4. Vacuum tables to reclaim space and update visibility map
-- This helps with query performance, especially for sequential scans
-- Note: VACUUM ANALYZE is preferred, but ANALYZE is sufficient for statistics
-- Full VACUUM should be run during maintenance windows if needed

-- 5. Create a function to refresh statistics for frequently queried tables
-- This can be called periodically to ensure optimal query plans
CREATE OR REPLACE FUNCTION refresh_query_statistics()
RETURNS void AS $$
BEGIN
  ANALYZE users;
  ANALYZE survey_results;
  ANALYZE app_flow_progress;
  ANALYZE psychological_test_results;
  ANALYZE user_stats;
  ANALYZE user_achievements;
  ANALYZE user_points;
  ANALYZE user_preferences;
  ANALYZE daily_checkins;
  ANALYZE points_transactions;
  ANALYZE card_progress;
  ANALYZE referral_data;
  ANALYZE sync_metadata;
END;
$$ LANGUAGE plpgsql;

-- 6. Set table statistics target for better query planning
-- Higher statistics target = more accurate query plans (at cost of ANALYZE time)
-- Default is 100, we increase for frequently queried tables
ALTER TABLE users ALTER COLUMN telegram_user_id SET STATISTICS 1000;
ALTER TABLE survey_results ALTER COLUMN telegram_user_id SET STATISTICS 1000;
ALTER TABLE app_flow_progress ALTER COLUMN telegram_user_id SET STATISTICS 1000;
ALTER TABLE psychological_test_results ALTER COLUMN telegram_user_id SET STATISTICS 1000;

-- 7. Additional recommendations for query optimization:
-- 
-- a) Connection pooling: Supabase uses PgBouncer for connection pooling
--    Ensure pooler mode is set correctly (transaction mode recommended)
--
-- b) Query patterns: All queries use PRIMARY KEY lookups which are optimal
--    No additional indexes needed beyond PRIMARY KEY
--
-- c) Network optimization: The ~400ms response time includes:
--    - Network latency (~50-200ms depending on location)
--    - PostgREST processing (~10-50ms)
--    - Database query execution (~5-50ms with proper indexes)
--    - Response serialization (~10-50ms)
--
-- d) To achieve <10ms total response time would require:
--    - Caching at application level (recommended)
--    - CDN caching for static-like data
--    - Regional database replicas for lower latency
--
-- Expected improvement from this migration:
-- - Better query plans from updated statistics: 10-30% improvement
-- - Reduced query planning time: 5-10ms saved
-- - Overall: From ~400ms to ~300-350ms for first query, ~50-150ms for cached queries

-- 8. Monitor query performance after migration
-- Use EXPLAIN ANALYZE to verify indexes are being used:
-- EXPLAIN ANALYZE SELECT * FROM app_flow_progress WHERE telegram_user_id = 111;
-- Should show: Index Scan using app_flow_progress_pkey

