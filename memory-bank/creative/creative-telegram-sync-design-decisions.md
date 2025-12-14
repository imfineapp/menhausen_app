# Telegram User API Sync - Creative Phase Design Decisions

## Document Information
- **Task**: Telegram Users API Sync with Supabase
- **Phase**: CREATIVE - Detailed Design Decisions
- **Created**: 2025-12-14
- **Related**: `creative-telegram-sync-architecture.md`, `creative-telegram-sync-api-spec.md`

---

## 🎯 CREATIVE PHASE OVERVIEW

This document captures detailed design decisions for all critical components of the Telegram User API Sync system. Each decision follows a structured evaluation process with multiple options, analysis, and clear rationale.

---

## 📌 DESIGN DECISION 1: LocalStorage Interceptor Strategy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1️⃣ PROBLEM
**Description**: Need to detect localStorage changes to trigger sync operations without modifying existing code
**Requirements**: 
- Intercept all localStorage.setItem calls
- Track which keys changed
- Maintain backward compatibility
- No breaking changes to existing code
- Support for localStorage.getItem/removeItem

**Constraints**: 
- Cannot modify existing localStorage usage throughout codebase
- Must work in React environment
- Must support SSR scenarios

### 2️⃣ OPTIONS

**Option A**: Proxy-based Interceptor - Wrap localStorage with Proxy
**Option B**: StorageEvent Listener - Use storage event API
**Option C**: Wrapper Function - Create localStorage wrapper utility

### 3️⃣ ANALYSIS

| Criterion | Proxy | StorageEvent | Wrapper |
|-----------|-------|--------------|---------|
| Compatibility | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Detection Accuracy | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Setup Complexity | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Performance | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Maintenance | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**Key Insights**:
- Proxy offers best compatibility and detection but requires careful implementation
- StorageEvent only fires for cross-tab changes, not same-tab
- Wrapper requires code changes throughout app (not acceptable)

### 4️⃣ DECISION

**Selected**: Option A: Proxy-based Interceptor

**Rationale**: 
- Zero code changes required in existing codebase
- Detects all localStorage operations accurately
- Modern browser support is excellent (all target browsers support Proxy)
- Can track key changes precisely for incremental sync

### 5️⃣ IMPLEMENTATION NOTES

```typescript
// utils/supabaseSync/localStorageInterceptor.ts

class LocalStorageInterceptor {
  private originalLocalStorage: Storage;
  private changeListeners: Map<string, Set<() => void>> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  
  constructor() {
    this.originalLocalStorage = window.localStorage;
    this.intercept();
  }
  
  private intercept() {
    const interceptor = this;
    
    // Create proxy for localStorage
    const localStorageProxy = new Proxy(this.originalLocalStorage, {
      set(target: Storage, prop: string | symbol, value: any): boolean {
        const key = String(prop);
        
        // Handle setItem
        if (prop === 'setItem') {
          return interceptor.handleSetItem(target, value);
        }
        
        // Handle getItem
        if (prop === 'getItem') {
          return interceptor.handleGetItem(target, value);
        }
        
        // Handle removeItem
        if (prop === 'removeItem') {
          return interceptor.handleRemoveItem(target, value);
        }
        
        // Default behavior
        return Reflect.set(target, prop, value);
      },
      
      get(target: Storage, prop: string | symbol): any {
        const key = String(prop);
        
        if (prop === 'setItem') {
          return (key: string, value: string) => {
            target.setItem(key, value);
            interceptor.onChange(key, value);
          };
        }
        
        if (prop === 'getItem') {
          return (key: string) => target.getItem(key);
        }
        
        if (prop === 'removeItem') {
          return (key: string) => {
            target.removeItem(key);
            interceptor.onChange(key, null);
          };
        }
        
        return Reflect.get(target, prop);
      }
    });
    
    // Replace window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageProxy,
      writable: true,
      configurable: true
    });
  }
  
  private onChange(key: string, value: string | null): void {
    // Debounce rapid changes
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    const timer = setTimeout(() => {
      const listeners = this.changeListeners.get(key);
      if (listeners) {
        listeners.forEach(listener => listener());
      }
      this.debounceTimers.delete(key);
    }, 150); // 150ms debounce
    
    this.debounceTimers.set(key, timer);
  }
  
  public onKeyChange(key: string, callback: () => void): () => void {
    if (!this.changeListeners.has(key)) {
      this.changeListeners.set(key, new Set());
    }
    
    this.changeListeners.get(key)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.changeListeners.get(key)?.delete(callback);
    };
  }
}

export const localStorageInterceptor = new LocalStorageInterceptor();
```

