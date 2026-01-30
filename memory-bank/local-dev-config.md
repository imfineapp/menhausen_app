# Local Development Configuration

**Date**: 2025-12-14  
**Feature**: Local Development User ID Support

---

## Overview

For local development (non-Telegram environment), the app automatically uses **Telegram User ID 111** as the default user. All data is saved to Supabase API under this user ID.

---

## Implementation Details

### Client-Side (React App)

**File**: `utils/telegramUserUtils.ts`

- `getTelegramUserId()` now returns `"111"` when not in Telegram environment
- Falls back to `"111"` on errors for local development

**File**: `utils/supabaseSync/supabaseSyncService.ts`

- `getInitData()` method creates mock initData for local development
- Mock initData format: `user={"id":111,"first_name":"Local","username":"local_dev"}&auth_date=<timestamp>`
- No signature hash required for local development

### Server-Side (Edge Functions)

**File**: `supabase/functions/_shared/telegram-auth.ts`

- `isLocalDevelopment()` checks if Supabase URL contains `127.0.0.1` or `localhost`
- `validateTelegramAuth()` allows mock initData (without hash) for user ID 111 in local development
- Normal Telegram auth validation still required in production

---

## How It Works

### Local Development Flow

1. **App starts** → `getTelegramUserId()` returns `"111"` (not in Telegram)
2. **Sync operation triggered** → `getInitData()` creates mock initData
3. **Request sent to Edge Function** → Mock initData in `X-Telegram-Init-Data` header
4. **Edge Function validates** → Detects local development + user ID 111 → Allows without signature
5. **Data saved** → All data saved to Supabase under `telegram_user_id = 111`

### Production Flow (Telegram)

1. **App starts in Telegram** → `getTelegramUserId()` returns real Telegram user ID
2. **Sync operation triggered** → Uses real Telegram initData
3. **Request sent to Edge Function** → Real initData with signature
4. **Edge Function validates** → Normal Telegram auth validation
5. **Data saved** → Data saved to Supabase under real Telegram user ID

---

## Configuration

### Environment Variables

For local development, ensure `.env` or `.env.local` contains:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<your-local-anon-key>
```

### Supabase Local Instance

Make sure Supabase is running locally:

```bash
supabase start
```

---

## Testing

### Verify Local User ID

1. Open browser console
2. Check logs: Should see `[SyncService] Using mock initData for local development (user ID 111)`
3. Check Supabase Studio: http://127.0.0.1:54323
4. Check `users` table: Should have entry with `telegram_user_id = 111`

### Verify Data Sync

1. Make changes in app (check-in, survey, etc.)
2. Check Supabase tables: Data should be saved under user ID 111
3. Check sync status: Should show successful sync

---

## Security Notes

- **Production**: Full Telegram auth validation required
- **Local Development**: Only user ID 111 allowed without signature
- **Mock initData**: Only works for user ID 111 in local environment
- **Edge Functions**: Automatically detects local vs production environment

---

## Troubleshooting

### Sync not working in local dev

1. Check Supabase is running: `supabase status`
2. Check environment variables are set
3. Check browser console for errors
4. Verify Edge Functions logs for auth errors

### User ID not 111

1. Clear localStorage: `localStorage.clear()`
2. Restart app
3. Check `getTelegramUserId()` returns "111"

---

**Last Updated**: 2025-12-14

