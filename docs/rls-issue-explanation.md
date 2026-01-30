# Объяснение проблемы с RLS политиками

## Проблема

Вы выполняете запрос:
```sql
SET request.jwt.claim.sub = '910657e3-4f7f-401b-837d-f1cc60966cd3';
SET request.jwt.claim.user_metadata = '{"telegram_user_id": 195202}';
SELECT * FROM daily_checkins;
```

И получаете данные **всех пользователей**, а не только пользователя с `telegram_user_id = 195202`.

## Причина

**RLS политики НЕ работают** при использовании `SET request.jwt.claim.*` потому что:

1. **Функция `auth.jwt()` читает JWT из HTTP заголовка**, а не из переменных сессии PostgreSQL
2. **Прямое подключение к БД обходит RLS** - если вы подключаетесь через Supabase CLI или напрямую к PostgreSQL, вы используете Service Role Key, который **обходит все RLS политики**

## Проверка

Выполните этот запрос для проверки:

```sql
-- Проверьте, что функция get_telegram_user_id_from_jwt возвращает NULL
-- Это означает, что JWT токен не доступен (RLS обойден)
SELECT get_telegram_user_id_from_jwt();
-- Вернет NULL при прямом подключении к БД

-- Проверьте статус RLS
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename AND pg_policies.schemaname = 'public') as policy_count
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'daily_checkins';
-- Покажет, что RLS включен, но политики не применяются при прямом подключении
```

## Решение

### Правильный способ тестирования RLS:

1. **Получите JWT токен** через `auth-telegram` Edge Function:
```bash
curl -X POST https://ciwclljuxgbyqwqxmhxg.supabase.co/functions/v1/auth-telegram \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "X-Telegram-Init-Data: YOUR_TELEGRAM_INIT_DATA" \
  | jq -r '.token'
```

2. **Используйте JWT токен в запросах** через Supabase REST API или Client:
```bash
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET "https://ciwclljuxgbyqwqxmhxg.supabase.co/rest/v1/daily_checkins" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

Теперь вы получите **только данные пользователя** из JWT токена.

## Важно

- ✅ **RLS политики работают правильно** - они просто не применяются при прямом подключении к БД
- ✅ **В production RLS работает** - все запросы через Supabase Client/API применяют RLS политики
- ❌ **Прямое подключение к БД обходит RLS** - это нормальное поведение для административных операций

## Проверка RLS в production

RLS политики **работают правильно** в production, когда:
- Запросы идут через Supabase Client с JWT токеном
- Запросы идут через Edge Functions с JWT токеном в заголовке
- Запросы идут через REST API с JWT токеном в заголовке Authorization

RLS политики **НЕ применяются** когда:
- Вы подключаетесь напрямую к PostgreSQL (Service Role Key)
- Вы используете Supabase CLI для выполнения SQL запросов
- Вы используете `SET request.jwt.claim.*` (это не устанавливает JWT для RLS)