**Key Implementation Details**:
- Initialize interceptor once at app startup
- Use 150ms debounce (between 100-200ms target)
- Track listeners per key for efficiency
- Clean up timers to prevent memory leaks
- Support unsubscribe for cleanup

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## 📌 DESIGN DECISION 2: Debouncing Strategy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1️⃣ PROBLEM
**Description**: Rapid localStorage changes (e.g., typing in survey) should not trigger multiple sync operations
**Requirements**:
- Batch rapid changes into single sync
- Configurable delay (100-200ms range)
- Per-key debouncing
- Immediate sync after debounce period

**Constraints**:
- Must not delay sync indefinitely
- Must handle app close scenarios

### 2️⃣ OPTIONS

**Option A**: Fixed Delay Debounce - Always wait fixed time
**Option B**: Adaptive Debounce - Adjust delay based on change frequency
**Option C**: Batch Queue - Collect changes, sync on timer

### 3️⃣ ANALYSIS

| Criterion | Fixed | Adaptive | Batch Queue |
|-----------|-------|----------|-------------|
| Simplicity | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Performance | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Predictability | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Implementation | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

**Key Insights**:
- Fixed delay is simplest and sufficient for our use case
- Adaptive debounce adds complexity without significant benefit
- Batch queue is good but adds complexity for minimal gain

### 4️⃣ DECISION

**Selected**: Option A: Fixed Delay Debounce (150ms)

**Rationale**:
- Simplest implementation
- Predictable behavior
- 150ms provides good balance (in middle of 100-200ms target)
- Easy to test and debug

### 5️⃣ IMPLEMENTATION NOTES

- Use 150ms delay (optimal balance)
- Per-key debouncing (each localStorage key debounced independently)
- Clear timer on new change within debounce window
- Fire sync after debounce period expires
- Handle app close with `beforeunload` event (sync immediately)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## 📌 DESIGN DECISION 3: Data Transformation Approach

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1️⃣ PROBLEM
**Description**: Transform localStorage data format to API format, handle card answer removal
**Requirements**:
- Transform all data types correctly
- Remove question1/question2 from card progress
- Handle nested structures
- Preserve all other data
- Bidirectional transformation (local ↔ API)

**Constraints**:
- Must handle missing or malformed data gracefully
- Must maintain type safety

### 2️⃣ OPTIONS

**Option A**: Individual Transform Functions - Separate function per data type
**Option B**: Unified Transform System - Single transformer with type routing
**Option C**: Schema-Based Transformation - Declarative schema definitions

### 3️⃣ ANALYSIS

| Criterion | Individual | Unified | Schema-Based |
|-----------|------------|---------|--------------|
| Maintainability | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Type Safety | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Flexibility | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Complexity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

**Key Insights**:
- Unified system provides better consistency
- Individual functions are easier to test in isolation
- Schema-based is overkill for current needs

### 4️⃣ DECISION

**Selected**: Option A: Individual Transform Functions (with shared utilities)

**Rationale**:
- Each data type has unique transformation needs
- Easier to test and maintain
- Better type safety with TypeScript
- Can share common utilities (e.g., card answer removal)

### 5️⃣ IMPLEMENTATION NOTES

