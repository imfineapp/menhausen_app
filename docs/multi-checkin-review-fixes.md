# Multi-Check-In Review Fixes

## Source

Staff Engineer Review of the multi-check-in implementation (plan: `docs/multi-checkin-4h-plan.md`).

## Critical Issues

### 1. Supabase migration file missing

The plan specified creating `supabase/migrations/20260504120000_multi_checkin_sessions.sql` to drop the `UNIQUE(telegram_user_id, date_key)` constraint. Without this, the Supabase `daily_checkins` table still enforces one row per day, meaning sync will fail or silently drop multi-session data.

**Fix**: Create the migration.

### 2. Conflict resolver not updated

`mergeDailyCheckins()` in `utils/supabaseSync/conflictResolver.ts` uses "latest wins per date_key". With multiple sessions per day, this silently discards all but the latest session during merge.

**Fix**: Update merge to union by `id`/`session_id`, or keep latest-per-date if only one entry per day is synced from server.

## High Priority

### 3. Russian translation not updated

`data/translations/ru.json` still has the old subtitle. English was updated in `src/i18n/messages/checkin.ts`.

**Fix**: Update Russian subtitle.

### 4. `ActivityBlockNew.tsx` uses sessions count for streak display

Line 54: `streakDays: totalCheckins > 0 ? totalCheckins : 0` — `totalCheckins` now counts sessions (multiple per day), but the UI label shows "день/days". Should use `$checkinStreak`.

**Fix**: Use `$checkinStreak` for streak display.

### 5. Missing unit tests

- Backward-compat migration of old keys
- Multi-session same day
- Cooldown rejection
- Streak counts days not sessions
- Mental level average with multiple sessions

### 6. Missing E2E test updates

- 4h cooldown behavior
- Multiple check-ins same day
- Visibility change prompting

## Medium Priority

### 7. `getCurrentDayStatus()` ambiguity

`getCurrentDayStatus()` returns `COMPLETED` if any session exists today. `shouldPromptCheckin()` is the actual prompt logic. The two methods have different semantics but are easy to confuse.

**Fix**: Add `@deprecated` JSDoc.

### 8. `getCheckinStreak()` performance

O(365 x n) due to per-day localStorage full scans.

**Fix**: Compute from single `getAllCheckins()` pass.

## Implementation Order

| Step | Description | Status |
|------|-------------|--------|
| 1 | Create migration file | |
| 2 | Update conflict resolver | |
| 3 | Update Russian translation | |
| 4 | Fix ActivityBlockNew streak display | |
| 5 | Add unit tests | |
| 6 | Update E2E tests | |
| 7 | Deprecate getCurrentDayStatus() | |
| 8 | Optimize getCheckinStreak() | |
| 9 | QA: lint, type-check, tests | |
