# RLS Testing Guide - Правильное тестирование RLS политик

## Проблема

При использовании `SET request.jwt.claim.*` в SQL запросах RLS политики **не работают**, потому что:

1. **RLS политики используют `auth.jwt()`** - эта функция читает JWT токен из HTTP заголовка запроса, а не из переменных сессии PostgreSQL
2. **Прямое подключение к БД обходит RLS** - если вы подключаетесь через Supabase CLI или напрямую к PostgreSQL, вы используете Service Role Key, который **обходит все RLS политики**

## Правильные способы тестирования RLS

### Способ 1: Использование Supabase Client с JWT токеном (Рекомендуется)

```typescript
import { createClient } from '@supabase/supabase-js';

// Создайте клиент с JWT токеном пользователя
const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key',
  {
    global: {
      headers: {
        Authorization: `Bearer ${jwtToken}` // JWT токен из auth-telegram
      }
    }
  }
);

// Теперь запросы будут применять RLS политики
const { data, error } = await supabase
  .from('daily_checkins')
  .select('*');
// Вернет только данные для telegram_user_id из JWT токена
```

### Способ 2: Использование Edge Functions с JWT токеном

Edge Functions автоматически передают JWT токен в заголовке `Authorization`, и RLS политики работают:

```typescript
// В Edge Function
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  {
    global: {
      headers: {
        Authorization: req.headers.get('Authorization') ?? ''
      }
    }
  }
);

// RLS политики будут применены автоматически
const { data } = await supabase
  .from('daily_checkins')
  .select('*');
```

### Способ 3: Проверка RLS статуса через SQL (без обхода RLS)

```sql
-- Проверьте, что RLS включен на таблице
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'daily_checkins';

-- Проверьте существующие политики
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'daily_checkins';

-- Используйте view для проверки статуса RLS
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename AND pg_policies.schemaname = 'public') as policy_count
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'daily_checkins';

-- Проверьте функцию get_telegram_user_id_from_jwt
SELECT get_telegram_user_id_from_jwt();
-- Вернет NULL если нет JWT токена (при прямом подключении)
```

## Почему ваш запрос не работает

Когда вы выполняете:

```sql
SET request.jwt.claim.sub = '910657e3-4f7f-401b-837d-f1cc60966cd3';
SET request.jwt.claim.user_metadata = '{"telegram_user_id": 195202}';
SELECT * FROM daily_checkins;
```

**Проблемы:**

1. `SET request.jwt.claim.*` устанавливает переменные сессии PostgreSQL, но **не устанавливает JWT токен** для функции `auth.jwt()`
2. Функция `auth.jwt()` читает JWT из HTTP заголовка `Authorization: Bearer <token>`, а не из переменных сессии
3. При прямом подключении к БД вы используете Service Role Key, который **обходит RLS политики**

## Решение: Правильное тестирование

### Шаг 1: Получите JWT токен через auth-telegram

```bash
curl -X POST https://your-project.supabase.co/functions/v1/auth-telegram \
  -H "Content-Type: application/json" \
  -H "apikey: your-anon-key" \
  -H "X-Telegram-Init-Data: your-telegram-init-data" \
  | jq -r '.token'
```

### Шаг 2: Используйте JWT токен в запросах

**Вариант A: Через Supabase Client (JavaScript/TypeScript)**

```typescript
const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // из auth-telegram

const supabase = createClient(url, anonKey, {
  global: {
    headers: {
      Authorization: `Bearer ${jwtToken}`
    }
  }
});

const { data } = await supabase.from('daily_checkins').select('*');
// Вернет только данные для пользователя из JWT токена
```

**Вариант B: Через HTTP запрос**

```bash
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET "https://your-project.supabase.co/rest/v1/daily_checkins" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json"
```

### Шаг 3: Проверьте, что RLS работает

```sql
-- Проверьте функцию get_telegram_user_id_from_jwt
-- При прямом подключении вернет NULL (RLS обойден)
-- При подключении с JWT токеном вернет telegram_user_id из токена
SELECT get_telegram_user_id_from_jwt();

-- Проверьте статус RLS для всех таблиц
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename AND pg_policies.schemaname = 'public') as policy_count
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN ('auth_user_mapping', 'spatial_ref_sys')
ORDER BY tablename;
```

## Проверка RLS политик в production

### Проверка RLS политик:

```sql
-- Проверьте статус RLS для конкретной таблицы
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename AND pg_policies.schemaname = 'public') as policy_count
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'daily_checkins';

-- Проверьте все таблицы
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename AND pg_policies.schemaname = 'public') as policy_count
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN ('auth_user_mapping', 'spatial_ref_sys')
ORDER BY tablename;

-- Проверьте политики для daily_checkins
SELECT 
  tablename,
  policyname,
  cmd as operation,
  qual as using_clause
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'daily_checkins'
ORDER BY cmd, policyname;
```

## Важно помнить

1. **Service Role Key обходит RLS** - используйте его только в Edge Functions для административных операций
2. **Anon Key + JWT токен применяет RLS** - используйте для клиентских запросов
3. **Прямое подключение к БД обходит RLS** - для тестирования RLS используйте Supabase Client или HTTP API
4. **`SET request.jwt.claim.*` не работает** - используйте реальный JWT токен в заголовке Authorization

## Тестирование в production

Для правильного тестирования RLS в production:

1. Получите JWT токен через `auth-telegram` Edge Function
2. Используйте Supabase Client с этим токеном
3. Выполните запросы через клиент, а не напрямую к БД
4. Проверьте, что возвращаются только данные пользователя из JWT токена