```typescript
// utils/supabaseSync/dataTransformers.ts

/**
 * Remove question1 and question2 from card progress completedAttempts
 */
export function removeCardAnswers(cardProgress: CardProgress): CardProgress {
  return {
    ...cardProgress,
    completedAttempts: cardProgress.completedAttempts.map(attempt => {
      // Create new object without question1/question2
      const { question1, question2, ...restAnswers } = attempt.answers || {};
      return {
        ...attempt,
        answers: restAnswers // Keep other answer fields if any
      };
    })
  };
}

/**
 * Transform card progress for sync (removes answers)
 */
export function transformCardProgressForSync(
  cardId: string,
  cardProgress: CardProgress
): SyncCardProgress {
  const cleaned = removeCardAnswers(cardProgress);
  return {
    cardId: cleaned.cardId,
    completedAttempts: cleaned.completedAttempts.map(attempt => ({
      attemptId: attempt.attemptId,
      date: attempt.date,
      // answers excluded
      rating: attempt.rating,
      completedAt: attempt.completedAt,
      ratingComment: attempt.ratingComment
    })),
    isCompleted: cleaned.isCompleted,
    totalCompletedAttempts: cleaned.totalCompletedAttempts
  };
}

/**
 * Transform all localStorage keys to API format
 */
export function transformForSync(key: string, value: any): any {
  // Route to specific transformer based on key
  if (key === 'survey-results' || key.startsWith('menhausen_survey_results')) {
    return transformSurveyResults(value);
  }
  
  if (key.startsWith('daily_checkin_')) {
    return transformDailyCheckin(key, value);
  }
  
  if (key === 'menhausen_user_stats') {
    return transformUserStats(value);
  }
  
  if (key.startsWith('theme_card_progress_')) {
    const cardId = key.replace('theme_card_progress_', '');
    return transformCardProgressForSync(cardId, value);
  }
  
  // ... other transformers
  
  // Default: pass through
  return value;
}
```

**Key Implementation Details**:
- Each data type has dedicated transform function
- Shared utilities for common operations (card answer removal)
- Type-safe transformations with TypeScript
- Handle edge cases (missing data, malformed data)
- Bidirectional: transformForSync and transformFromAPI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## 📌 DESIGN DECISION 4: Conflict Resolution Algorithm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1️⃣ PROBLEM
**Description**: When local and remote data differ, need intelligent merging strategy
**Requirements**:
- Remote wins for preferences/flags
- Smart merge for collections (check-ins, transactions)
- Merge arrays by unique identifiers
- No data loss
- Deterministic results

**Constraints**:
- Must handle concurrent modifications
- Must be idempotent
- Must handle edge cases (null, undefined, missing data)

### 2️⃣ OPTIONS

**Option A**: Type-Specific Merge Functions - Different strategy per data type
**Option B**: Generic Merge with Strategies - Strategy pattern with type routing
**Option C**: Unified Merge Algorithm - Single algorithm handles all types

### 3️⃣ ANALYSIS

| Criterion | Type-Specific | Strategy Pattern | Unified |
|-----------|---------------|------------------|---------|
| Clarity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Maintainability | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Extensibility | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Testability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**Key Insights**:
- Type-specific functions are clearest and most testable
- Strategy pattern is more extensible but adds abstraction
- Unified algorithm is too complex for diverse data types

### 4️⃣ DECISION

**Selected**: Option A: Type-Specific Merge Functions (with shared utilities)

**Rationale**:
- Each data type needs unique merge logic
- Clearest implementation
- Easier to test in isolation
- Can share utilities (e.g., array merging by ID)

### 5️⃣ IMPLEMENTATION NOTES

