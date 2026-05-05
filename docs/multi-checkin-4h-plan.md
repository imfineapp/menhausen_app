# Multi-Check-In System (4h frequency + Dotted Line Chart)

## Overview of Changes

This plan modifies the daily check-in system to support multiple check-ins per day (minimum 4 hours apart), changes the mood chart to show dotted lines across empty days, computes the daily score as an average, and adjusts check-in prompting logic.

---

## Part 1: Storage Model — Multiple Check-Ins Per Day

**Current state**: One check-in per day stored at key `daily_checkin_YYYY-MM-DD` as a single `CheckinData` object.

**New state**: Multiple check-ins per day, each stored at key `daily_checkin_YYYY-MM-DD_<timestamp_ms>`, including a backward-compatible migration for existing single-entry keys.

**Files to change**: `utils/DailyCheckinManager.ts`

### 1.1 Storage key changes

- Keep `STORAGE_KEY_PREFIX` as `daily_checkin_` (prefix unchanged, suffix changes)
- Add new static method `getCheckinsForDay(dateKey: string): CheckinData[]` — scans all keys matching `daily_checkin_YYYY-MM-DD_*` and returns sorted array
- Add `getLastCheckin(): CheckinData | null` — finds the most recent check-in across all days by timestamp
- Add `getAverageMoodForDay(dateKey: string): number | null` — computes average of `value` fields for a day, returns `null` if no check-ins
- Add `shouldPromptCheckin(): boolean` — returns `true` if last check-in timestamp is more than 4 hours ago, or if no check-ins exist at all
- `getCurrentDayStatus()` → rename to `shouldShowCheckinScreen()` and use `shouldPromptCheckin()` logic
- `saveCheckin()`: change key to `daily_checkin_YYYY-MM-DD_<Date.now()>` instead of just `daily_checkin_YYYY-MM-DD`
- `getCheckin(dateKey)`: keep for backward compat; returns the most recent check-in for that day
- `getAllCheckins()`: already iterates prefix — needs updating to handle new key format (strip timestamp suffix for date extraction)
- `getTotalCheckins()`: already counts all completed check-ins under prefix — **keep as-is**, this now automatically counts all sessions
- `getCheckinStreak()`: still counts consecutive **days** (not sessions) with at least one check-in
- `getWeeklyCheckinsStatus()`: still checks per day — if any check-in exists for that day, mark true

### 1.2 Backward-compatible migration

In `saveCheckin()` or `getAllCheckins()`, when encountering old-format key `daily_checkin_YYYY-MM-DD` (no underscore-timestamp suffix):
- Read the old data
- Re-save it as `daily_checkin_YYYY-MM-DD_<existing_timestamp>` using the check-in's existing `timestamp` field
- Delete the old key
- This migration is lazy (on read/write), not a bulk migration

**Constant changes**:

```typescript
static readonly CHECKIN_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours
// RESET_HOUR and CHECKIN_REWARD unchanged
```

---

## Part 2: Re-Entry Prompting (Force Check-In Screen)

**Current state**: On app start, `determineInitialScreen()` checks `getCurrentDayStatus()`. If today's check-in is NOT_COMPLETED → show check-in screen. If COMPLETED → home.

**New state**: Check if last check-in was >4h ago. If yes → show check-in screen. Also handle visibility change (user returns to app after background).

**Files to change**: `AppContent.tsx`

### 2.1 Initial screen determination

```typescript
// Replace:
const checkinStatus = DailyCheckinManager.getCurrentDayStatus()
if (checkinStatus === DailyCheckinStatus.NOT_COMPLETED) return 'checkin'
if (checkinStatus === DailyCheckinStatus.COMPLETED) return 'home'
return 'checkin'

// With:
if (DailyCheckinManager.shouldPromptCheckin()) return 'checkin'
return 'home'
```

### 2.2 Visibility change listener

Add a `visibilitychange` event listener in AppContent:

```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Re-check if we should prompt for check-in
      // Only re-navigate if we're NOT already on check-in screen
      const currentScreen = $currentScreen.get()
      if (currentScreen !== 'checkin' && currentScreen !== 'onboarding1' && ... ) {
        if (DailyCheckinManager.shouldPromptCheckin()) {
          openPage($router, 'checkin')
        }
      }
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
}, [])
```

**Guard conditions**: Only prompt if not already on check-in, onboarding, survey, or payment screens. Don't interrupt in-progress flows.

---

## Part 3: Points Per Check-In

**Current state**: 10 points, once per day (idempotent via `correlationId = "checkin_YYYY-MM-DD"`).

**New state**: 10 points per individual check-in session. Each session gets its own correlationId.

**Files to change**: `utils/DailyCheckinManager.ts` (already in `saveCheckin()`)

### 3.1 Correlation ID change

```typescript
// Change from:
const correlationId = `checkin_${currentDayKey}`;

// To:
const correlationId = `checkin_${currentDayKey}_${Date.now()}`;
```

This makes each check-in unique for points idempotency while still allowing multiple per day.

