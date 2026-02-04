# Оптимизация загрузки данных: один универсальный запрос

## Проблема

При загрузке приложения, когда в localStorage нет данных, интерфейс загружается раньше, чем получаются все необходимые данные о пользователе, его подписке и прогрессе. Это приводит к:

1. **Множественным запросам**: Сейчас используется несколько запросов:
   - `fastSyncCriticalData()` делает 4 параллельных REST запроса
   - `get-user-data` Edge Function делает множество последовательных запросов к разным таблицам
   - Дополнительные запросы для premium статуса и подписи

2. **Изменение состояния UI**: После загрузки данных происходит изменение экрана и языка, что создает плохой UX

3. **Задержка**: Общее время загрузки ~2-3 секунды, в течение которых пользователь видит неполный интерфейс

## Текущая архитектура загрузки данных

### Текущий поток:

```
1. Проверка localStorage
   ↓ (если пусто)
2. fastSyncCriticalData() - 4 параллельных REST запроса:
   - app_flow_progress
   - psychological_test_results (только last_completed_at)
   - daily_checkins (только сегодняшний)
   - user_preferences
   ↓
3. initialSync() → get-user-data Edge Function:
   - survey_results
   - daily_checkins (все)
   - user_stats
   - user_achievements
   - user_points + points_transactions
   - user_preferences
   - app_flow_progress
   - psychological_test_results
   - card_progress
   - referral_data
   + getPremiumStatus()
   + signPremiumStatus()
   ↓
4. Синхронизация и изменение состояния UI
```

### Таблицы в Supabase:

1. `users` - основная таблица пользователей
2. `survey_results` - результаты опроса
3. `daily_checkins` - ежедневные чекины
4. `user_stats` - статистика пользователя
5. `user_achievements` - достижения
6. `user_points` - баланс очков
7. `points_transactions` - транзакции очков
8. `user_preferences` - настройки пользователя
9. `app_flow_progress` - прогресс по онбордингу
10. `psychological_test_results` - результаты психологического теста
11. `card_progress` - прогресс по карточкам
12. `referral_data` - реферальные данные
13. `premium_subscriptions` - подписки (для premium статуса)

---

## Варианты оптимизации

### Вариант 1: PostgreSQL View (Представление) + один запрос

**Идея**: Создать материализованное представление или обычное представление, которое объединяет все данные пользователя через JOIN.

**Преимущества**:
- Один SQL запрос вместо множества
- Оптимизация на уровне БД
- Можно использовать индексы для ускорения
- Простота использования на клиенте

**Недостатки**:
- Сложность поддержки при изменении схемы
- Может быть медленнее для пользователей с большим количеством данных (checkins, transactions)
- Нужно обрабатывать NULL значения для новых пользователей

**Реализация**:
```sql
CREATE OR REPLACE VIEW user_data_complete AS
SELECT 
  u.telegram_user_id,
  u.created_at,
  u.last_sync_at,
  -- Survey results
  sr.screen01, sr.screen02, sr.screen03, sr.screen04, sr.screen05, sr.completed_at as survey_completed_at,
  -- Flow progress
  afp.onboarding_completed, afp.survey_completed, afp.psychological_test_completed,
  afp.pin_enabled, afp.pin_completed, afp.first_checkin_done, afp.first_reward_shown,
  -- Preferences
  up.language, up.theme, up.notifications, up.analytics,
  -- User stats
  us.checkins, us.checkin_streak, us.last_checkin_date, us.cards_opened, 
  us.topics_completed, us.articles_read, us.read_article_ids, us.opened_card_ids,
  -- Achievements
  ua.achievements, ua.total_xp, ua.unlocked_count,
  -- Points
  upoints.balance as points_balance,
  -- Psychological test
  ptr.last_completed_at as test_last_completed_at, ptr.scores as test_scores, 
  ptr.percentages as test_percentages, ptr.history as test_history,
  -- Referral
  rd.referred_by, rd.referral_code, rd.referral_registered, rd.referral_list
FROM users u
LEFT JOIN survey_results sr ON u.telegram_user_id = sr.telegram_user_id
LEFT JOIN app_flow_progress afp ON u.telegram_user_id = afp.telegram_user_id
LEFT JOIN user_preferences up ON u.telegram_user_id = up.telegram_user_id
LEFT JOIN user_stats us ON u.telegram_user_id = us.telegram_user_id
LEFT JOIN user_achievements ua ON u.telegram_user_id = ua.telegram_user_id
LEFT JOIN user_points upoints ON u.telegram_user_id = upoints.telegram_user_id
LEFT JOIN psychological_test_results ptr ON u.telegram_user_id = ptr.telegram_user_id
LEFT JOIN referral_data rd ON u.telegram_user_id = rd.telegram_user_id;
```