```typescript
// utils/supabaseSync/conflictResolver.ts

/**
 * Remote wins merge (for preferences, flags)
 */
export function mergeRemoteWins<T>(local: T, remote: T): T {
  // If remote exists, use it; otherwise use local
  return remote ?? local;
}

/**
 * Smart merge for check-ins (by date_key)
 */
export function mergeCheckins(
  local: Record<string, CheckinData>,
  remote: Record<string, CheckinData>
): Record<string, CheckinData> {
  const merged = { ...remote }; // Start with remote
  
  // Add local only if not in remote
  Object.keys(local).forEach(dateKey => {
    if (!merged[dateKey]) {
      merged[dateKey] = local[dateKey];
    }
  });
  
  return merged;
}

/**
 * Smart merge for points transactions (by transaction_id)
 */
export function mergeTransactions(
  local: PointsTransaction[],
  remote: PointsTransaction[]
): PointsTransaction[] {
  const mergedMap = new Map<string, PointsTransaction>();
  
  // Add remote first (server wins for conflicts)
  remote.forEach(tx => mergedMap.set(tx.id, tx));
  
  // Add local only if not in remote
  local.forEach(tx => {
    if (!mergedMap.has(tx.id)) {
      mergedMap.set(tx.id, tx);
    }
  });
  
  // Sort by timestamp
  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Smart merge for arrays by unique identifier
 */
export function mergeArraysById<T extends { id: string }>(
  local: T[],
  remote: T[],
  idKey: keyof T = 'id' as keyof T
): T[] {
  const mergedMap = new Map<string, T>();
  
  // Add remote first
  remote.forEach(item => {
    const id = String(item[idKey]);
    mergedMap.set(id, item);
  });
  
  // Add local only if not in remote
  local.forEach(item => {
    const id = String(item[idKey]);
    if (!mergedMap.has(id)) {
      mergedMap.set(id, item);
    }
  });
  
  return Array.from(mergedMap.values());
}

/**
 * Main conflict resolver router
 */
export function resolveConflict(
  dataType: string,
  local: any,
  remote: any
): any {
  // Handle null/undefined
  if (!remote) return local;
  if (!local) return remote;
  
  // Route to specific merge function
  switch (dataType) {
    case 'user_preferences':
    case 'language':
    case 'hasShownFirstAchievement':
    case 'flowProgress':
      return mergeRemoteWins(local, remote);
      
    case 'dailyCheckins':
      return mergeCheckins(local, remote);
      
    case 'points_transactions':
      return mergeTransactions(local, remote);
      
    case 'achievements':
      return mergeAchievements(local, remote);
      
    case 'userStats':
      return mergeUserStats(local, remote);
      
    default:
      // Default: remote wins
      return mergeRemoteWins(local, remote);
  }
}
```

**Key Implementation Details**:
- Each data type has specific merge function
- Shared utilities for common patterns
- Handle null/undefined gracefully
- Deterministic results (same inputs = same output)
- Test each merge function independently

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## 📌 DESIGN DECISION 5: Encryption Integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1️⃣ PROBLEM
**Description**: Encrypt sensitive data before sync while maintaining existing CriticalDataManager encryption
**Requirements**:
- Integrate with existing CriticalDataManager
- Encrypt sensitive data types
- Decrypt on fetch
- Maintain backward compatibility

**Constraints**:
- Must use existing encryption method (base64)
- Cannot break existing encrypted data

### 2️⃣ OPTIONS

**Option A**: Reuse CriticalDataManager - Use existing encrypt/decrypt methods
**Option B**: New Encryption Layer - Create separate encryption service
**Option C**: Hybrid Approach - CriticalDataManager for local, new layer for sync

### 3️⃣ ANALYSIS

| Criterion | Reuse Existing | New Layer | Hybrid |
|-----------|----------------|-----------|--------|
| Consistency | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Simplicity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Flexibility | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Maintenance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

**Key Insights**:
- Reusing CriticalDataManager maintains consistency
- Single encryption method reduces complexity
- No need for separate encryption layers

### 4️⃣ DECISION

