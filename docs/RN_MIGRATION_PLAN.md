# План миграции Telegram Mini App → React Native (Standalone)

## Executive Summary

**Цель:** Создать standalone iOS/Android приложения из существующего Telegram Mini App с максимальным переиспользованием кода.

**Ключевые изменения архитектуры:**

| Компонент | Было (Web) | Станет (RN) |
|-----------|-----------|-------------|
| Auth | Telegram initData | Device ID + optional Telegram linking |
| Payments | Telegram Stars (openInvoice) | Adapty SDK (Google Play Billing) |
| State | Nanostores + localStorage | Nanostores + MMKV |
| Sync | Supabase sync + BroadcastChannel | Supabase sync (без BroadcastChannel) |
| Telegram API | window.Telegram.WebApp | Device-based |

**Результат:** 2 приложения (Google Play, опционально App Store) + существующий Telegram Mini App как он есть.

**Срок:** ~14-21 недель (при part-time работе 2 человек)

---

## Фаза 0: Подготовка репозитория

### 0.1 Структура монорепо

```
menhausen-app/
├── apps/
│   ├── web/                    # Существующий Telegram Mini App (Vite)
│   │   └── ...
│   ├── android/                # React Native Android app (Expo)
│   │   └── ...
│   └── ios/                    # React Native iOS app (Expo)
│       └── ...
├── packages/
│   ├── shared/                 # Общий код для всех платформ
│   │   ├── domain/             # Pure business logic (переносится как есть)
│   │   ├── services/           # achievementChecker, points, etc.
│   │   ├── stores/             # Nanostores (переносится как есть)
│   │   ├── utils/              # ContentLoader, ThemeLoader, managers
│   │   └── types/              # TypeScript types
│   └── config/
│       ├── eslint/             # Общие ESLint правила
│       ├── typescript/         # Общий tsconfig
│       └── tailwind/           # Tailwind конфиг (для web)
├── docs/
│   └── migration/              # Документация миграции
└── README.md
```

**Обоснование:** Максимальное переиспользование кода. `packages/shared` содержит все portable компоненты. Web и RN используют один и тот же domain и services код.

### 0.2 Что остаётся в каждом приложении

| Компонент | apps/web | apps/android | apps/ios |
|-----------|----------|--------------|----------|
| `packages/shared/domain/` | ✅ | ✅ | ✅ |
| `packages/shared/services/` | ✅ | ✅ | ✅ |
| `packages/shared/stores/` | ✅ | ✅ | ✅ |
| `packages/shared/utils/` | ✅ | ✅ | ✅ |
| `packages/shared/types/` | ✅ | ✅ | ✅ |
| UI components (screens) | Свой | Свой | Свой |
| Navigation | nanostores/router | nanostores/router + RN bridge | nanostores/router + RN bridge |
| Storage | localStorage | MMKV | MMKV |
| HTTP client | fetch / supabase-js | fetch / supabase-js | fetch / supabase-js |

---

## Фаза 1: Разделение кода (1-2 недели)

### 1.1 Create packages/shared

**Цель:** Вынести portable код из текущего `src/` в `packages/shared/`.

**Действия:**

```bash
# Создать структуру
mkdir -p packages/shared/{domain,services,stores,utils,types}
mkdir -p packages/config/{eslint,typescript,tailwind}
mkdir -p apps/{web,android,ios}
```

**Файлы для переноса в packages/shared:**

| Категория | Файлы | Правило |
|-----------|-------|---------|
| domain | `src/domain/*.domain.ts` | Pure functions, NO store imports |
| services | `services/*.ts` (achievementChecker, achievementStorage, etc.) | Business logic |
| stores | `src/stores/*.store.ts` | Nanostores atoms/maps/computed |
| utils | `utils/*.ts` (ContentLoader, ThemeLoader, PointsManager, DailyCheckinManager, ThemeCardManager) | Infrastructure |
| types | `types/*.ts` | TypeScript definitions |

**Файлы НЕ переносятся (платформо-специфичные):**
- `src/effects/telegram.ts` — зависит от `window.Telegram.WebApp`
- `src/sync/crossTabSync.ts` — BroadcastChannel не существует в RN
- `utils/telegramStarsPaymentService.ts` — Telegram SDK
- `utils/premiumSignature.ts` — crypto.subtle
- `utils/attribution.ts` — Telegram start params