**Проблема**: Не включает массивы данных (daily_checkins, points_transactions, card_progress) - их нужно загружать отдельно или использовать JSON агрегацию.

---

### Вариант 2: PostgreSQL Function с JSON агрегацией ✅ ВЫБРАНО

**Идея**: Создать функцию, которая возвращает все данные пользователя в виде одного JSON объекта, используя JSON агрегацию для массивов.

**Преимущества**:
- Один запрос возвращает все данные
- Поддержка массивов через JSON агрегацию
- Можно оптимизировать запросы внутри функции
- Гибкость в форматировании данных

**Недостатки**:
- Сложнее поддерживать при изменении схемы
- JSON агрегация может быть медленной для больших объемов данных
- Нужно правильно обрабатывать NULL значения

**Реализация**:
```sql
CREATE OR REPLACE FUNCTION get_user_complete_data(p_telegram_user_id BIGINT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    -- Basic user info
    'telegramUserId', u.telegram_user_id,
    'createdAt', u.created_at,
    'lastSyncAt', u.last_sync_at,
    
    -- Survey results
    'surveyResults', (
      SELECT json_build_object(
        'screen01', sr.screen01,
        'screen02', sr.screen02,
        'screen03', sr.screen03,
        'screen04', sr.screen04,
        'screen05', sr.screen05,
        'completedAt', sr.completed_at
      )
      FROM survey_results sr
      WHERE sr.telegram_user_id = p_telegram_user_id
    ),
    
    -- Flow progress
    'flowProgress', (
      SELECT json_build_object(
        'onboardingCompleted', afp.onboarding_completed,
        'surveyCompleted', afp.survey_completed,
        'psychologicalTestCompleted', afp.psychological_test_completed,
        'pinEnabled', afp.pin_enabled,
        'pinCompleted', afp.pin_completed,
        'firstCheckinDone', afp.first_checkin_done,
        'firstRewardShown', afp.first_reward_shown
      )
      FROM app_flow_progress afp
      WHERE afp.telegram_user_id = p_telegram_user_id
    ),
    
    -- Preferences
    'preferences', (
      SELECT json_build_object(
        'language', up.language,
        'theme', up.theme,
        'notifications', up.notifications,
        'analytics', up.analytics
      )
      FROM user_preferences up
      WHERE up.telegram_user_id = p_telegram_user_id
    ),
    
    -- Daily checkins (as object with date_key as key)
    'dailyCheckins', COALESCE(
      (SELECT json_object_agg(
        dc.date_key,
        json_build_object(
          'mood', dc.mood,
          'value', dc.value,
          'color', dc.color,
          'completed', dc.completed
        )
      )
      FROM daily_checkins dc
      WHERE dc.telegram_user_id = p_telegram_user_id),
      '{}'::json
    ),
    
    -- User stats
    'userStats', (
      SELECT json_build_object(
        'version', us.version,
        'checkins', us.checkins,
        'checkinStreak', us.checkin_streak,
        'lastCheckinDate', us.last_checkin_date,
        'cardsOpened', us.cards_opened,
        'topicsCompleted', us.topics_completed,
        'cardsRepeated', us.cards_repeated,
        'topicsRepeated', us.topics_repeated,
        'articlesRead', us.articles_read,
        'readArticleIds', us.read_article_ids,
        'openedCardIds', us.opened_card_ids,
        'referralsInvited', us.referrals_invited,
        'referralsPremium', us.referrals_premium,
        'lastUpdated', us.last_updated
      )
      FROM user_stats us
      WHERE us.telegram_user_id = p_telegram_user_id
    ),
    
    -- Achievements
    'achievements', (
      SELECT json_build_object(
        'version', ua.version,
        'achievements', ua.achievements,
        'totalXP', ua.total_xp,
        'unlockedCount', ua.unlocked_count
      )
      FROM user_achievements ua
      WHERE ua.telegram_user_id = p_telegram_user_id
    ),
    
    -- Points
    'points', (
      SELECT json_build_object(
        'balance', upoints.balance,
        'transactions', COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', pt.transaction_id,
              'type', pt.type,
              'amount', pt.amount,
              'balanceAfter', pt.balance_after,
              'note', pt.note,
              'correlationId', pt.correlation_id,
              'timestamp', pt.timestamp
            ) ORDER BY pt.timestamp ASC
          )
          FROM points_transactions pt
          WHERE pt.telegram_user_id = p_telegram_user_id),
          '[]'::json
        )
      )
      FROM user_points upoints
      WHERE upoints.telegram_user_id = p_telegram_user_id
    ),
    
    -- Psychological test
    'psychologicalTest', (
      SELECT json_build_object(
        'lastCompletedAt', ptr.last_completed_at,
        'scores', ptr.scores,
        'percentages', ptr.percentages,
        'history', ptr.history
      )
      FROM psychological_test_results ptr
      WHERE ptr.telegram_user_id = p_telegram_user_id
    ),
    
    -- Card progress
    'cardProgress', COALESCE(
      (SELECT json_object_agg(
        cp.card_id,
        json_build_object(
          'cardId', cp.card_id,
          'completedAttempts', cp.completed_attempts,
          'isCompleted', cp.is_completed,
          'totalCompletedAttempts', cp.total_completed_attempts
        )
      )
      FROM card_progress cp
      WHERE cp.telegram_user_id = p_telegram_user_id),
      '{}'::json
    ),
    
    -- Referral data
    'referralData', (
      SELECT json_build_object(
        'referredBy', rd.referred_by,
        'referralCode', rd.referral_code,
        'referralRegistered', rd.referral_registered,
        'referralList', rd.referral_list
      )
      FROM referral_data rd
      WHERE rd.telegram_user_id = p_telegram_user_id
    )
  ) INTO result
  FROM users u
  WHERE u.telegram_user_id = p_telegram_user_id;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql STABLE;
```

