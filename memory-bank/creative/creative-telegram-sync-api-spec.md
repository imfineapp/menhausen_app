# Telegram User API Sync - API Specifications & Data Contracts

## Document Information
- **Related Plan**: `creative-telegram-sync-architecture.md`
- **Created**: 2025-01-XX
- **Status**: Planning Phase

---

## 1. API ENDPOINTS OVERVIEW

All endpoints are Supabase Edge Functions deployed at `/functions/v1/`

### Base URL
```
https://[project-ref].supabase.co/functions/v1
```

### Authentication
All endpoints require Telegram WebApp `initData` in request headers or body.

---

## 2. ENDPOINT SPECIFICATIONS

### 2.1 POST /functions/v1/sync-user-data

**Purpose**: Full sync of all user data (upload all localStorage data to Supabase)

**Request Headers**:
```
Content-Type: application/json
X-Telegram-Init-Data: [telegram_init_data_string]
```

**Request Body**:
```typescript
{
  data: {
    surveyResults?: {
      screen01: string[];
      screen02: string[];
      screen03: string[];
      screen04: string[];
      screen05: string[];
      completedAt: string;
      encryptedData?: string; // If encrypted version exists
    };
    dailyCheckins?: {
      [dateKey: string]: { // dateKey format: "YYYY-MM-DD"
        mood: string;
        value: number;
        color: string;
        encryptedData?: string;
        completed: boolean;
      };
    };
    userStats?: {
      version: number;
      checkins: number;
      checkinStreak: number;
      lastCheckinDate: string | null;
      cardsOpened: Record<string, number>;
      topicsCompleted: string[];
      cardsRepeated: Record<string, number>;
      topicsRepeated: string[];
      articlesRead: number;
      readArticleIds: string[];
      openedCardIds: string[];
      referralsInvited: number;
      referralsPremium: number;
      lastUpdated: string;
    };
    achievements?: {
      version: number;
      achievements: Record<string, {
        achievementId: string;
        unlocked: boolean;
        unlockedAt: string | null;
        progress: number;
        xp: number;
        lastChecked: string;
      }>;
      totalXP: number;
      unlockedCount: number;
    };
    points?: {
      balance: number;
      transactions: Array<{
        id: string;
        type: 'earn' | 'spend';
        amount: number;
        balanceAfter: number;
        note?: string;
        correlationId?: string;
        timestamp: string;
      }>;
    };
    preferences?: {
      language: string;
      theme: string;
      notifications: boolean;
      analytics: boolean;
    };
    flowProgress?: {
      onboardingCompleted: boolean;
      surveyCompleted: boolean;
      psychologicalTestCompleted: boolean;
      pinEnabled: boolean;
      pinCompleted: boolean;
      firstCheckinDone: boolean;
      firstRewardShown: boolean;
    };
    psychologicalTest?: {
      lastCompletedAt: string;
      scores: Record<string, number>;
      percentages: Record<string, number>;
      history: Array<{
        date: string;
        scores: Record<string, number>;
        percentages: Record<string, number>;
      }>;
      encryptedData?: string;
    };
    cardProgress?: {
      [cardId: string]: {
        cardId: string;
        completedAttempts: Array<{
          attemptId: string;
          date: string;
          // answers field excluded (question1/question2 removed)
          rating: number;
          completedAt: string;
          ratingComment?: string;
        }>;
        isCompleted: boolean;
        totalCompletedAttempts: number;
      };
    };
    referralData?: {
      referredBy: string | null;
      referralCode: string | null;
      referralRegistered: boolean;
      referralList: string[];
    };
    language?: string; // 'en' | 'ru'
    hasShownFirstAchievement?: boolean;
  }
}
```

**Response (Success - 200)**:
```typescript
{
  success: true;
  syncedTypes: string[]; // e.g., ['surveyResults', 'dailyCheckins', ...]
  conflicts?: Array<{
    type: string;
    resolved: 'remote' | 'merged' | 'local';
  }>;
  metadata: {
    lastSyncAt: string;
    syncVersion: number;
  };
}
```

**Response (Error - 400)**:
```typescript
{
  success: false;
  error: string;
  code: 'INVALID_REQUEST' | 'VALIDATION_ERROR';
}
```

**Response (Error - 401)**:
```typescript
{
  success: false;
  error: string;
  code: 'AUTH_FAILED' | 'INVALID_TELEGRAM_DATA';
}
```