### 1.2 Update imports and dependencies

В каждом файле изменить:
```typescript
// Было
import { checkinDomain } from '@/domain/checkin.domain';

// Станет
import { checkinDomain } from '@menhausen/shared/domain';
```

### 1.3 Configure package.json для shared

```json
{
  "name": "@menhausen/shared",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist",
    "./domain": "./dist/domain",
    "./services": "./dist/services",
    "./stores": "./dist/stores",
    "./utils": "./dist/utils",
    "./types": "./dist/types"
  }
}
```

**Build tool:** Использовать **tsup** или **tsdx** для быстрой сборки пакета.

### 1.4 Результат Phase 1

```
packages/shared/
├── dist/                    # Скомпилированный код
├── domain/                  # 5-7 domain files
├── services/                # 5-8 service files
├── stores/                 # 8-10 store files
├── utils/                   # 8-10 utility files
└── types/                   # 5-10 type files
```

**Verification:**
- `npm run build` в packages/shared должен проходить без ошибок
- Все domain files имеют 0 store imports
- TypeScript compilation clean

---

## Фаза 2: Android App Setup (2-3 недели)

### 2.1 Expo Setup

```bash
cd apps/android
npx create-expo-app@latest . --template blank-typescript
```

**Ключевые dependencies:**

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    
    "@nanostores/react": "^1.0.0",
    "@nanostores/router": "^1.0.0",
    "@nanostores/persistent": "^1.3.3",
    "@nanostores/i18n": "^1.2.2",
    
    "@supabase/supabase-js": "^2.87.1",
    
    "@adapty/react-native-sdk": "^2.0.0",
    "react-native-mmkv": "^3.0.0",
    
    "expo-router": "^4.0.0",
    "expo-linking": "~7.0.0",
    "expo-constants": "~17.0.0",
    
    "react-native-reanimated": "^3.16.0",
    "react-native-gesture-handler": "^2.20.0",
    "react-native-screens": "^4.0.0",
    "react-native-safe-area-context": "^5.0.0",
    
    "expo-crypto": "^14.0.0",
    
    "lucide-react-native": "^0.400.0",
    "sonner-native": "^0.4.0"
  }
}
```

### 2.2 Navigation Setup (nanostores/router + RN bridge)

Проблема: `@nanostores/router` использует URL-based routing, что не идеально для RN.

**Решение:** Создать thin bridge между nanostores/router и React Navigation:

```typescript
// apps/android/src/navigation/router-bridge.ts
import { useRouter, type LinkProps } from 'expo-router';
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $router, routerAtom } from '@menhausen/shared/stores';

export function RouterBridge() {
  const router = useRouter();
  const route = useStore(routerAtom);
  
  useEffect(() => {
    // Sync nanostores router → expo-router
    if (route?.route) {
      router.push(route.route as any);
    }
  }, [route]);
  
  return null;
}
```

**Альтернатива (если bridge слишком сложный):** Использовать `expo-router` как primary navigation, nanostores/router оставить для web. Но тогда UI components будут отличаться.

**Рекомендация:** Попробовать bridge. Если не работает — перейти на React Navigation.

### 2.3 MMKV Storage Setup

```typescript
// apps/android/src/stores/storage.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'menhausen-storage',
});

// Create nanostores persistent adapter for MMKV
import { persistentAtom } from '@nanostores/persistent';

export const $userPoints = persistentAtom<number>('user-points', 0, {
  storage: {
    getItem: (key) => {
      const value = storage.getString(key);
      return value ? JSON.parse(value) : null;
    },
    setItem: (key, value) => {
      storage.set(key, JSON.stringify(value));
    },
    removeItem: (key) => {
      storage.delete(key);
    },
  },
});
```

### 2.4 Adapty SDK Setup

```typescript
// apps/android/src/services/adapty-service.ts
import { Adapty, AdaptyPaywall, AdaptyProduct } from '@adapty/react-native-sdk';

class AdaptyService {
  private initialized = false;
  
  async initialize() {
    if (this.initialized) return;
    
    Adapty.activate('YOUR_ADAPTY_PUBLIC_KEY');
    this.initialized = true;
  }
  
