# Fix для Edge Functions - JWT Verification

**Проблема**: Edge Functions возвращают 401 "Invalid JWT" потому что `verify_jwt = true` требует валидный JWT токен, но мы используем Telegram initData для аутентификации.

**Решение**: Отключить JWT verification для функций, которые используют Telegram аутентификацию.

## Изменения в config.toml

Уже выполнено в `supabase/config.toml`:
- `[functions.sync-user-data]` → `verify_jwt = false`
- `[functions.get-user-data]` → `verify_jwt = false`

## Деплой в продакшен

### Вариант 1: Через CLI с флагом (рекомендуется)

```bash
cd supabase

# Деплой с отключенной JWT проверкой
supabase functions deploy get-user-data --no-verify-jwt
supabase functions deploy sync-user-data --no-verify-jwt
```

### Вариант 2: Через Supabase Dashboard

1. Зайдите в Supabase Dashboard → Edge Functions
2. Выберите функцию `get-user-data`
3. В настройках отключите "Verify JWT"
4. Повторите для `sync-user-data`

### Вариант 3: Через config.toml (если CLI использует его при деплое)

Просто передеплойте функции:

```bash
cd supabase
supabase functions deploy get-user-data
supabase functions deploy sync-user-data
```

## Проверка

После деплоя проверьте, что функции работают без ошибки 401. Логи в консоли браузера должны показывать успешные запросы.

## Безопасность

Безопасность обеспечивается через:
- Валидацию Telegram initData с использованием bot token (HMAC-SHA256)
- Проверку подписи hash в `validateTelegramAuth()`
- Проверку срока действия auth_date

JWT проверка не нужна, так как мы используем собственную систему аутентификации через Telegram.