**Response (Error - 500)**:
```typescript
{
  success: false;
  error: string;
  code: 'INTERNAL_ERROR' | 'DATABASE_ERROR';
}
```

---

### 2.2 GET /functions/v1/get-user-data

**Purpose**: Fetch all user data from Supabase

**Request Headers**:
```
X-Telegram-Init-Data: [telegram_init_data_string]
```

**Query Parameters**: None

**Response (Success - 200)**:
```typescript
{
  success: true;
  data: {
    surveyResults?: { /* same as sync-user-data request */ };
    dailyCheckins?: { /* same as sync-user-data request */ };
    userStats?: { /* same as sync-user-data request */ };
    achievements?: { /* same as sync-user-data request */ };
    points?: { /* same as sync-user-data request */ };
    preferences?: { /* same as sync-user-data request */ };
    flowProgress?: { /* same as sync-user-data request */ };
    psychologicalTest?: { /* same as sync-user-data request */ };
    cardProgress?: { /* same as sync-user-data request */ };
    referralData?: { /* same as sync-user-data request */ };
    language?: string;
    hasShownFirstAchievement?: boolean;
  };
  metadata: {
    lastSyncAt: string | null;
    syncVersion: number;
  };
}
```

**Response (Error - 404)**:
```typescript
{
  success: false;
  error: string;
  code: 'USER_NOT_FOUND';
}
```

---

### 2.3 PATCH /functions/v1/sync-data-type

**Purpose**: Incremental sync for a single data type

**Request Headers**:
```
Content-Type: application/json
X-Telegram-Init-Data: [telegram_init_data_string]
```

**Request Body**:
```typescript
{
  dataType: 'surveyResults' | 'dailyCheckins' | 'userStats' | 'achievements' | 
            'points' | 'preferences' | 'flowProgress' | 'psychologicalTest' | 
            'cardProgress' | 'referralData' | 'language' | 'hasShownFirstAchievement';
  data: any; // Type-specific data matching sync-user-data structure
}
```

**Response (Success - 200)**:
```typescript
{
  success: true;
  dataType: string;
  synced: boolean;
  metadata: {
    lastSyncedAt: string;
    syncVersion: number;
  };
}
```

---

## 3. DATA CONTRACTS

### 3.1 Survey Results Contract

**LocalStorage Format** (`survey-results`):
```typescript
{
  screen01: string[];
  screen02: string[];
  screen03: string[];
  screen04: string[];
  screen05: string[];
  completedAt: string;
}
```

**API Format**:
```typescript
{
  screen01: string[];
  screen02: string[];
  screen03: string[];
  screen04: string[];
  screen05: string[];
  completedAt: string; // ISO timestamp
  encryptedData?: string; // If using encrypted version
  version: number;
}
```