  async getPaywall(): Promise<AdaptyPaywall | null> {
    const paywall = await Adapty.getPaywall('premium_monthly');
    return paywall;
  }
  
  async purchase(product: AdaptyProduct): Promise<boolean> {
    try {
      const result = await Adapty.makePurchase(product);
      return result.success;
    } catch (e) {
      return false;
    }
  }
  
  async checkPremiumStatus(): Promise<boolean> {
    const profile = await Adapty.getProfile();
    return profile?.subscriptions?.premium?.isActive ?? false;
  }
}

export const adaptyService = new AdaptyService();
```

### 2.5 Supabase Client Setup

```typescript
// apps/android/src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      // Use MMKV for token storage
      getItem: (key) => storage.getString(key),
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

### 2.6 Device ID Generation

```typescript
// apps/android/src/services/device-id.ts
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'device_id';

export async function getDeviceId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  
  if (!deviceId) {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    deviceId = Buffer.from(randomBytes).toString('base64url');
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
}
```

### 2.7 Telegram Linking (Optional)

Для пользователей которые хотят привязать Telegram:

```typescript
// apps/android/src/services/telegram-linking.ts
// Использует Telegram Bot API для верификации
// Пользователь авторизуется через бота, бот возвращает link code
// Приложение обменивает link code на telegram_user_id

interface TelegramLinkResult {
  success: boolean;
  telegramUserId?: string;
  error?: string;
}

export async function linkTelegramAccount(linkCode: string): Promise<TelegramLinkResult> {
  // Вызывает Edge Function для валидации link code
  const { data, error } = await supabase.functions.invoke('link-telegram-account', {
    body: { linkCode },
  });
  
  return data;
}
```

### 2.8 Screen Implementation Start

Начать с porting наиболее критичных screens:

| Screen | Priority | Notes |
|--------|----------|-------|
| HomeScreen | High | Core entry point |
| PaymentsScreen | High | Adapty integration point |
| CheckinScreen | Medium | Daily engagement |
| ProfileScreen | Medium | Settings |
| ThemeCardFlow | Medium | Core feature |

### 2.9 Phase 2 Result

```
apps/android/
├── src/
│   ├── navigation/         # Router bridge + screens
│   ├── screens/           # Ported screens
│   ├── services/           # Adapty, Supabase, Device ID
│   ├── stores/            # RN-specific storage setup
│   └── App.tsx
├── android/               # Native Android project
└── package.json
```

**Verification:**
- Приложение запускается в Expo Go / Android emulator
- MMKV storage работает
- Adapty SDK инициализируется
- Nanostores state синхронизируется с UI

---

## Фаза 3: iOS App Setup (1-2 недели)

После Android — аналогичный процесс для iOS.

**Отличия:**
- Использовать `@adapty/react-native-sdk` с iOS конфигурацией
- `expo-secure-store` для device ID
- Xcode project setup через `npx expo run:ios`

**Возможные проблемы:**
- Adapty iOS SDK initialization differences
- Safe area handling для разных iPhone моделей
- TestFlight setup

---

## Фаза 4: Sync Architecture Porting (2-3 недели)

### 4.1 Supabase Sync Service

Текущий sync работает через:
- `LocalStorageInterceptor` — перехватывает localStorage
- `SupabaseSyncService` — mutex + incremental sync
- `dirtySignatures` — отслеживание изменений

**Porting:**

```typescript
// apps/android/src/sync/supabase-sync.ts
// Заменить localStorage на MMKV
// Заменить BroadcastChannel на NativeEventEmitter (если нужен cross-tab в рамках одного устройства)
// Оставить остальную логику unchanged

import { storage } from '../stores/storage';
import { supabase } from '../services/supabase';

class SupabaseSyncService {
  private syncMutex = new AsyncMutex();
  
  async sync(): Promise<SyncResult> {
    await this.syncMutex.lock();
    try {
      // Fetch remote changes
      // Compare dirty signatures
      // Merge and push
    } finally {
      this.syncMutex.unlock();
    }
  }
}
```

### 4.2 Что НЕ переносится

| Компонент | Причина | Альтернатива |
|-----------|--------|--------------|
| BroadcastChannel | Не существует в RN | Не нужен (single device) |
| `window.Telegram.WebApp` | Telegram WebView only | Device ID based |
| Cross-tab sync | Не актуально | Single device |