**Selected**: Option A: Reuse CriticalDataManager

**Rationale**:
- Maintains consistency with existing encryption
- Simpler architecture
- No need to maintain two encryption systems
- Existing encryption is sufficient for our needs

### 5️⃣ IMPLEMENTATION NOTES

```typescript
// utils/supabaseSync/encryption.ts

import { criticalDataManager } from '../dataManager';

/**
 * Check if data type requires encryption
 */
export function shouldEncrypt(dataType: string): boolean {
  const encryptedTypes = [
    'survey-results',
    'menhausen_survey_results',
    'daily_checkin_*',
    'psychological-test-results'
  ];
  
  return encryptedTypes.some(type => {
    if (type.endsWith('*')) {
      return dataType.startsWith(type.slice(0, -1));
    }
    return dataType === type;
  });
}

/**
 * Encrypt sensitive data before sync
 */
export async function encryptSensitiveData(data: any): Promise<string> {
  // Use existing CriticalDataManager encryption
  const serialized = JSON.stringify(data);
  const encrypted = criticalDataManager['encrypt'](serialized);
  return encrypted;
}

/**
 * Decrypt data after fetch
 */
export async function decryptSensitiveData(encrypted: string): Promise<any> {
  // Use existing CriticalDataManager decryption
  const decrypted = criticalDataManager['decrypt'](encrypted);
  return JSON.parse(decrypted);
}

/**
 * Prepare data for sync (encrypt if needed)
 */
export async function prepareDataForSync(
  dataType: string,
  data: any
): Promise<{ data: any; encryptedData?: string }> {
  if (shouldEncrypt(dataType)) {
    const encrypted = await encryptSensitiveData(data);
    return {
      data: null, // Clear original data
      encryptedData: encrypted
    };
  }
  
  return { data };
}
```

**Key Implementation Details**:
- Reuse CriticalDataManager encrypt/decrypt methods
- Determine encryption need based on data type
- Store encrypted data in `encrypted_data` column
- Clear original data when encrypted
- Maintain existing encryption format for compatibility

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## 📌 DESIGN DECISION 6: Telegram Auth Validation Implementation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1️⃣ PROBLEM
**Description**: Validate Telegram WebApp initData server-side for security
**Requirements**:
- Validate initData signature
- Extract telegram_user_id
- Check expiration
- Handle errors gracefully

**Constraints**:
- Must use Telegram bot token (secret)
- Must work in Supabase Edge Functions (Deno runtime)

### 2️⃣ OPTIONS

**Option A**: Custom Validation - Implement Telegram validation in Edge Function
**Option B**: Library-Based - Use existing Telegram validation library
**Option C**: Shared Utility - Create reusable validation utility

### 3️⃣ ANALYSIS

| Criterion | Custom | Library | Shared Utility |
|-----------|--------|---------|----------------|
| Control | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Maintenance | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Security | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Complexity | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**Key Insights**:
- Custom implementation gives full control
- Libraries may not support Deno/Edge Functions
- Shared utility allows reuse across functions

### 4️⃣ DECISION

**Selected**: Option C: Shared Utility (custom implementation)

**Rationale**:
- Full control over validation logic
- Works in Deno/Edge Functions environment
- Reusable across all Edge Functions
- Easier to debug and maintain

### 5️⃣ IMPLEMENTATION NOTES