**Использование в Edge Function**:
```typescript
const { data, error } = await supabase.rpc('get_user_complete_data', {
  p_telegram_user_id: telegramUserId
});
```

---

### Вариант 3: Оптимизированная Edge Function с параллельными запросами

**Идея**: Оставить Edge Function, но оптимизировать её, используя параллельные запросы и кэширование.

**Преимущества**:
- Не требует изменений в БД
- Легко поддерживать
- Можно добавить кэширование на уровне Edge Function
- Гибкость в обработке ошибок

**Недостатки**:
- Все еще несколько запросов (хотя параллельных)
- Задержка на сеть между Edge Function и БД
- Нет оптимизации на уровне БД

**Реализация**:
```typescript
async function fetchAllUserDataOptimized(supabase: any, telegramUserId: number): Promise<any> {
  // Группируем запросы по зависимостям и выполняем параллельно
  const [
    surveyResults,
    flowProgress,
    preferences,
    userStats,
    achievements,
    userPoints,
    psychologicalTest,
    referralData
  ] = await Promise.all([
    supabase.from('survey_results').select('*').eq('telegram_user_id', telegramUserId).maybeSingle(),
    supabase.from('app_flow_progress').select('*').eq('telegram_user_id', telegramUserId).maybeSingle(),
    supabase.from('user_preferences').select('*').eq('telegram_user_id', telegramUserId).maybeSingle(),
    supabase.from('user_stats').select('*').eq('telegram_user_id', telegramUserId).maybeSingle(),
    supabase.from('user_achievements').select('*').eq('telegram_user_id', telegramUserId).maybeSingle(),
    supabase.from('user_points').select('balance').eq('telegram_user_id', telegramUserId).maybeSingle(),
    supabase.from('psychological_test_results').select('*').eq('telegram_user_id', telegramUserId).maybeSingle(),
    supabase.from('referral_data').select('*').eq('telegram_user_id', telegramUserId).maybeSingle(),
  ]);

  // Загружаем массивы данных параллельно
  const [checkins, transactions, cardProgress] = await Promise.all([
    supabase.from('daily_checkins').select('*').eq('telegram_user_id', telegramUserId).order('date_key', { ascending: false }),
    supabase.from('points_transactions').select('*').eq('telegram_user_id', telegramUserId).order('timestamp', { ascending: true }),
    supabase.from('card_progress').select('*').eq('telegram_user_id', telegramUserId),
  ]);

  // Формируем результат...
}
```