### 4.3 Conflict Resolution

Сохранить текущую стратегию conflict resolution:
- Preferences: remote wins
- Collections: merge
- Check-ins: last-write-wins

---

## Фаза 5: Premium Status Migration (1-2 недели)

### 5.1 Adapty Premium → Supabase

Когда пользователь покупает через Adapty:

```typescript
// apps/android/src/services/adapty-service.ts
async purchasePremium(plan: 'monthly' | 'annual' | 'lifetime'): Promise<boolean> {
  const paywall = await this.getPaywall(plan);
  const product = paywall.products[0];
  
  const result = await Adapty.makePurchase(product);
  
  if (result.success) {
    // Sync to Supabase
    await supabase.functions.invoke('adapty-purchase-webhook', {
      body: {
        deviceId: await getDeviceId(),
        plan,
        purchaseId: result.purchaseId,
      },
    });
    
    // Update local state
    premiumStore.set({ hasPremium: true, plan, purchasedAt: new Date() });
  }
  
  return result.success;
}
```

### 5.2 Edge Function для Adapty Webhook

```typescript
// supabase/functions/adapty-purchase-webhook/index.ts
// Обрабатывает покупки из Adapty SDK (не из Telegram Stars)
// Обновляет premium_subscriptions таблицу
// device_id вместо telegram_user_id
```

**Важно:** Нужна новая миграция БД для device_id based users.

### 5.3 Database Migration

```sql
-- Добавить device_id в users таблицу
ALTER TABLE users ADD COLUMN device_id TEXT UNIQUE;

-- Новая таблица для device-based users
CREATE TABLE device_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  telegram_user_id BIGINT REFERENCES users(telegram_user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- Миграция существующих данных
INSERT INTO device_users (device_id, telegram_user_id)
SELECT DISTINCT telegram_user_id::TEXT, telegram_user_id
FROM users
WHERE telegram_user_id IS NOT NULL;
```

---

## Фаза 6: Content & UI Porting (3-4 недели)

### 6.1 Content Loading

Контент уже в JSON файлах — просто перенести и загружать.

```typescript
// apps/android/src/utils/content-loader.ts
import { storage } from '../stores/storage';
import { getDeviceLanguage } from '../services/device-language';

export async function loadContent(language: 'ru' | 'en') {
  // Content может кэшироваться в MMKV для offline
  const cacheKey = `content-${language}`;
  const cached = storage.getString(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from Supabase Storage или встроить в bundle
  const response = await fetch(`/content/${language}/home.json`);
  const content = await response.json();
  
  storage.set(cacheKey, JSON.stringify(content));
  return content;
}
```

### 6.2 Screens Porting Priority

| Screens | Priority | Complexity |
|---------|----------|------------|
| HomeScreen | P1 | Medium |
| PaymentsScreen | P1 | Medium |
| CheckinScreen | P1 | Low |
| ProfileScreen | P1 | Medium |
| ThemeWelcomeScreen | P2 | High |
| ThemeHomeScreen | P2 | High |
| CardQuestionScreen | P2 | High |
| SurveyFlow (6 screens) | P2 | Medium |
| PsychTestFlow (30+ screens) | P3 | High |
| ArticleScreens | P3 | Low |

### 6.3 UI Components

Основные примитивы (Button, Dialog, etc.) уже на Radix — нужно адаптировать:

**Вариант A:** Использовать React Native Paper (Material Design) — проще, но другой look
**Вариант B:** Создать нативные primitive components — дорого, но максимальный control
**Вариант C:** Использовать `@radix-ui/react-native` — не существует официально

**Рекомендация:** Начать с React Native Paper, кастомизировать под бренд. Это fastest path.

### 6.4 Animations

Framer Motion → `react-native-reanimated`:

```typescript
// Было (Framer Motion)
<motion.div animate={{ x: 0 }} initial={{ x: 100 }} />

// Станет (Reanimated)
import { Animated, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: withSpring(0) }],
}));

// Usage
<Animated.View style={animatedStyle} />
```

**Примечание:** Полная миграция Framer Motion → Reanimated трудоёмка. Можно оставить базовые анимации, сложные — переписать.

