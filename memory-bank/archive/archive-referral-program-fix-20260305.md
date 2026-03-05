# Task Archive: Referral Program Fix (Supabase + Telegram)

## Metadata
- **Task**: Fix referral program so that invited users are correctly linked to referrers in Supabase
- **Complexity**: Level 3 (Intermediate Feature)
- **Date Archived**: 2026-03-05
- **Status**: ✅ Complete – Implemented, tested, deployed
- **Related Plan**: `.cursor/plans/fix_referral_program_92d38841.plan.md`

---

## Summary

The referral system previously работала только на клиенте: связь «кто кого пригласил» жила в `localStorage` устройства приглашённого пользователя и **не доходила** до таблицы `referral_data` в Supabase. В результате:

- у нового пользователя в Supabase не было надёжной отметки `referred_by`;
- у реферера в Supabase поле `referral_list` оставалось пустым, даже если он реально приглашал друзей;
- при смене устройства или кэша локальные данные терялись.

Сейчас логика исправлена:

- при регистрации нового пользователя по реферальной ссылке связь «реферер → реферал» **записывается на сервере** в таблицу `referral_data` для обоих пользователей;
- данные корректно синхронизируются между Supabase и `localStorage`;
- для аналитики в PostHog отправляется отдельное событие `referral_registered`.

---

## Problem Analysis

### Архитектурные дыры (как было)

1. **Server-side линковки не было**  
   - Edge‑функция `sync-user-data` просто апсёртила `referral_data` текущего пользователя:
     - `referred_by`, `referral_code`, `referral_registered`, `referral_list`.
   - Никакого обновления `referral_list` у **реферера** не происходило.

2. **Неправильный источник referral list при синке**
   - Клиентский код в `SupabaseSyncService.getAllLocalStorageData()` брал реферальный список через:
     - `getReferralList(telegramUserId)` – т.е. список для **текущего** пользователя.
   - Но при регистрации реферала `addReferralToList(referrerId, currentUserId)` сохранял данные под ключом `menhausen_referral_list_{referrerId}`.
   - В итоге, список рефералов реферера хранился на устройстве реферала (и на сервере не использовался), а на устройстве реферала B при синке смотрели не туда.

3. **localStorage interceptor не ловил изменения referral list**
   - `LocalStorageInterceptor.isReferralListKey` смотрел на префикс `referral_list_`, тогда как реальные ключи имели вид `menhausen_referral_list_…`.
   - Из‑за этого изменения списка рефералов **не триггерили incremental sync** по `referralData`.

4. **Referrals не восстанавливались из Supabase**
   - В `transformReferralDataFromAPI` был только комментарий про сложность `referralList`, без реализации.
   - Даже если `referral_list` приходил с сервера, он не возвращался в `localStorage`, и UI/достижения не видели серверное состояние.

---

## Final Architecture

### Поток данных при регистрации реферала

1. Пользователь **A** генерирует реферальную ссылку:
   - `https://t.me/menhausen_app_bot/app?startapp=REF_<telegram_user_id_A>`.
2. Пользователь **B** открывает ссылку:
   - `App.tsx` на `useEffect` вызывает `processReferralCode()`, который:
     - читает `start_param` из Telegram WebApp / URL;
     - парсит реферальный код (`REF_<id>` → `referrerId`);
     - для нового пользователя сохраняет `menhausen_referred_by` и `menhausen_referral_code` в `localStorage`.
3. B проходит онбординг до `survey06`, в `handleSurvey06Next`:
   - сохраняются результаты опроса;
   - отмечается `surveyCompleted` в flow;
   - если есть `referrerId` и `currentUserId`:
     - вызывается `addReferralToList(referrerId, currentUserId)` (локальный список на устройстве реферера);
     - вызывается `markReferralAsRegistered()` → `menhausen_referral_registered = 'true'`;
     - отправляется событие `referral_registered` в PostHog (см. ниже).
4. При initial sync / дальнейших синках клиент собирает данные через `getAllLocalStorageData()` и вызывает Edge‑функцию `sync-user-data`.
5. На сервере `syncReferralData`:
   - апсёртит `referral_data` для текущего пользователя (B);
   - используя service‑role клиент, обновляет `referral_list` для реферера (A), если B там ещё нет.