---

### Вариант 4: Комбинированный подход - критичные данные через функцию, остальное параллельно

**Идея**: Для критичных данных (flowProgress, preferences, psychologicalTest) использовать PostgreSQL функцию для быстрой загрузки, остальные данные загружать параллельно.

**Преимущества**:
- Быстрая загрузка критичных данных
- Оптимизация для самого важного
- Гибкость для остальных данных

**Недостатки**:
- Два типа запросов (функция + обычные)
- Более сложная логика

**Реализация**:
```sql
-- Функция для критичных данных
CREATE OR REPLACE FUNCTION get_user_critical_data(p_telegram_user_id BIGINT)
RETURNS JSON AS $$
SELECT json_build_object(
  'flowProgress', (
    SELECT json_build_object(...) FROM app_flow_progress WHERE telegram_user_id = p_telegram_user_id
  ),
  'preferences', (
    SELECT json_build_object(...) FROM user_preferences WHERE telegram_user_id = p_telegram_user_id
  ),
  'psychologicalTest', (
    SELECT json_build_object(...) FROM psychological_test_results WHERE telegram_user_id = p_telegram_user_id
  )
);
$$ LANGUAGE sql STABLE;
```

---

### Вариант 5: Materialized View с обновлением через триггеры

**Идея**: Создать материализованное представление, которое обновляется автоматически через триггеры при изменении данных.

**Преимущества**:
- Очень быстрые запросы (данные уже агрегированы)
- Один запрос для получения всех данных
- Оптимизация на уровне БД

**Недостатки**:
- Сложность поддержки триггеров
- Дополнительное место в БД
- Нужно обновлять при каждом изменении данных
- Может быть избыточно для небольших объемов данных

---

## Рекомендация: Вариант 2 (PostgreSQL Function с JSON агрегацией) ✅

### Почему этот вариант:

1. **Один запрос**: Все данные загружаются одним запросом
2. **Оптимизация на уровне БД**: PostgreSQL может оптимизировать запрос
3. **Поддержка массивов**: JSON агрегация позволяет включить все данные
4. **Гибкость**: Можно легко изменить структуру ответа
5. **Производительность**: Для большинства пользователей будет быстрее, чем множественные запросы

### Дополнительные оптимизации:

1. **Индексы**: Убедиться, что все внешние ключи индексированы
2. **Кэширование**: Добавить кэширование на уровне Edge Function (Redis или in-memory)
3. **Ленивая загрузка**: Для больших массивов (checkins, transactions) можно загружать только последние N записей
4. **Сжатие ответа**: Использовать gzip для больших JSON ответов

---

## План реализации

### Этап 1: Создание PostgreSQL функции

1. ✅ Создать миграцию с функцией `get_user_complete_data`
   - Файл: `supabase/migrations/YYYYMMDDHHMMSS_add_get_user_complete_data_function.sql`
   - Функция должна возвращать JSON со всеми данными пользователя
   - Добавить обработку NULL значений (COALESCE для массивов)
   - Добавить проверку существования пользователя