```typescript
// supabase/functions/_shared/telegram-auth.ts

import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

/**
 * Validate Telegram WebApp initData
 */
export function validateTelegramAuth(
  initData: string,
  botToken: string
): { valid: boolean; userId?: number; error?: string } {
  try {
    // Parse initData (URL-encoded)
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    
    if (!hash) {
      return { valid: false, error: 'Missing hash in initData' };
    }
    
    // Remove hash from params for signature calculation
    params.delete('hash');
    
    // Sort parameters by key
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b));
    
    // Create data-check-string
    const dataCheckString = sortedParams
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Calculate secret key
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Calculate signature
    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Verify signature
    if (calculatedHash !== hash) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    // Check expiration (if auth_date present)
    const authDate = params.get('auth_date');
    if (authDate) {
      const authTimestamp = parseInt(authDate, 10) * 1000;
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (now - authTimestamp > maxAge) {
        return { valid: false, error: 'Expired initData' };
      }
    }
    
    // Extract user ID
    const userParam = params.get('user');
    if (!userParam) {
      return { valid: false, error: 'Missing user in initData' };
    }
    
    const user = JSON.parse(userParam);
    const userId = user.id;
    
    if (!userId) {
      return { valid: false, error: 'Missing user.id in initData' };
    }
    
    return { valid: true, userId };
  } catch (error) {
    return { valid: false, error: `Validation error: ${error.message}` };
  }
}

/**
 * Extract telegram_user_id from validated initData
 */
export function extractTelegramUserId(initData: string): number | null {
  try {
    const params = new URLSearchParams(initData);
    const userParam = params.get('user');
    if (!userParam) return null;
    
    const user = JSON.parse(userParam);
    return user.id || null;
  } catch {
    return null;
  }
}
```

**Key Implementation Details**:
- Use Telegram's official validation algorithm
- Support Deno/Edge Functions runtime
- Check signature and expiration
- Extract user ID securely
- Return clear error messages

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## 📌 DESIGN DECISION 7: Sync Service Architecture

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1️⃣ PROBLEM
**Description**: Design main sync service that coordinates all sync operations
**Requirements**:
- Coordinate localStorage interceptor
- Handle debouncing
- Manage sync queue
- Handle offline scenarios
- Provide sync status

**Constraints**:
- Must work asynchronously
- Must not block UI
- Must handle errors gracefully

### 2️⃣ OPTIONS

**Option A**: Singleton Service - Single instance manages all sync
**Option B**: Class-Based Service - Instantiable sync service class
**Option C**: Hook-Based Service - React hook for sync management

### 3️⃣ ANALYSIS

| Criterion | Singleton | Class-Based | Hook-Based |
|-----------|-----------|-------------|------------|
| Simplicity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| React Integration | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Testability | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| State Management | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Key Insights**:
- Singleton is simplest for background service
- Class-based is more testable
- Hook-based integrates best with React

### 4️⃣ DECISION

**Selected**: Option B: Class-Based Service (with React hook wrapper)

**Rationale**:
- Class-based service is testable and maintainable
- Can create React hook wrapper for component integration
- Best of both worlds: service logic separate, React integration easy

### 5️⃣ IMPLEMENTATION NOTES

```typescript
// utils/supabaseSync/supabaseSyncService.ts

export class SupabaseSyncService {
  private syncInProgress = false;
  private offlineQueue: SyncQueueItem[] = [];
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    lastSync: null,
    pendingItems: 0,
    syncInProgress: false
  };
  
  constructor() {
    this.initializeInterceptor();
    this.setupOnlineListeners();
    this.loadOfflineQueue();
  }
  
  /**
   * Initialize localStorage interceptor
   */
  private initializeInterceptor(): void {
    localStorageInterceptor.onKeyChange('survey-results', () => {
      this.queueSync('surveyResults', this.getLocalData('survey-results'));
    });
    
    // Register listeners for all sync-able keys
    SYNCABLE_KEYS.forEach(key => {
      localStorageInterceptor.onKeyChange(key, () => {
        this.queueSync(this.getDataTypeFromKey(key), this.getLocalData(key));
      });
    });
  }
  
  /**
   * Queue sync operation (with debouncing)
   */
  private queueSync(dataType: string, data: any): void {
    // Debouncing handled by interceptor
    // This method triggers actual sync
    if (this.syncInProgress) {
      // Wait for current sync to complete
      return;
    }
    
    this.syncInProgress = true;
    this.syncDataType(dataType, data)
      .finally(() => {
        this.syncInProgress = false;
      });
  }
  
  /**
   * Sync single data type
   */
  private async syncDataType(dataType: string, data: any): Promise<void> {
    try {
      if (!this.syncStatus.isOnline) {
        this.addToOfflineQueue(dataType, data);
        return;
      }
      
      const transformed = transformForSync(dataType, data);
      const encrypted = await prepareDataForSync(dataType, transformed);
      
      await supabase.functions.invoke('sync-data-type', {
        body: { dataType, data: encrypted },
        headers: {
          'X-Telegram-Init-Data': getTelegramInitData()
        }
      });
      
      this.updateSyncStatus();
    } catch (error) {
      console.error(`Sync failed for ${dataType}:`, error);
      this.addToOfflineQueue(dataType, data);
    }
  }
  
  /**
   * Full sync (all data)
   */
  async syncAll(): Promise<void> {
    // Implementation
  }
  
  /**
   * Fetch and merge remote data
   */
  async fetchAndMerge(): Promise<void> {
    // Implementation
  }
  
  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }
}
```