Таким образом, серверная таблица `referral_data` становится **источником истины**, а `localStorage` – кэшем.

---

## Implementation Details

### 1. Server-side: `sync-user-data` / `syncReferralData`

**Файл**: `supabase/functions/sync-user-data/index.ts`

- Базовый апсёрт для текущего пользователя сохранён:

```306:323:supabase/functions/sync-user-data/index.ts
async function syncReferralData(supabase: any, telegramUserId: number, data: any): Promise<void> {
  if (!data || typeof data !== 'object') return;

  await supabase
    .from('referral_data')
    .upsert({
      telegram_user_id: telegramUserId,
      referred_by: data.referredBy || null,
      referral_code: data.referralCode || null,
      referral_registered: data.referralRegistered || false,
      referral_list: data.referralList || [],
    }, {
      onConflict: 'telegram_user_id',
    });
  // ... далее — логика обновления реферера
}
```

- Добавлена серверная логика обновления `referral_list` реферера:
  - Проверка `data.referredBy` и `data.referralRegistered === true`.
  - Защита от самореферала и невалидных ID.
  - Создание `adminClient` с `SUPABASE_SERVICE_ROLE_KEY`.
  - Загрузка существующего `referral_list` реферера, нормализация к строкам, защита от дублей.
  - Апсёрт обновлённого списка (массив ID рефералов).

### 2. Клиент: сбор и восстановление referral data

#### `getAllLocalStorageData` (сбор данных для sync)

**Файл**: `utils/supabaseSync/supabaseSyncService.ts`

- Сбор referral‑данных:

```576:593:utils/supabaseSync/supabaseSyncService.ts
// Referral data
try {
  const telegramUserId = getTelegramUserId();
  if (telegramUserId) {
    const referralData: any = {
      referredBy: getReferrerId(),
      referralRegistered: isReferralRegistered(),
      referralList: [],
    };
    // Try to get referral list if exists
    try {
      const referralList = getReferralList(telegramUserId);
      referralData.referralList = referralList.referrals.map(r => r.userId);
    } catch {
      // Ignore if referral list doesn't exist
    }
    data.referralData = transformToAPIFormat('referralData', referralData);
  }
} catch (e) {
  console.warn('Error loading referral data:', e);
}
```

#### `transformReferralData` / `transformReferralDataFromAPI`

**Файл**: `utils/supabaseSync/dataTransformers.ts`

- `transformReferralData` теперь:
  - поддерживает новый формат `{ referredBy, referralRegistered, referralList: string[] }`;
  - дополнительно сканирует legacy‑ключи `referral_list_*` и `menhausen_referral_list_*` с полными объектами `ReferralStorage`.
- `transformReferralDataFromAPI`:
  - по‑прежнему возвращает `menhausen_referred_by`, `menhausen_referral_code`, `menhausen_referral_registered`;
  - дополнительно возвращает `referralList` как массив ID, чтобы `mergeAndSave` мог восстановить локальный список.

#### `mergeAndSave` (восстановление referral list в localStorage)

**Файл**: `utils/supabaseSync/supabaseSyncService.ts`

- После мерджа:

```928:940:utils/supabaseSync/supabaseSyncService.ts
if (remoteData.referralData) {
  const merged = resolveConflict('referralData', localData.referralData, remoteData.referralData);
  const localFormat = transformFromAPIFormat('referralData', merged);
  if (localFormat.menhausen_referred_by) {
    localStorage.setItem('menhausen_referred_by', localFormat.menhausen_referred_by);
  }
  if (localFormat.menhausen_referral_code) {
    localStorage.setItem('menhausen_referral_code', localFormat.menhausen_referral_code);
  }
  if (localFormat.menhausen_referral_registered !== undefined) {
    localStorage.setItem('menhausen_referral_registered', localFormat.menhausen_referral_registered);
  }

  // Restore referral list for the current user (referrer) from Supabase
  if (Array.isArray(localFormat.referralList) && localFormat.referralList.length > 0) {
    // ... строим menhausen_referral_list_<telegramUserId> с ReferralStorage
  }
}
```

