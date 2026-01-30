# Supabase Auth Integration - Testing Guide

## Overview

This document describes how to test the Supabase Auth integration, including JWT token management, RLS policies, and Edge Functions.

## Prerequisites

- Docker running (for local Supabase)
- Supabase CLI installed
- Production Supabase project linked
- Test Telegram WebApp initData

## Testing Checklist

### 1. RLS Policies Testing

#### Check RLS Status on All Tables

```sql
-- Check RLS status directly from pg_tables
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename AND pg_policies.schemaname = 'public') as policy_count
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN ('auth_user_mapping', 'spatial_ref_sys')
ORDER BY tablename;

-- View all RLS policies
SELECT 
  tablename,
  policyname,
  cmd as operation,
  qual as using_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;
```

#### Manual RLS Test

1. **Get a test user's JWT token:**
   - Use the `auth-telegram` Edge Function to authenticate
   - Save the JWT token

2. **Test SELECT policy:**
```sql
-- Set JWT for current session (requires proper auth context)
SET request.jwt.claim.sub = 'user_uuid_here';
SET request.jwt.claim.user_metadata = '{"telegram_user_id": 12345}';

-- Try to SELECT data - should only return user's own data
SELECT * FROM daily_checkins;
-- Should only return checkins for telegram_user_id = 12345
```

3. **Test INSERT policy:**
```sql
-- Try to INSERT with correct telegram_user_id - should succeed
INSERT INTO daily_checkins (telegram_user_id, checkin_date, mood_score)
VALUES (12345, CURRENT_DATE, 5);

-- Try to INSERT with wrong telegram_user_id - should fail
INSERT INTO daily_checkins (telegram_user_id, checkin_date, mood_score)
VALUES (99999, CURRENT_DATE, 5);
-- Should fail with RLS policy violation
```

#### Using Supabase CLI for RLS Testing

```bash
# Connect to production database
supabase db remote execute "
  SELECT tablename, policyname, cmd 
  FROM pg_policies 
  WHERE schemaname = 'public'
  ORDER BY tablename, cmd;
"
```

### 2. JWT Token Generation Testing

#### Test auth-telegram Edge Function

```bash
# Test locally
curl -X POST http://localhost:54321/functions/v1/auth-telegram \
  -H "Content-Type: application/json" \
  -H "apikey: your_anon_key" \
  -H "X-Telegram-Init-Data: your_telegram_init_data" \
  | jq .

# Test in production
curl -X POST https://your-project.supabase.co/functions/v1/auth-telegram \
  -H "Content-Type: application/json" \
  -H "apikey: your_anon_key" \
  -H "X-Telegram-Init-Data: your_telegram_init_data" \
  | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "telegram_user_id": 12345
  }
}
```

#### Test Token Validation

1. **Check token expiry:**
   - Token should be valid for 1 hour (3600 seconds)
   - After expiry, should trigger refresh

2. **Check token claims:**
   - Decode JWT token (use jwt.io or similar)
   - Verify `user_metadata.telegram_user_id` is present
   - Verify `role` is `authenticated`

### 3. Edge Functions Testing

#### Test get-user-data with JWT

```bash
# Get JWT token first (from auth-telegram)
JWT_TOKEN="your_jwt_token_here"

curl -X GET https://your-project.supabase.co/functions/v1/get-user-data \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "apikey: your_anon_key" \
  | jq .
```

#### Test sync-user-data with JWT

```bash
JWT_TOKEN="your_jwt_token_here"

curl -X POST https://your-project.supabase.co/functions/v1/sync-user-data \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -H "apikey: your_anon_key" \
  -d '{
    "dailyCheckins": [{
      "checkin_date": "2026-01-09",
      "mood_score": 5
    }]
  }' \
  | jq .
```

#### Test Backward Compatibility (initData fallback)

```bash
# Test without JWT token (should fallback to initData)
curl -X GET https://your-project.supabase.co/functions/v1/get-user-data \
  -H "X-Telegram-Init-Data: your_telegram_init_data" \
  -H "apikey: your_anon_key" \
  | jq .
```

### 4. User Migration Testing

#### Check Users Needing Migration

```sql
-- View users that need migration
SELECT * FROM users_needing_migration;

-- Count users needing migration
SELECT COUNT(*) as users_to_migrate 
FROM users_needing_migration;
```

#### Test Migration Function

