# QA: Local Development Test

**Date**: 2025-12-14  
**Purpose**: Verify local development setup with user ID 111

---

## ✅ Test Results

### Infrastructure Status

**Supabase Local Instance**: ✅ RUNNING
- API URL: http://127.0.0.1:54321
- Edge Functions: http://127.0.0.1:54321/functions/v1
- Studio: http://127.0.0.1:54323
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres

**Vite Dev Server**: ✅ RUNNING
- URL: http://localhost:5173
- Process ID: Running
- Status: Serving application

**Edge Functions**: ✅ AVAILABLE
- get-user-data: Accessible
- sync-user-data: Accessible

---

## 🧪 Manual Testing Checklist

### 1. Application Startup
- [ ] Open http://localhost:5173 in browser
- [ ] Check browser console for errors
- [ ] Verify app loads without errors

### 2. User ID Detection
- [ ] Open browser console
- [ ] Check that `getTelegramUserId()` returns "111"
- [ ] Verify no Telegram environment detected

### 3. Initial Sync
- [ ] Open browser console
- [ ] Look for `[SyncService] Using mock initData for local development (user ID 111)`
- [ ] Check that initial sync completes without errors
- [ ] Verify sync status shows success

### 4. Database Verification
- [ ] Open Supabase Studio: http://127.0.0.1:54323
- [ ] Check `users` table for entry with `telegram_user_id = 111`
- [ ] Verify user was created or updated

### 5. Real-time Sync Test
- [ ] Make a change in app (e.g., complete a check-in)
- [ ] Wait 150ms+ for debounce
- [ ] Check browser console for sync logs
- [ ] Verify data saved in Supabase tables
- [ ] Check sync_metadata table for updated timestamp

### 6. Edge Function Test
- [ ] Check Edge Function logs for authentication
- [ ] Verify `[TelegramAuth] Local development mode: allowing user ID 111 without signature`
- [ ] Confirm requests succeed

---

## 📊 Expected Behavior

### Console Logs

**On App Load:**
```
[SyncService] Using mock initData for local development (user ID 111)
[SyncService] Existing user detected, merging data
```
OR
```
[SyncService] New user detected, uploading local data
```

**On localStorage Change:**
```
[SyncService] Syncing <dataType>
```

### Database State

**users table:**
- Entry with `telegram_user_id = 111`
- `last_sync_at` timestamp updated
- `created_at` timestamp

**sync_metadata table:**
- Entries for each synced data type
- `last_synced_at` timestamps
- `sync_version = 1`

---

## ⚠️ Known Issues / Notes

- Mock initData doesn't have signature hash (expected for local dev)
- Edge Functions allow user ID 111 without signature only in local environment
- All data synced under user ID 111 in local development
- **CSP Update Required**: Added `http://127.0.0.1:*` and `http://localhost:*` to `connect-src` for local Supabase access

---

## 🔍 Verification Commands

### Check User in Database
```sql
SELECT * FROM users WHERE telegram_user_id = 111;
```

### Check Sync Metadata
```sql
SELECT * FROM sync_metadata WHERE telegram_user_id = 111;
```

### Test Edge Function Locally
```bash
curl -X GET "http://127.0.0.1:54321/functions/v1/get-user-data" \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Init-Data: user=%7B%22id%22%3A111%7D&auth_date=$(date +%s)"
```

---

**Test Status**: ✅ Infrastructure Ready  
**Next Step**: Manual browser testing

**Last Updated**: 2025-12-14