2. ✅ Протестировать функцию вручную
   - Вызвать функцию для существующего пользователя
   - Проверить формат ответа
   - Убедиться, что все поля присутствуют

### Этап 2: Обновление Edge Function

3. ✅ Обновить `get-user-data` Edge Function
   - Файл: `supabase/functions/get-user-data/index.ts`
   - Заменить `fetchAllUserData()` на вызов RPC функции
   - Сохранить старую функцию как fallback
   - Добавить логирование времени выполнения

4. ✅ Добавить fallback механизм
   - Если RPC функция не работает или возвращает ошибку
   - Использовать старый метод `fetchAllUserData()`
   - Логировать использование fallback

5. ✅ Сохранить совместимость формата ответа
   - Убедиться, что формат ответа функции совпадает с текущим форматом
   - Преобразовать формат если нужно
   - Протестировать с существующим клиентским кодом

### Этап 3: Обновление клиентского кода

6. ✅ Обновить `fastSyncCriticalData()` в `supabaseSyncService.ts`
   - Заменить 4 REST запроса на один вызов `get-user-data` Edge Function
   - Или использовать RPC напрямую (если есть доступ)
   - Сохранить логику сохранения в localStorage

7. ✅ Обновить обработку ответа в `initialSync()` и `fetchUserData()`
   - Проверить совместимость формата
   - Обновить трансформацию данных если нужно
   - Убедиться, что все данные корректно сохраняются в localStorage

### Этап 4: Оптимизация и тестирование

8. ✅ Добавить логирование производительности
   - Измерять время выполнения функции vs старый метод
   - Логировать размер ответа
   - Отслеживать использование fallback

9. ✅ Протестировать на пользователях с большим объемом данных
   - Пользователь с большим количеством checkins (100+)
   - Пользователь с большим количеством transactions
   - Проверить производительность и размер ответа

10. ✅ Добавить оптимизацию для больших объемов данных (опционально)
    - Ограничить количество checkins (например, последние 90 дней)
    - Использовать пагинацию для transactions
    - Или загружать полные данные только при необходимости

### Этап 5: Мониторинг и улучшения

11. ✅ Мониторинг производительности в продакшене
    - Отслеживать время выполнения запросов
    - Мониторить использование fallback
    - Собирать метрики размера ответов

12. ✅ Оптимизация на основе метрик
    - Если функция медленная - добавить индексы
    - Если ответы большие - добавить ограничения
    - Если fallback используется часто - исправить проблемы

---

## Детальный план задач

### Задача 1: Создать миграцию с PostgreSQL функцией
**Файл**: `supabase/migrations/YYYYMMDDHHMMSS_add_get_user_complete_data_function.sql`

**Что сделать**:
- Создать функцию `get_user_complete_data(p_telegram_user_id BIGINT)`
- Функция должна возвращать JSON со всеми данными пользователя
- Добавить COALESCE для обработки NULL значений в массивах
- Добавить проверку существования пользователя (возвращать {} если пользователя нет)

**Тестирование**:
```sql
-- Проверить функцию
SELECT jsonb_pretty(get_user_complete_data(195202)::jsonb);

-- Проверить на несуществующем пользователе
SELECT get_user_complete_data(999999);
```

---

### Задача 2: Обновить Edge Function get-user-data
**Файл**: `supabase/functions/get-user-data/index.ts`

**Что сделать**:
1. Добавить новую функцию `fetchAllUserDataViaRPC()`:
   ```typescript
   async function fetchAllUserDataViaRPC(supabase: any, telegramUserId: number): Promise<any> {
     const startTime = Date.now();
     try {
       const { data, error } = await supabase.rpc('get_user_complete_data', {
         p_telegram_user_id: telegramUserId
       });
       
       if (error) {
         console.error('[get-user-data] RPC function error:', error);
         throw error;
       }
       
       const duration = Date.now() - startTime;
       console.log(`[get-user-data] RPC function completed in ${duration}ms`);
       
       return data || {};
     } catch (error) {
       console.error('[get-user-data] RPC function failed:', error);
       throw error;
     }
   }
   ```