---

## Фаза 7: Testing & Polishing (2-3 недели)

### 7.1 Unit Tests

Доменные файлы уже тестируемы — добавить тесты для новых RN-specific services:

```typescript
// tests/unit/adapty-service.test.ts
// tests/unit/device-id.test.ts
// tests/unit/storage.test.ts
```

### 7.2 E2E Tests

Playwright → Detox или Appium:

```typescript
// tests/e2e/android/premium-purchase.spec.ts
describe('Premium Purchase Flow', () => {
  it('should purchase premium via Adapty', async () => {
    // Open app
    // Navigate to payments
    // Tap purchase button
    // Verify Adapty paywall opens
    // Complete purchase
    // Verify premium status updated
  });
});
```

### 7.3 Beta Testing

- Google Play Internal Testing (100 тестировщиков)
- Фидбек loop для критичных багов

---

## Фаза 8: Publication Guidelines (Ongoing)

### 8.1 Documentation Structure

```
docs/
├── DEVELOPMENT_with_ai.md          # Существующий (обновить)
├── RN_DEVELOPMENT_GUIDELINES.md    # Новый гайд для RN
├── ADAPTY_INTEGRATION.md            # Платежи Adapty
├── DEVICE_AUTH_FLOW.md             # Device ID auth
├── STORE_SUBMISSION.md              # Google Play publication
└── SHARED_CODE_GUIDELINES.md        # Как использовать packages/shared
```

### 8.2 RN Development Guidelines

```markdown
# React Native Development Guidelines

## Project Structure

apps/
├── android/           # Android app (Expo)
├── ios/               # iOS app (Expo)  
└── web/               # Existing Telegram Mini App

packages/
└── shared/            # Shared code (domain, services, stores, utils)

## Adding New Screens

1. Create screen in `apps/android/src/screens/`
2. Add route in navigation bridge
3. Use shared stores for state
4. Test on both Android and iOS

## State Management

- Use Nanostores for global state (from shared)
- Use React useState for local component state
- Use MMKV for persistence (from shared/utils)

## Testing

- Unit: Vitest for shared code
- E2E: Playwright for web, Detox for mobile
```

### 8.3 AI-Assisted Coding Instructions

```markdown
# AI Coding Instructions for Menhausen RN

## Allowed Patterns

1. Creating new screen:
   - Create in apps/android/src/screens/
   - Import from @menhausen/shared/*
   - Use existing UI components

2. Adding new domain logic:
   - Create in packages/shared/domain/
   - NO store imports
   - NO platform-specific code

3. Modifying sync logic:
   - Edit in packages/shared/utils/
   - Test offline scenarios

## Forbidden Patterns

1. DON'T import from src/ (only from packages/shared)
2. DON'T use window.Telegram.WebApp in RN code
3. DON'T use localStorage directly (use MMKV adapter)
4. DON'T use BroadcastChannel

## Migration Checklist

Before any PR:
- [ ] Code compiles for both Android and iOS
- [ ] No platform-specific imports without fallback
- [ ] Unit tests pass for domain code
- [ ] E2E tests pass for changed flows
- [ ] No new dependencies without approval
```

---

## Резюме Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 0: Repo Setup | 1-2 weeks | Monorepo structure |
| Phase 1: Code Split | 1-2 weeks | packages/shared |
| Phase 2: Android App | 2-3 weeks | Working Android app |
| Phase 3: iOS App | 1-2 weeks | Working iOS app |
| Phase 4: Sync Porting | 2-3 weeks | Supabase sync works |
| Phase 5: Premium Migration | 1-2 weeks | Adapty billing works |
| Phase 6: Content UI | 3-4 weeks | All screens ported |
| Phase 7: Testing | 2-3 weeks | Beta ready |
| Phase 8: Docs | Ongoing | Guidelines maintained |

**Total: ~14-21 недель** (при part-time работе 2 человек)

---

## Verification Criteria

Каждая фаза имеет measurable outcomes:

### Phase 1 Complete When:
- [ ] `npm run build` in packages/shared passes
- [ ] TypeScript compilation clean
- [ ] All domain files have 0 store imports
- [ ] Tests pass

### Phase 2 Complete When:
- [ ] Android app launches in emulator
- [ ] MMKV stores data correctly
- [ ] Adapty SDK initializes
- [ ] Basic navigation works