### 3. localStorage Interceptor: правильный префикс

**Файл**: `utils/supabaseSync/localStorageInterceptor.ts`

- Исправлен префикс для ключей списка рефералов:

```43:48:utils/supabaseSync/localStorageInterceptor.ts
function isReferralListKey(key: string): boolean {
  return key.startsWith('menhausen_referral_list_');
}
```

Это позволяет interceptor’у правильно мапить изменения на `syncType = 'referralData'` и триггерить incremental sync.

### 4. Analytics: PostHog событие `referral_registered`

**Файлы**:
- `utils/analytics/posthog.ts`
- `App.tsx` (`handleSurvey06Next`)

- Добавлен новый тип события:

```202:208:utils/analytics/posthog.ts
export const AnalyticsEvent = {
  CARD_RATED: 'card_rated',
  ONBOARDING_ANSWERED: 'onboarding_answered',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  FIRST_SCREEN_LOADED: 'first_screen_loaded',
  REFERRAL_REGISTERED: 'referral_registered',
} as const
```

- При регистрации реферала (после успешного онбординга) отправляется событие:

```1625:1636:App.tsx
const referrerId = getReferrerId();
const currentUserId = getTelegramUserId();

if (referrerId && currentUserId) {
  // ...
  addReferralToList(referrerId, currentUserId);
  markReferralAsRegistered();

  capture(AnalyticsEvent.REFERRAL_REGISTERED, {
    referrer_id: String(referrerId),
    referred_user_id: String(currentUserId),
    language: currentLanguage,
    referral_source: 'telegram_referral',
  });
}
```

Это позволяет в PostHog строить отчёты по количеству успешных реферальных регистраций, анализировать конверсию по реферерам и связать рефералов с последующими действиями (например, покупкой премиума).

---

## Testing & QA

### Автотесты

- **Unit (Vitest)**:
  - `tests/unit/referralUtils.test.ts` – 34 теста, все проходят:
    - обработка и валидация реферального кода;
    - защита от самореферала;
    - корректное добавление/обновление локального списка рефералов;
    - обновление статистики реферера на основе списка.

- **E2E (Playwright)**:
  - `tests/e2e/referral-system.spec.ts` – тесты проходят:
    - сохранение referral‑метаданных в `localStorage`;
    - обновление структуры списка рефералов;
    - корректная сборка реферальной ссылки.

- **Full QA (`/qa run all checks and tests`)**:
  - `npm run lint:all` – без ошибок.
  - `npm run type-check` – без ошибок TypeScript.
  - `npm run test:all` – unit + E2E проходят, включая реферальные сценарии.

### Ручная проверка (рекомендованный сценарий)

1. Пользователь A генерирует ссылку в профиле.
2. Пользователь B открывает ссылку, проходит онбординг до конца `survey06`.
3. В Supabase:
   - в `referral_data` для B: `referred_by = <ID A>`, `referral_registered = true`;
   - в `referral_data` для A: `referral_list` содержит `<ID B>`.
4. В PostHog:
   - появляется событие `referral_registered` с `referrer_id = <ID A>` и `referred_user_id = <ID B>`.

---

## Deployment

- Edge‑функции задеплоены в прод‑проект Supabase `ciwclljuxgbyqwqxmhxg`:
  - `get-user-data` (с `--no-verify-jwt`, валидация через Telegram initData);
  - `sync-user-data` (также с `--no-verify-jwt`).
- Конфигурация `verify_jwt = false` для этих функций задокументирована в `memory-bank/deployment-edge-functions-fix.md`.

---

## Outcome

- **Реферальная связь теперь надёжно хранится на сервере**:
  - при регистрации нового пользователя по реф‑ссылке:
    - у него в `referral_data` фиксируется `referred_by` и `referral_registered`;
    - у реферера в `referral_data.referral_list` добавляется ID этого пользователя.
- **Синхронизация между устройствами и Supabase стала корректной**:
  - локальные списки рефералов отражают серверное состояние после initial sync;
  - incremental sync корректно отслеживает изменения referral list.
- **Аналитика получила качественный сигнал**:
  - PostHog‑событие `referral_registered` позволяет строить воронку и считать эффективность реферальной программы.***