**No other changes needed** — `saveCheckin()` already awards 10 points per call, and `PointsManager` already ensures idempotency via correlationId.

---

## Part 4: Daily Score as Average

**Current state**: `buildMentalLevelChartData()` uses `checkin.value + 1` as the value for a day (single value per day).

**New state**: When there are multiple check-ins in a day, the chart value is the rounded average mood.

**Files to change**: `src/domain/mentalLevel.domain.ts`

### 4.1 Average calculation

```typescript
export function buildMentalLevelChartData(params: {
  checkins: CheckinData[]
  today?: Date
  daysCount?: number
}): MentalLevelChartPoint[] {
  const { checkins, daysCount = 14 } = params
  // ...

  // Group check-ins by date, compute average
  const checkinsByDay = new Map<string, number[]>()
  for (const checkin of checkins) {
    // extract YYYY-MM-DD from checkin.date or from the key
    const datePart = checkin.date.substring(0, 10) // "YYYY-MM-DD"
    const values = checkinsByDay.get(datePart) || []
    values.push(checkin.value + 1)
    checkinsByDay.set(datePart, values)
  }

  // Compute average per day
  const checkinsAvg = new Map<string, number>()
  for (const [dateKey, values] of checkinsByDay) {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length
    checkinsAvg.set(dateKey, Math.round(avg)) // rounded to nearest integer for chart
  }

  // Build chart points using averages
  for (let i = daysCount - 1; i >= 0; i--) {
    // ...
    const value = checkinsAvg.get(dateKey) || null // null instead of 0
    days.push({ date: formatDDMM(date), value })
  }
}
```

Key change: return `null` (not `0`) for days with no check-ins. This supports the dotted-line rendering.

Type change:

```typescript
export type MentalLevelChartPoint = {
  date: string
  value: number | null  // null = no check-in that day
}
```

---

## Part 5: Dotted Line Chart (MentalLevelBlock)

**Current state**: Area chart with continuous fill from value 0 to 5. All 14 days shown, empty days at value 0. Solid line + filled area.

**New state**:
- Solid line + filled area only on consecutive check-in days
- Dotted line connecting across empty days
- No area fill on empty days (value is `null`, not 0)
- Scatter dots on each check-in day's value

**Files to change**: `components/MentalLevelBlock.tsx`

### 5.1 Chart implementation

```tsx
<AreaChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
  <defs>
    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#e1ff00" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#e1ff00" stopOpacity={0}/>
    </linearGradient>
  </defs>

  {/* X and Y axes unchanged, but Y domain adjusts: [0,5] instead of [1,5] */}
  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} ... />

  {/* Solid area — fills only where check-in data exists */}
  <Area
    type="monotone"
    dataKey="value"
    stroke="#e1ff00"
    strokeWidth={2}
    fillOpacity={1}
    fill="url(#colorValue)"
    connectNulls={false}
  />

  {/* Dotted context line — connects through gaps */}
  <Line
    type="monotone"
    dataKey="value"
    stroke="#e1ff00"
    strokeWidth={1.5}
    strokeDasharray="4 4"
    opacity={0.4}
    connectNulls={true}
    dot={false}
  />
</AreaChart>
```

How this works visually:
- `connectNulls={false}` on `Area` means: **no fill on empty days** — the yellow gradient area only appears where mood data exists, and there are gaps between non-consecutive check-in segments
- `connectNulls={true}` on the dotted `Line` means: **the line connects through null values** — it draws a diagonal dotted line from the last check-in point directly to the next one, never going to zero
- Result: check-in days show solid line + filled yellow area; empty days show a faint dotted line bridging the gap at the last known mood level

**Additional**: Keep the conditional render for empty chart data (already exists at lines 59-66 of `MentalLevelBlock.tsx`).

---

## Part 6: Supabase Sync Changes

**Current state**: `daily_checkins` table has `UNIQUE(telegram_user_id, date_key)`. One row per day.

**New state**: Multiple rows per day allowed. Timestamp distinguishes them.

**Files to change**:
- New migration file
- `utils/supabaseSync/conflictResolver.ts`
- `utils/supabaseSync/dataTransformers.ts`

### 6.1 New migration

Create `supabase/migrations/20260504120000_multi_checkin_sessions.sql`:

```sql
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
```

### 6.2 Conflict resolver changes

`mergeDailyCheckins()` currently merges by `date_key`. Since multiple check-ins per day now share the same `date_key`, the merge should:
- Identify check-ins by `id` or a new `session_id` field
- Merge as a union (local + remote, dedup by id/session_id)
- Not replace all entries for a date_key

Updated merge logic: merge as a flat array/collection rather than by date_key.

### 6.3 Data transformer changes

`transformDailyCheckins()` and `transformDailyCheckinsFromAPI()` need to handle multiple check-ins per date_key. The API format should now key by id instead of date_key, or use an array.

---

## Part 7: UI Updates to Reflect 4h Model

**Files to change**:
- `components/CheckInScreen.tsx` — minor text/copy updates
- `components/ActivityBlockNew.tsx` — weekly dots still per-day
- `components/ActivityHeatmapBlock.tsx` — still per-day