2. Обновить основной обработчик:
   ```typescript
   // Try RPC function first, fallback to old method
   let userData;
   try {
     userData = await fetchAllUserDataViaRPC(supabase, telegramUserId);
   } catch (error) {
     console.warn('[get-user-data] Falling back to old method');
     userData = await fetchAllUserData(supabase, telegramUserId);
   }
   ```

3. Сохранить старую функцию `fetchAllUserData()` как fallback

**Тестирование**:
- Проверить работу с существующим пользователем
- Проверить fallback при ошибке RPC
- Проверить формат ответа

---

### Задача 3: Обновить fastSyncCriticalData
**Файл**: `utils/supabaseSync/supabaseSyncService.ts`

**Вариант A**: Использовать get-user-data Edge Function
- Заменить 4 REST запроса на один вызов `fetchUserData()`
- Извлечь только критичные данные из ответа
- Сохранить в localStorage

**Вариант B**: Использовать RPC напрямую (если есть доступ)
- Вызвать функцию напрямую через Supabase client
- Извлечь критичные данные
- Сохранить в localStorage

**Рекомендация**: Вариант A (использовать Edge Function) для единообразия

**Что сделать**:
```typescript
public async fastSyncCriticalData(): Promise<{ flowProgress?: any; psychologicalTest?: any; todayCheckin?: any; preferences?: any } | null> {
  // ... existing checks ...
  
  try {
    // Use get-user-data Edge Function instead of multiple REST calls
    const userData = await this.fetchUserData();
    
    if (!userData) {
      return null;
    }
    
    const result: { flowProgress?: any; psychologicalTest?: any; todayCheckin?: any; preferences?: any } = {};
    
    // Extract critical data
    if (userData.flowProgress) {
      result.flowProgress = userData.flowProgress;
      localStorage.setItem('app-flow-progress', JSON.stringify(result.flowProgress));
    }
    
    if (userData.preferences) {
      result.preferences = userData.preferences;
      localStorage.setItem('menhausen_user_preferences', JSON.stringify(result.preferences));
      if (result.preferences.language) {
        localStorage.setItem('menhausen-language', result.preferences.language);
      }
    }
    
    if (userData.psychologicalTest?.lastCompletedAt) {
      result.psychologicalTest = {
        lastCompletedAt: userData.psychologicalTest.lastCompletedAt,
      };
      // Save minimal test data
      const existingTest = localStorage.getItem('psychological-test-results');
      if (!existingTest) {
        localStorage.setItem('psychological-test-results', JSON.stringify({
          lastCompletedAt: result.psychologicalTest.lastCompletedAt,
          scores: {},
          percentages: {},
          history: [],
        }));
      }
    }
    
    // Extract today's checkin
    const todayDateKey = DailyCheckinManager.getCurrentDayKey();
    if (userData.dailyCheckins?.[todayDateKey]) {
      const checkin = userData.dailyCheckins[todayDateKey];
      result.todayCheckin = {
        mood: checkin.mood,
        value: checkin.value,
        color: checkin.color,
        completed: checkin.completed !== undefined ? checkin.completed : true,
      };
      // Save to localStorage
      const storageKey = DailyCheckinManager.getStorageKey(todayDateKey);
      const fullCheckinData = {
        id: `checkin_${todayDateKey}_${Date.now()}`,
        date: todayDateKey,
        timestamp: Date.now(),
        ...result.todayCheckin,
      };
      localStorage.setItem(storageKey, JSON.stringify(fullCheckinData));
    }
    
    return Object.keys(result).length > 0 ? result : null;
  } catch (error) {
    console.warn('[SyncService] Fast critical data sync failed:', error);
    return null;
  }
}
```

---

### Задача 4: Проверка совместимости формата

**Что проверить**:
1. Формат ответа функции совпадает с текущим форматом `UserDataFromAPI`
2. Все поля присутствуют и имеют правильные типы
3. Трансформация данных в `mergeAndSave()` работает корректно

