# UTM Attribution Implementation Plan

## Goal

Track user acquisition source in PostHog by extracting UTM parameters from Telegram Mini App start parameter.

## Context

When users open the Mini App via link like `https://t.me/menhausen_app_bot/app?start=eyJzIjoiZmFjZWJvb2siLCJ0IjoxNzc2MjcwOTkwLCJ2IjoxfQ`:

1. Extract `start` parameter from URL (`tgWebAppStartParam`)
2. Decode base64url → JSON: `{s, m, c, r, t, v}`
3. Map to UTM fields: `s`→utm_source, `m`→utm_medium, `c`→utm_campaign, `r`→utm_referrer
4. Initialize PostHog with user ID as distinct_id
5. On `identify()`: pass utm_* as person properties
6. On every `track()`: include utm_* in properties

## Edge Case: Referral codes

Existing referral system uses `?startapp=REF_123456`. Need to differentiate:

- `start.startsWith('REF_')` → referral code (existing logic)
- base64-decodable JSON with `t, v` → UTM attribution (new logic)

---

## Implementation Steps

### Step 1: Create `utils/attribution.ts`

```typescript
interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_referrer?: string;
  attribution_timestamp: number;
  attribution_version: number;
}

// Decode base64url to JSON
function decodeBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  return atob(base64)
}

// Parse attribution from start param
export function getAttributionFromStartParam(): AttributionData | null {
  // 1. Get start_param from Telegram or URL
  // 2. Check if it's NOT a referral code (doesn't start with REF_)
  // 3. Try to decode as base64 → JSON
  // 4. Validate presence of 't' and 'v' fields
  // 5. Map s→utm_source, m→utm_medium, c→utm_campaign, r→utm_referrer
  // 6. Console.log debug info
}
```

### Step 2: Update `utils/referralUtils.ts`

Modify `getReferralCodeFromStartParam()`:
- If param starts with `REF_` → return referral code (existing)
- If param is valid UTM JSON → return `null` (UTM handled separately)
- If neither → return `null`

Add `processAttribution()` wrapper that calls `getAttributionFromStartParam()` and returns data.

### Step 3: Update `utils/analytics/posthog.ts`

```typescript
// Module-level variable to store attribution
let storedAttribution: AttributionData | null = null

export function setAttributionData(data: AttributionData): void {
  storedAttribution = data
}

export function capture(eventName: string, properties?: Record<string, any>): void {
  // ... existing logic
  const utmProps = storedAttribution ? {
    utm_source: storedAttribution.utm_source,
    utm_medium: storedAttribution.utm_medium,
    utm_campaign: storedAttribution.utm_campaign,
    utm_referrer: storedAttribution.utm_referrer,
  } : {}
  
  posthog.capture(eventName, {
    ...defaultEventProps,
    ...uidProps,
    ...experimentProps,
    ...utmProps,  // ← Add UTM to all events
    ...(properties || {}),
  })
}

export function identify(distinctId: string, properties?: Record<string, any>): void {
  // ... existing logic
  const utmProps = storedAttribution ? {
    utm_source: storedAttribution.utm_source,
    utm_medium: storedAttribution.utm_medium,
    utm_campaign: storedAttribution.utm_campaign,
    utm_referrer: storedAttribution.utm_referrer,
  } : {}
  
  posthog.identify(distinctId, {
    ...defaultProps,
    ...utmProps,  // ← Add UTM to person properties
    ...(properties || {}),
  })
}
```

### Step 4: Integrate in `AppContent.tsx`

```typescript
// At app initialization (before processReferralCode):
const startParam = getStartParamFromUrl()
const attribution = getAttributionFromStartParam()

// Debug console output
console.log('[Attribution] Full start param:', startParam)
console.log('[Attribution] Decoded attribution:', attribution)
console.log('[Attribution] Referral code:', referralCode)

if (attribution) {
  setAttributionData(attribution)
}

// Existing referral processing
processReferralCode()

// Identify with UTM (utm_* added automatically)
if (userId) {
  identify(userId)
}
```

---

## Files to Modify

| File | Action |
|------|--------|
| `utils/attribution.ts` | **Create** |
| `utils/referralUtils.ts` | Update type detection logic |
| `utils/analytics/posthog.ts` | Add UTM to capture/identify |
| `AppContent.tsx` | Initialize attribution at startup |

---

## PostHog Data Flow

1. **Person properties** (on identify):
   - `utm_source`
   - `utm_medium`
   - `utm_campaign`
   - `utm_referrer`

2. **Event properties** (on every capture):
   - `utm_source`
   - `utm_medium`
   - `utm_campaign`
   - `utm_referrer`

---

## Console Debug Output

```
[Attribution] Start param: eyJzIjoiZmFjZWJvb2siLCJ0IjoxNzc2MjcwOTkwLCJ2IjoxfQ
[Attribution] Decoded: { s: "facebook", m: "cpc", c: "summer", r: "facebook.com", t: 1776270990, v: 1 }
[Attribution] Attribution data: { utm_source: "facebook", utm_medium: "cpc", utm_campaign: "summer", utm_referrer: "facebook.com", ... }
[Attribution] Referral code: null (detected as UTM, not REF_*)
```

---

## Testing Checklist

- [ ] Open app with `?start=eyJzIjoiZmFjZWJvb2si...` — attribution extracted
- [ ] Open app with `?startapp=REF_123456` — referral works (existing)
- [ ] Open app without start param — no errors
- [ ] PostHog identify includes utm_* as person properties
- [ ] PostHog capture includes utm_* in event properties