**Database Schema**:
```sql
CREATE TABLE survey_results (
  telegram_user_id BIGINT PRIMARY KEY,
  screen01 JSONB,
  screen02 JSONB,
  screen03 JSONB,
  screen04 JSONB,
  screen05 JSONB,
  completed_at TIMESTAMPTZ,
  encrypted_data TEXT,
  version INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3.2 Daily Check-ins Contract

**LocalStorage Format** (`daily_checkin_YYYY-MM-DD`):
```typescript
{
  id: string;
  date: string; // "YYYY-MM-DD"
  timestamp: number;
  mood: string;
  value: number;
  color: string;
  completed: boolean;
}
```

**API Format** (aggregated):
```typescript
{
  [dateKey: string]: { // dateKey = "YYYY-MM-DD"
    mood: string;
    value: number;
    color: string;
    encryptedData?: string;
    completed: boolean;
  };
}
```

**Database Schema**:
```sql
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL,
  date_key VARCHAR(10) NOT NULL, -- "YYYY-MM-DD"
  mood VARCHAR(50),
  value INTEGER,
  color VARCHAR(50),
  encrypted_data TEXT,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(telegram_user_id, date_key)
);
```

---

### 3.3 Card Progress Contract

**LocalStorage Format** (`theme_card_progress_STRESS-01`):
```typescript
{
  cardId: "STRESS-01";
  completedAttempts: [
    {
      attemptId: "STRESS-01_2025-10-08_1";
      date: "2025-10-08";
      answers: {
        question1: "user answer..."; // ❌ EXCLUDED FROM SYNC
        question2: "user answer..."; // ❌ EXCLUDED FROM SYNC
      };
      rating: 5;
      completedAt: "2025-10-08T12:54:48.153Z";
      ratingComment?: string;
    }
  ];
  isCompleted: true;
  totalCompletedAttempts: 1;
}
```

**API Format** (answers removed):
```typescript
{
  [cardId: string]: {
    cardId: string;
    completedAttempts: [
      {
        attemptId: string;
        date: string;
        // answers field completely removed
        rating: number;
        completedAt: string;
        ratingComment?: string;
      }
    ];
    isCompleted: boolean;
    totalCompletedAttempts: number;
  };
}
```

**Transformation Logic**:
```typescript
function removeCardAnswers(cardProgress: CardProgress): CardProgress {
  return {
    ...cardProgress,
    completedAttempts: cardProgress.completedAttempts.map(attempt => {
      const { question1, question2, ...rest } = attempt.answers || {};
      return {
        ...attempt,
        answers: rest // Keep other answer fields if any, but remove question1/question2
      };
    })
  };
}
```

**Database Schema**:
```sql
CREATE TABLE card_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL,
  card_id VARCHAR(100) NOT NULL,
  completed_attempts JSONB DEFAULT '[]'::jsonb, -- Without question1/question2
  is_completed BOOLEAN DEFAULT false,
  total_completed_attempts INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(telegram_user_id, card_id)
);
```

---

### 3.4 Points Contract

**LocalStorage Format**:
- `menhausen_points_balance`: `number` (string in localStorage)
- `menhausen_points_transactions`: `PointsTransaction[]`

**PointsTransaction**:
```typescript
{
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  timestamp: string; // ISO timestamp
  note?: string;
  correlationId?: string;
  balanceAfter: number;
}
```

**API Format**:
```typescript
{
  balance: number;
  transactions: PointsTransaction[];
}
```

**Database Schema**:
```sql
CREATE TABLE user_points (
  telegram_user_id BIGINT PRIMARY KEY,
  balance INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL,
  transaction_id VARCHAR(255) NOT NULL, -- From localStorage tx.id
  type VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  note TEXT,
  correlation_id VARCHAR(255),
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(telegram_user_id, transaction_id)
);
```

---

### 3.5 User Stats Contract

**LocalStorage Format** (`menhausen_user_stats`):
```typescript
{
  version: number;
  checkins: number;
  checkinStreak: number;
  lastCheckinDate: string | null;
  cardsOpened: Record<string, number>;
  topicsCompleted: string[];
  cardsRepeated: Record<string, number>;
  topicsRepeated: string[];
  articlesRead: number;
  readArticleIds: string[];
  openedCardIds: string[];
  referralsInvited: number;
  referralsPremium: number;
  lastUpdated: string;
}
```

**API Format**: Same as localStorage (1:1 mapping)

**Database Schema**:
```sql
CREATE TABLE user_stats (
  telegram_user_id BIGINT PRIMARY KEY,
  version INTEGER DEFAULT 1,
  checkins INTEGER DEFAULT 0,
  checkin_streak INTEGER DEFAULT 0,
  last_checkin_date DATE,
  cards_opened JSONB DEFAULT '{}'::jsonb,
  topics_completed JSONB DEFAULT '[]'::jsonb,
  cards_repeated JSONB DEFAULT '{}'::jsonb,
  topics_repeated JSONB DEFAULT '[]'::jsonb,
  articles_read INTEGER DEFAULT 0,
  read_article_ids JSONB DEFAULT '[]'::jsonb,
  opened_card_ids JSONB DEFAULT '[]'::jsonb,
  referrals_invited INTEGER DEFAULT 0,
  referrals_premium INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. CONFLICT RESOLUTION CONTRACTS

### 4.1 Preferences (Remote Wins)
```typescript
// Strategy: Remote data completely overwrites local
const merged = remoteData; // No merging, just use remote
```

### 4.2 Check-ins (Smart Merge)
```typescript
// Strategy: Merge by date_key, keep both if dates differ
function mergeCheckins(local: CheckinMap, remote: CheckinMap): CheckinMap {
  const merged = { ...remote }; // Start with remote
  // Add local only if not in remote
  Object.keys(local).forEach(dateKey => {
    if (!merged[dateKey]) {
      merged[dateKey] = local[dateKey];
    }
  });
  return merged;
}
```

### 4.3 Points Transactions (Smart Merge)
```typescript
// Strategy: Merge by transaction_id, dedupe
function mergeTransactions(local: Transaction[], remote: Transaction[]): Transaction[] {
  const mergedMap = new Map<string, Transaction>();
  
  // Add remote first (server wins)
  remote.forEach(tx => mergedMap.set(tx.id, tx));
  
  // Add local only if not in remote
  local.forEach(tx => {
    if (!mergedMap.has(tx.id)) {
      mergedMap.set(tx.id, tx);
    }
  });
  
  return Array.from(mergedMap.values()).sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}
```

### 4.4 Achievements (Smart Merge)
```typescript
// Strategy: Merge by achievementId, remote wins for unlocked status
function mergeAchievements(local: AchievementMap, remote: AchievementMap): AchievementMap {
  const merged = { ...local };
  
  // Update with remote, remote wins
  Object.keys(remote).forEach(achievementId => {
    merged[achievementId] = remote[achievementId];
  });
  
  return merged;
}
```

---

## 5. ERROR HANDLING CONTRACTS

### 5.1 Error Response Format
All errors follow this structure:
```typescript
{
  success: false;
  error: string; // Human-readable error message
  code: string; // Machine-readable error code
  details?: any; // Additional error details (optional)
}
```

### 5.2 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_FAILED` | 401 | Telegram authentication failed |
| `INVALID_TELEGRAM_DATA` | 401 | Invalid or expired initData |
| `USER_NOT_FOUND` | 404 | User doesn't exist in database |
| `INVALID_REQUEST` | 400 | Malformed request body |
| `VALIDATION_ERROR` | 400 | Data validation failed |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### 5.3 Client Error Handling
```typescript
try {
  const response = await syncUserData(data);
  if (!response.success) {
    // Handle specific error codes
    switch (response.code) {
      case 'AUTH_FAILED':
        // Retry auth or show error
        break;
      case 'VALIDATION_ERROR':
        // Log validation error
        break;
      default:
        // Queue for retry
        queueForRetry(data);
    }
  }
} catch (error) {
  // Network error - queue for retry
  queueForRetry(data);
}
```

---

## 6. TELEGRAM AUTHENTICATION CONTRACT

### 6.1 InitData Format
Telegram WebApp provides `initData` as URL-encoded string:
```
user=%7B%22id%22%3A123456789%2C...%7D&hash=...
```

### 6.2 Validation Process
1. Parse initData string
2. Extract `hash` and data fields
3. Verify signature using bot token and secret key
4. Check expiration (if `auth_date` present)
5. Extract `user.id` as `telegram_user_id`
6. Return user ID if valid, reject if invalid

### 6.3 Auth Header Format
```
X-Telegram-Init-Data: [raw_initData_string_from_Telegram]
```

### 6.4 Validation Function Signature
```typescript
function validateTelegramAuth(initData: string, botToken: string): {
  valid: boolean;
  userId?: number;
  error?: string;
}
```

---

## 7. SYNC METADATA CONTRACT

### 7.1 Sync Metadata Table
```sql
CREATE TABLE sync_metadata (
  telegram_user_id BIGINT NOT NULL,
  data_type VARCHAR(50) NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_version INTEGER DEFAULT 1,
  UNIQUE(telegram_user_id, data_type)
);
```

### 7.2 Metadata Usage
- Track when each data type was last synced
- Detect if sync is needed (compare timestamps)
- Version tracking for schema migrations
- Conflict resolution hints

---

## 8. ENCRYPTION CONTRACT

### 8.1 Data Types Requiring Encryption
- Survey results (`survey-results`)
- Daily check-ins (`daily_checkin_*`)
- Psychological test results (`psychological-test-results`)
- Card answers (when implemented in future)

### 8.2 Encryption Format
```typescript
{
  encryptedData: string; // Base64 encoded encrypted JSON
  // OR store encrypted data in separate encrypted_data column
}
```

### 8.3 Encryption Process
1. Serialize data to JSON string
2. Encrypt using CriticalDataManager encryption
3. Base64 encode encrypted result
4. Store in `encrypted_data` column or `encryptedData` field

### 8.4 Decryption Process
1. Base64 decode encrypted string
2. Decrypt using CriticalDataManager decryption
3. Parse JSON string to object
4. Use decrypted data

---

**Document Status**: ✅ Complete - Ready for Implementation