**Поля для проверки**:
- `surveyResults` - объект с screen01-screen05, completedAt
- `dailyCheckins` - объект с date_key как ключ
- `userStats` - объект со статистикой
- `achievements` - объект с achievements, totalXP, unlockedCount
- `points` - объект с balance и transactions массивом
- `preferences` - объект с language, theme, notifications, analytics
- `flowProgress` - объект с булевыми флагами
- `psychologicalTest` - объект с lastCompletedAt, scores, percentages, history
- `cardProgress` - объект с card_id как ключ
- `referralData` - объект с referral данными

---

### Задача 5: Добавить логирование производительности

**Что добавить**:
1. В Edge Function:
   ```typescript
   const rpcStartTime = Date.now();
   const userData = await fetchAllUserDataViaRPC(supabase, telegramUserId);
   const rpcDuration = Date.now() - rpcStartTime;
   console.log(`[get-user-data] RPC function: ${rpcDuration}ms`);
   ```

2. В клиентском коде:
   ```typescript
   const syncStartTime = Date.now();
   const result = await syncService.fastSyncCriticalData();
   const syncDuration = Date.now() - syncStartTime;
   console.log(`[App] Fast sync completed in ${syncDuration}ms`);
   ```

3. Отслеживать использование fallback:
   ```typescript
   if (usingFallback) {
     console.warn('[get-user-data] Using fallback method');
   }
   ```

---

### Задача 6: Тестирование

**Тестовые сценарии**:
1. Новый пользователь (нет данных в БД)
2. Существующий пользователь с минимальными данными
3. Пользователь с большим количеством checkins (100+)
4. Пользователь с большим количеством transactions
5. Пользователь со всеми типами данных заполненными
6. Ошибка RPC функции (проверка fallback)

**Метрики для измерения**:
- Время выполнения запроса
- Размер ответа (bytes)
- Количество запросов к БД
- Использование fallback

---

### Задача 7: Оптимизация для больших объемов данных (опционально)

**Если функция медленная для больших объемов**:

1. Ограничить количество checkins:
   ```sql
   -- В функции добавить LIMIT или фильтр по дате
   WHERE dc.date_key >= CURRENT_DATE - INTERVAL '90 days'
   ```

2. Ограничить количество transactions:
   ```sql
   -- Загружать только последние N транзакций
   ORDER BY pt.timestamp DESC LIMIT 1000
   ```

3. Или добавить параметр для полной загрузки:
   ```sql
   CREATE OR REPLACE FUNCTION get_user_complete_data(
     p_telegram_user_id BIGINT,
     p_limit_checkins INTEGER DEFAULT NULL,
     p_limit_transactions INTEGER DEFAULT NULL
   )
   ```

---

## Ожидаемые результаты

### Производительность:
- **Текущее время**: ~2-3 секунды (множественные запросы)
- **Ожидаемое время**: ~500ms-1s (один запрос)
- **Улучшение**: 2-3x быстрее

### UX:
- Интерфейс загружается сразу с правильными данными
- Нет изменения экрана после загрузки
- Нет изменения языка после загрузки
- Плавный опыт использования

### Надежность:
- Fallback на старый метод при ошибках
- Логирование для отладки
- Мониторинг производительности

---

## Риски и митигация

### Риск 1: Функция медленная для больших объемов данных
**Митигация**: 
- Добавить ограничения на количество данных
- Мониторить производительность
- Использовать fallback если медленно

### Риск 2: Несовместимость формата ответа
**Митигация**:
- Тщательно проверить формат
- Сохранить старую функцию как fallback
- Постепенный rollout

### Риск 3: Ошибки в функции при NULL значениях
**Митигация**:
- Использовать COALESCE везде где нужно
- Тестировать на новых пользователях
- Обрабатывать ошибки в Edge Function

---

## Следующие шаги после реализации

1. Мониторинг производительности в продакшене
2. Сбор метрик использования
3. Оптимизация на основе данных
4. Рассмотреть кэширование если нужно
5. Документирование изменений