### 7.1 CheckInScreen copy changes

Update the i18n key or add new text indicating that check-in can be done every 4 hours (instead of "daily check-in"). Add to:
- `src/i18n/messages/checkin.ts` (English)
- `data/translations/ru.json` (Russian)

Maybe rename "Daily check-in" to "Mood check-in" or similar.

### 7.2 Activity display

- `ActivityBlockNew.tsx` — weekly dots and heatmap still operate per-day (any check-in that day = activity). No change needed.
- `ActivityHeatmapBlock.tsx` — still per-day. No change needed.
- Streak calculation (`getCheckinStreak()`) — still consecutive days. No change needed.

### 7.3 HomeScreen check-in counter

`$totalCheckins` now counts individual sessions, not days. Update the copy text in the i18n to say "check-ins" instead of "days" or make it neutral.

---

## Part 8: UserStats Changes

**Current state**: `incrementCheckin()` increments `checkins` count by 1 per call, and tracks `lastCheckinDate` per day.

**New state**: Still increment by 1 per call, but called every 4 hours, potentially multiple times per day. `lastCheckinDate` should become `lastCheckinTimestamp` (Unix ms) for accurate 4h check.

**Files to change**: `services/userStatsService.ts`, `types/achievements.ts`

```typescript
// In UserStats type:
// lastCheckinDate: string → lastCheckinTimestamp: number (Unix ms)

// In incrementCheckin():
// Use lastCheckinTimestamp instead of date comparison
// Update lastCheckinTimestamp to Date.now()
```

Also migrate `STORAGE_VERSION` from 1 to 2 with a migration function.

---

## Part 9: Test Updates

**Files to create/modify**:

### 9.1 `tests/unit/DailyCheckinManager.test.ts`
Add tests for:
- Multiple check-ins per day storage
- `shouldPromptCheckin()` returning true/false based on 4h cooldown
- `getAverageMoodForDay()` calculation
- `getCheckinsForDay()` returns correct count
- Backward-compatible migration of old single-entry keys
- Points awarded per check-in (not per day)

### 9.2 `tests/unit/domain/mentalLevel.domain.test.ts`
New tests for:
- Average calculation from multiple check-ins
- `null` return for empty days
- Correct chart point generation

### 9.3 `tests/unit/checkin.store.test.ts`
Update for new `shouldPromptCheckin` method

### 9.4 `tests/e2e/daily-checkin-flow.spec.ts`
Update scenarios:
- Test 4h cooldown (mock timers to simulate 4h passing)
- Test multiple check-ins per day
- Test visibility change → force check-in
- Test chart rendering with dotted lines

### 9.5 `tests/unit/actions/checkin.actions.test.ts`
Update for new flow

---

## Part 10: Implementation Order

| Step | Description | Files |
|------|-------------|-------|
| 1 | Add migration, drop UNIQUE constraint | `supabase/migrations/*.sql` |
| 2 | Refactor `DailyCheckinManager` — multi-check-in storage, 4h cooldown, backward compat | `utils/DailyCheckinManager.ts` |
| 3 | Update `mentalLevel.domain.ts` — average calculation, null returns | `src/domain/mentalLevel.domain.ts` |
| 4 | Update `MentalLevelBlock.tsx` — dotted line chart | `components/MentalLevelBlock.tsx` |
| 5 | Update `AppContent.tsx` — 4h prompt + visibility listener | `AppContent.tsx` |
| 6 | Update `userStatsService.ts` — timestamp-based tracking | `services/userStatsService.ts` |
| 7 | Update types | `types/checkin.ts`, `types/achievements.ts` |
| 8 | Update sync layer | `conflictResolver.ts`, `dataTransformers.ts` |
| 9 | Update i18n copy | `src/i18n/messages/checkin.ts`, `data/translations/ru.json` |
| 10 | Write/update unit tests | `tests/unit/*` |
| 11 | Update E2E tests | `tests/e2e/*` |
| 12 | Run QA pipeline | `lint:all`, `type-check`, `test:all` |

---

## Key Constants Summary

| Constant | Old | New |
|----------|-----|-----|
| Storage key | `daily_checkin_YYYY-MM-DD` | `daily_checkin_YYYY-MM-DD_<timestamp>` |
| Check-in frequency | Once per day (6 AM reset) | Every 4 hours (cooldown-based) |
| Reset hour | 6 AM | **Removed** (no longer relevant) |
| Points | 10/day | 10/check-in session |
| Correlation ID | `checkin_YYYY-MM-DD` | `checkin_YYYY-MM-DD_<timestamp>` |
| Daily score | Single value per day | Average of all check-ins that day |
| Chart empty-day value | 0 | `null` (gap in display) |
| Chart line style | Solid throughout | Solid on check-in days, dotted across empty days |
| lastCheckinDate | YYYY-MM-DD string | Unix ms timestamp |
| Prompt logic | Once per calendar day | >4h since last check-in |
