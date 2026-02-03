# Как получить TELEGRAM_TEST_BOT_IDS

Для настройки `TELEGRAM_TEST_BOT_IDS` нужно получить `bot_id` для каждого тестового/стейджинг бота.

## Способ 1: Использовать готовый скрипт (рекомендуется)

### Bash скрипт (работает на macOS/Linux)

```bash
./scripts/get-bot-ids.sh
```

Скрипт автоматически:
- Найдёт все токены ботов в переменных окружения
- Получит `bot_id` для каждого через Telegram Bot API
- Предложит значение для `TELEGRAM_TEST_BOT_IDS`

### TypeScript скрипт (требует tsx)

```bash
npx tsx scripts/get-bot-ids.ts
```

## Способ 2: Через curl (вручную)

Для каждого токена бота выполните:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"
```

Ответ будет выглядеть так:

```json
{
  "ok": true,
  "result": {
    "id": 123456789,
    "is_bot": true,
    "first_name": "My Bot",
    "username": "my_bot",
    "can_join_groups": true,
    "can_read_all_group_messages": false,
    "supports_inline_queries": false
  }
}
```

**Важно:** Поле `id` - это и есть `bot_id`, которое нужно использовать.

### Пример для нескольких ботов:

```bash
# Production bot
curl "https://api.telegram.org/bot<PRODUCTION_TOKEN>/getMe" | jq '.result.id'
# Ответ: 123456789

# Staging bot
curl "https://api.telegram.org/bot<STAGING_TOKEN>/getMe" | jq '.result.id'
# Ответ: 987654321

# Test bot
curl "https://api.telegram.org/bot<TEST_TOKEN>/getMe" | jq '.result.id'
# Ответ: 555666777
```

## Способ 3: Через Deno (если используете Deno)

```bash
deno run --allow-net --allow-env scripts/get-bot-ids-deno.ts
```

## Настройка TELEGRAM_TEST_BOT_IDS

После получения всех `bot_id`, определите, какие из них являются тестовыми/стейджинг ботами.

### Пример:

Если у вас:
- Production bot: `bot_id = 123456789`
- Staging bot: `bot_id = 987654321`
- Test bot: `bot_id = 555666777`

То `TELEGRAM_TEST_BOT_IDS` должен быть:

```bash
supabase secrets set TELEGRAM_TEST_BOT_IDS="987654321,555666777"
```

**Важно:** 
- Тестовые боты (`is_test_payment = true`) **не будут** давать премиум в продакшене
- Продакшен боты (`is_test_payment = false`) **будут** давать премиум в продакшене
- Разделение происходит автоматически на основе `bot_id` из `TELEGRAM_TEST_BOT_IDS`

## Проверка конфигурации

После настройки можно проверить, что всё работает:

1. Создайте инвойс через тестовый бот
2. Проверьте в логах Edge Function `create-premium-invoice`, что `isTestPayment = true`
3. Проверьте в БД, что подписка создана с `is_test_payment = true`
4. Убедитесь, что `users.has_premium` **не обновился** (для тестовых ботов)

## Troubleshooting

### Ошибка "Invalid token"
- Проверьте, что токен правильный и не истёк
- Убедитесь, что токен начинается с цифр (формат: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Ошибка "Bot not found"
- Проверьте, что бот существует и токен принадлежит ему
- Убедитесь, что используете правильный токен для нужного бота

### Не могу определить, какой бот тестовый
- Обычно тестовые/стейджинг боты имеют отдельные токены (например, `TELEGRAM_BOT_TOKEN_STAGING`)
- Проверьте названия переменных окружения - они часто содержат подсказки (`STAGING`, `TEST`, `DEV`)