```bash
# Call migrate-existing-users Edge Function
curl -X POST https://your-project.supabase.co/functions/v1/migrate-existing-users \
  -H "Content-Type: application/json" \
  -H "apikey: your_service_role_key" \
  | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "results": {
    "migrated": 10,
    "skipped": 0,
    "errors": []
  }
}
```

#### Verify Migration Success

```sql
-- Check auth_user_mapping table
SELECT 
  aum.telegram_user_id,
  aum.auth_user_id,
  u.email,
  u.created_at
FROM auth_user_mapping aum
JOIN auth.users u ON u.id = aum.auth_user_id
LIMIT 10;

-- Verify all users have mappings
SELECT 
  COUNT(DISTINCT u.telegram_user_id) as total_users,
  COUNT(DISTINCT aum.telegram_user_id) as migrated_users,
  COUNT(DISTINCT u.telegram_user_id) - COUNT(DISTINCT aum.telegram_user_id) as remaining
FROM users u
LEFT JOIN auth_user_mapping aum ON aum.telegram_user_id = u.telegram_user_id;
```

### 5. Frontend Integration Testing

#### Test Token Storage

1. Open browser DevTools
2. Authenticate via `authService.authenticateWithTelegram()`
3. Check localStorage:
   - `supabase_jwt_token` should be present
   - `supabase_jwt_token_expiry` should be set

#### Test Token Refresh

1. Set token expiry to past time
2. Call `getValidJWTToken()`
3. Should automatically refresh token

#### Test API Calls with JWT

1. Check Network tab in DevTools
2. Verify `Authorization: Bearer <token>` header is present
3. Verify requests succeed with JWT token

### 6. Security Testing

#### Test Unauthorized Access

```bash
# Try to access data without JWT or initData - should fail
curl -X GET https://your-project.supabase.co/functions/v1/get-user-data \
  -H "apikey: your_anon_key" \
  | jq .
# Should return 401 Unauthorized
```

#### Test Token Tampering

1. Modify JWT token (change telegram_user_id in payload)
2. Try to access data
3. Should fail with RLS policy violation

#### Test Cross-User Access

1. Authenticate as User A
2. Try to access User B's data using User B's telegram_user_id
3. Should fail with RLS policy violation

### 7. Performance Testing

#### Test Token Generation Speed

- Measure time to generate JWT token
- Should be < 100ms

#### Test RLS Policy Overhead

- Compare query performance with/without RLS
- Should have minimal overhead (< 10%)

### 8. E2E Testing

Run the existing E2E test suite:

```bash
npm run test:e2e
```

**Note:** E2E tests currently mock Supabase sync. To test real Supabase integration:

1. Set `__MOCK_SUPABASE_SYNC__ = false` in test setup
2. Provide real Telegram initData
3. Use test Supabase project

## Common Issues and Solutions

### Issue: RLS Policy Violation

**Symptom:** `new row violates row-level security policy`

**Solution:**
- Verify JWT token has `telegram_user_id` in `user_metadata`
- Check that RLS policies are correctly configured
- Ensure Edge Function uses Service Role Key for admin operations

### Issue: Token Expired

**Symptom:** `401 Unauthorized` after some time

**Solution:**
- Check token expiry time
- Implement automatic token refresh
- Verify `getValidJWTToken()` is called before each request

### Issue: Migration Fails

**Symptom:** `migrate-existing-users` returns errors

**Solution:**
- Check that `auth.users` table is accessible
- Verify Service Role Key has proper permissions
- Check for duplicate emails in `auth.users`

## Monitoring

### Key Metrics to Monitor

1. **Authentication Success Rate**
   - Track `auth-telegram` success/failure ratio
   - Monitor error codes

2. **Token Refresh Rate**
   - Track how often tokens are refreshed
   - Identify token expiry issues

3. **RLS Policy Violations**
   - Monitor database logs for RLS violations
   - Track unauthorized access attempts

4. **Migration Progress**
   - Track users migrated vs total users
   - Monitor migration errors

### Supabase Dashboard

- Check Edge Function logs for errors
- Monitor database query performance
- Review authentication events

## Next Steps

After successful testing:

1. ✅ Deploy all migrations to production
2. ✅ Deploy all Edge Functions to production
3. ✅ Run user migration script
4. ✅ Monitor for 24-48 hours
5. ✅ Enable RLS policies if not already enabled
6. ⏳ Remove backward compatibility (initData fallback) after verification
7. ⏳ Update documentation with new auth flow