### Phase 4 Complete When:
- [ ] User data syncs to Supabase
- [ ] Offline mode works (read cached data, queue writes)
- [ ] No data loss on network reconnect

### Phase 5 Complete When:
- [ ] Purchase flow completes end-to-end
- [ ] Premium status reflected in Supabase
- [ ] Restore purchases works

### Phase 7 Complete When:
- [ ] Beta builds available in Google Play
- [ ] Critical flows tested (check-in, purchase, content)
- [ ] No crashes on startup

---

## Приложение A: Auth Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  NEW USER (No Auth)                                            │
│  ┌─────────────────┐                                           │
│  │ Open App        │                                           │
│  │ (Google Play)   │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Generate        │                                           │
│  │ Device ID       │                                           │
│  │ (SecureStore)   │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Create user     │                                           │
│  │ in Supabase     │                                           │
│  │ (device_id)     │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ User can use    │                                           │
│  │ app offline     │                                           │
│  └─────────────────┘                                           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  OPTIONAL: LINK TELEGRAM                                       │
│  ┌─────────────────┐                                           │
│  │ User taps      │                                           │
│  │ "Link Telegram"│                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Open Telegram  │                                           │
│  │ Bot for auth   │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Bot returns     │                                           │
│  │ link code       │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ App sends      │                                           │
│  │ code to        │                                           │
│  │ Supabase       │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Link device_id  │                                           │
│  │ with            │                                           │
│  │ telegram_user_id│                                           │
│  └─────────────────┘                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Приложение B: Data Sync Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA SYNC FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LOCAL (MMKV)                          REMOTE (Supabase)       │
│  ┌─────────────────┐                   ┌─────────────────┐       │
│  │ Dirty signatures│◄─────────────────│ Remote signatures│      │
│  │ (per data type) │                   │ (per data type)  │       │
│  └────────┬────────┘                   └────────┬────────┘       │
│           │                                      │              │
│           │  ┌──────────────────────────────────┼──────────┐     │
│           │  │                                  │          │     │
│           ▼  ▼                                  ▼          ▼     │
│  ┌─────────────────┐                   ┌─────────────────┐         │
│  │ Compare         │                   │ Compare        │         │
│  │ signatures      │                   │ signatures     │         │
│  └────────┬────────┘                   └────────┬────────┘         │
│           │                                      │              │
│     ┌────┴────┐                           ┌────┴────┐           │
│     │         │                           │         │           │
│     ▼         ▼                           ▼         ▼           │
│  ┌──────┐  ┌──────┐                    ┌──────┐  ┌──────┐        │
│  │Local │  │Remote│                    │Local │  │Remote│        │
│  │newer │  │newer │                    │newer │  │newer │        │
│  └──┬───┘  └──┬───┘                    └──┬───┘  └──┬───┘        │
│     │        │                           │        │            │
│     ▼        ▼                           ▼        ▼            │
│  ┌─────────────────┐                   ┌─────────────────┐       │
│  │ Push to remote │                   │ Pull to local  │       │
│  └────────┬────────┘                   └────────┬────────┘       │
│          │                                      │              │
│          └──────────────┬───────────────────────┘              │
│                         │                                      │
│                         ▼                                      │
│                  ┌─────────────────┐                           │
│                  │ Conflict        │                           │
│                  │ Resolution      │                           │
│                  │ Strategy        │                           │
│                  └─────────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Приложение C: Premium Purchase Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  PREMIUM PURCHASE FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                                           │
│  │ User taps       │                                           │
│  │ "Buy Premium"  │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Adapty SDK      │                                           │
│  │ fetches        │                                           │
│  │ paywall        │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Show Google     │                                           │
│  │ Play billing   │                                           │
│  │ dialog         │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ User completes │                                           │
│  │ purchase       │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Adapty SDK      │                                           │
│  │ returns        │                                           │
│  │ result          │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Sync to        │                                           │
│  │ Supabase       │                                           │
│  │ (Edge Function)│                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Update local   │                                           │
│  │ premium state  │                                           │
│  │ (MMKV)         │                                           │
│  └─────────────────┘                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

*Document generated: April 2026*
*Last updated: April 2026*
*Version: 1.0*