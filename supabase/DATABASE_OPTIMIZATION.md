# Database Query Optimization Guide

## Current Query Performance Issues

Average response times:
- `app_flow_progress`: ~390-520ms
- `psychological_test_results`: ~391-536ms
- `survey_results`: ~345-434ms
- `users`: ~417-469ms

## Optimization Strategy

### 1. Index Analysis

All tables already have optimal indexes:
- `telegram_user_id` is PRIMARY KEY on all main tables
- PostgreSQL automatically creates B-tree indexes for PRIMARY KEYs
- These indexes are optimal for equality lookups (`WHERE telegram_user_id = X`)

**Conclusion**: Additional indexes are NOT needed - PRIMARY KEY indexes are already optimal.

### 2. Statistics Optimization

The main optimization opportunity is **query planner statistics**:

- Run `ANALYZE` regularly to update statistics
- Increase `STATISTICS` target for frequently queried columns
- This helps PostgreSQL choose optimal query plans

**Migration**: `20251222100000_optimize_indexes_and_statistics.sql` implements this.

### 3. Why Queries Are Still Slow (400ms+)

The ~400ms response time includes:

1. **Network latency**: ~50-200ms (client → Supabase API)
2. **PostgREST processing**: ~10-50ms (REST API layer)
3. **Database query execution**: ~5-50ms (with proper indexes)
4. **Response serialization**: ~10-50ms (JSON encoding)
5. **Network latency**: ~50-200ms (Supabase API → client)

**Total**: ~125-550ms (mostly network + API overhead)

### 4. Strategies to Achieve <10ms

**Impossible for network requests** - network latency alone is 50-200ms.

**Realistic targets:**

#### Option A: Application-Level Caching (Recommended)
- Cache responses in memory (in-memory cache)
- Cache in localStorage (browser storage)
- **Result**: <1ms for cached requests, <10ms for localStorage

#### Option B: Edge Functions with Caching
- Use Edge Functions with internal caching
- Cache at CDN level
- **Result**: ~50-100ms for cached requests

#### Option C: Regional Database Replicas
- Deploy database closer to users
- **Result**: ~100-200ms (reduced network latency)

#### Option D: Hybrid Approach (Best)
- Application-level caching (0-10ms for cached)
- Edge Functions for uncached (50-150ms)
- Database optimizations (5-50ms query time)

### 5. Database-Side Optimizations Applied

✅ **Migration `20251222100000_optimize_indexes_and_statistics.sql`:**
- `ANALYZE` all tables for updated statistics
- Increase `STATISTICS` target to 1000 for key columns
- Create helper function `refresh_query_statistics()`

**Expected improvement**: 10-30% faster query planning, better query plans

**To apply migration:**
```bash
supabase migration up
# or for production:
supabase db push
```

### 6. Monitoring Query Performance

After applying migration, verify improvements:

```sql
-- Check if indexes are being used
EXPLAIN ANALYZE 
SELECT * FROM app_flow_progress 
WHERE telegram_user_id = 111;

-- Should show: Index Scan using app_flow_progress_pkey
-- Execution time should be <5ms for index scan
```

### 7. Additional Recommendations

#### A. Connection Pooling
Supabase uses PgBouncer - ensure:
- Transaction pooling mode (default)
- Adequate pool size
- Connection limits configured

#### B. Query Optimization
- ✅ Already using PRIMARY KEY lookups (optimal)
- ✅ Using specific SELECT columns (not SELECT *)
- ✅ No unnecessary JOINs
- ✅ Simple WHERE clauses

#### C. PostgREST Optimization
- Enable response caching headers (if supported)
- Use prepared statements (automatic in PostgREST)
- Minimize response payload size

#### D. Application-Level Optimizations
1. **Batch requests** when possible
2. **Parallel requests** for independent data
3. **Caching** at application level
4. **Prefetch** critical data

### 8. Expected Performance After Optimization

**Database query execution time**: 5-50ms (down from 10-100ms)
**Overall API response time**: 300-400ms (down from 400-500ms)

**Note**: Network latency (100-400ms) cannot be reduced via database optimization.

**For <10ms responses**: Must use application-level caching (localStorage or in-memory cache).