**Key Implementation Details**:
- Class-based service for testability
- Integrate with localStorage interceptor
- Handle offline queue
- Manage sync status
- React hook wrapper for component integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## 📌 DESIGN DECISION 8: Error Handling and Retry Logic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1️⃣ PROBLEM
**Description**: Handle sync failures gracefully with retry logic
**Requirements**:
- Retry failed syncs
- Exponential backoff
- Limit retry attempts
- Handle permanent failures
- Queue for offline scenarios

**Constraints**:
- Must not retry indefinitely
- Must handle network errors
- Must handle auth errors differently

### 2️⃣ OPTIONS

**Option A**: Simple Retry - Fixed retry count with fixed delay
**Option B**: Exponential Backoff - Increasing delays between retries
**Option C**: Adaptive Retry - Adjust strategy based on error type

### 3️⃣ ANALYSIS

| Criterion | Simple | Exponential | Adaptive |
|-----------|--------|-------------|----------|
| Simplicity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Effectiveness | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Network Friendly | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Implementation | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

**Key Insights**:
- Exponential backoff is standard and effective
- Different error types need different handling
- Auth errors should not retry automatically

### 4️⃣ DECISION

**Selected**: Option C: Adaptive Retry (with exponential backoff base)

**Rationale**:
- Exponential backoff for network errors
- No retry for auth errors (user action needed)
- Different strategies for different error types
- Best user experience

### 5️⃣ IMPLEMENTATION NOTES

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // ms
  maxDelay: number; // ms
  shouldRetry: (error: any) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1s
  maxDelay: 10000, // 10s
  shouldRetry: (error) => {
    // Don't retry auth errors
    if (error.code === 'AUTH_FAILED' || error.code === 'INVALID_TELEGRAM_DATA') {
      return false;
    }
    
    // Retry network errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
      return true;
    }
    
    // Retry server errors (5xx)
    if (error.status >= 500) {
      return true;
    }
    
    // Don't retry client errors (4xx except timeout)
    return false;
  }
};

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if should retry
      if (!config.shouldRetry(error) || attempt === config.maxRetries) {
        throw error;
      }
      
      // Calculate delay (exponential backoff)
      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt),
        config.maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

**Key Implementation Details**:
- Exponential backoff: 1s, 2s, 4s (capped at 10s)
- Max 3 retries by default
- Don't retry auth errors
- Retry network and server errors
- Queue for offline scenarios

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## ✅ VERIFICATION CHECKLIST

- [x] All design decisions documented
- [x] Options evaluated with clear criteria
- [x] Decisions justified with rationale
- [x] Implementation notes provided
- [x] Type safety considered
- [x] Error handling addressed
- [x] Performance implications considered
- [x] Security considerations addressed

---

**Document Status**: ✅ Complete - Ready for VAN QA Phase

