# Инструкция: Webhook Secret Token для Telegram Bot API

## Что это такое?

**Webhook Secret Token** — это секретный ключ, который **вы сами генерируете** (не от Telegram). Он используется для проверки, что webhook запросы действительно приходят от Telegram, а не от злоумышленников.

## Зачем это нужно?

Хотя Telegram использует HTTPS и можно проверить IP адреса, `secret_token` — это дополнительный уровень безопасности, который гарантирует, что запросы действительно от Telegram.

## Как сгенерировать токен?

### Вариант 1: OpenSSL (рекомендуется)

```bash
openssl rand -hex 32
```

Результат будет примерно таким:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Вариант 2: Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Вариант 3: Python

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Вариант 4: Онлайн генератор

- https://randomkeygen.com/ (выберите "CodeIgniter Encryption Keys" или "Fort Knox Password")
- Минимум 32 символа, рекомендуется 64+

## Как сохранить токен?

### Локальная разработка (опционально)

Добавить в `supabase/functions/.env`:
```bash
TELEGRAM_WEBHOOK_SECRET=ваш-сгенерированный-токен-здесь
```

### Production (обязательно!)

```bash
supabase secrets set TELEGRAM_WEBHOOK_SECRET=ваш-сгенерированный-токен-здесь
```

Или через Supabase Dashboard:
1. Зайти в проект на https://supabase.com
2. Settings → Edge Functions → Secrets
3. Добавить `TELEGRAM_WEBHOOK_SECRET` = ваш токен

## Как настроить webhook в Telegram?

После деплоя Edge Function `handle-payment-webhook`, настройте webhook для **каждого бота**:

```bash
# Для primary бота
curl -X POST "https://api.telegram.org/bot<PRIMARY_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://<your-project>.supabase.co/functions/v1/handle-payment-webhook",
    "secret_token": "ваш-сгенерированный-токен-здесь",
    "allowed_updates": ["pre_checkout_query", "message"]
  }'

# Для staging бота (если есть)
curl -X POST "https://api.telegram.org/bot<STAGING_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://<your-project>.supabase.co/functions/v1/handle-payment-webhook",
    "secret_token": "ваш-сгенерированный-токен-здесь",
    "allowed_updates": ["pre_checkout_query", "message"]
  }'

# Для production бота (если есть)
curl -X POST "https://api.telegram.org/bot<PRODUCTION_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://<your-project>.supabase.co/functions/v1/handle-payment-webhook",
    "secret_token": "ваш-сгенерированный-токен-здесь",
    "allowed_updates": ["pre_checkout_query", "message"]
  }'
```

**Важно:**
- Используйте **один и тот же** `secret_token` для всех ботов (или разные, но тогда нужно хранить маппинг)
- URL должен быть **HTTPS** (обязательно!)
- `allowed_updates` ограничивает типы обновлений (оптимизация производительности)

## Как проверить токен в Edge Function?

В `supabase/functions/handle-payment-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // ВАЖНО: Проверка secret token ПЕРВЫМ делом!
  const secretToken = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
  const expectedToken = Deno.env.get('TELEGRAM_WEBHOOK_SECRET');
  
  if (!secretToken || secretToken !== expectedToken) {
    console.error('[Webhook] Invalid or missing secret token');
    return new Response('Unauthorized', { 
      status: 403,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  
  // Продолжаем обработку webhook только после успешной проверки токена
  const update = await req.json();
  
  // Обработка pre_checkout_query и successful_payment...
});
```

## Как проверить настройку webhook?

### Проверить текущий webhook

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

Ответ будет содержать:
- `url` - URL webhook
- `has_custom_certificate` - использование кастомного сертификата
- `pending_update_count` - количество ожидающих обновлений
- `last_error_date` - дата последней ошибки (если была)
- `last_error_message` - сообщение об ошибке

### Удалить webhook (если нужно)

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook"
```

## Безопасность

1. **Никогда не коммитьте токен в git** - используйте только Supabase Secrets
2. **Используйте длинный токен** - минимум 32 символа, рекомендуется 64+
3. **Проверяйте токен первым делом** - до любой обработки данных
4. **Логируйте попытки** - записывайте в лог все запросы с неверным токеном
5. **Регулярно ротируйте токен** - меняйте токен периодически для безопасности

## Troubleshooting

### Проблема: Webhook не получает запросы

1. Проверьте, что webhook настроен: `getWebhookInfo`
2. Проверьте, что URL доступен из интернета (HTTPS)
3. Проверьте логи Edge Function в Supabase Dashboard
4. Проверьте, что `allowed_updates` включает нужные типы

### Проблема: Получаю 403 Unauthorized

1. Проверьте, что токен правильно сохранён в Supabase Secrets
2. Проверьте, что токен совпадает с тем, что передали в `setWebhook`
3. Проверьте заголовок `X-Telegram-Bot-Api-Secret-Token` в логах
4. Убедитесь, что проверка токена выполняется до парсинга JSON

### Проблема: Разные токены для разных ботов

Если вы хотите использовать разные токены для разных ботов:

1. Сохраните токены как `TELEGRAM_WEBHOOK_SECRET_BOT1`, `TELEGRAM_WEBHOOK_SECRET_BOT2` и т.д.
2. В Edge Function определите, какой бот отправил запрос (можно по IP или другим признакам)
3. Или используйте разные webhook URL для каждого бота

## Пример полной настройки

```bash
# 1. Генерируем токен
WEBHOOK_SECRET=$(openssl rand -hex 32)
echo "Generated token: $WEBHOOK_SECRET"

# 2. Сохраняем в Supabase Secrets
supabase secrets set TELEGRAM_WEBHOOK_SECRET=$WEBHOOK_SECRET

# 3. Настраиваем webhook для каждого бота
curl -X POST "https://api.telegram.org/bot$PRIMARY_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"https://your-project.supabase.co/functions/v1/handle-payment-webhook\",
    \"secret_token\": \"$WEBHOOK_SECRET\",
    \"allowed_updates\": [\"pre_checkout_query\", \"message\"]
  }"

# 4. Проверяем настройку
curl "https://api.telegram.org/bot$PRIMARY_BOT_TOKEN/getWebhookInfo"
```

---

**Последнее обновление**: 2026-01-30  
**Статус**: Готово к использованию
