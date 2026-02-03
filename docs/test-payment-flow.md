# Тестирование платежей Telegram Stars

## ⚠️ Важно: Telegram Stars не поддерживает тестовый режим

**Все платежи Telegram Stars являются реальными** - пользователь тратит реальные Stars. Нет тестового режима как для физических товаров.

**Автоматическое определение цены:**
- **Тестовый бот** (из `TELEGRAM_TEST_BOT_IDS`): **1 Star** для всех планов, `is_test_payment = true`, не даёт премиум
- **Продакшен бот**: Реальные цены (150, 1500, 2500 Stars), `is_test_payment = false`, даёт премиум

Подробнее: `docs/telegram-stars-test-payments.md`

## Подготовка

### 1. Убедитесь, что всё настроено:

- ✅ Миграция БД применена (`premium_subscriptions` таблица существует)
- ✅ Edge Functions задеплоены (`create-premium-invoice`, `handle-payment-webhook`)
- ✅ Webhook настроен для бота через `setWebhook`
- ✅ `TELEGRAM_WEBHOOK_SECRET` сохранён в Supabase Secrets
- ✅ `TELEGRAM_TEST_BOT_IDS` настроен (если используете тестовые боты)
- ✅ Бот имеет права на приём платежей (Stars)
- ⚠️ **Для тестирования:** Используйте тестового бота (из `TELEGRAM_TEST_BOT_IDS`) - автоматически цена будет 1 Star

### 2. Проверьте конфигурацию:

```bash
# Проверить статус проекта
supabase status

# Проверить задеплоенные функции
supabase functions list
```

## Процесс тестирования

### Шаг 1: Открыть приложение в Telegram

1. Откройте ваше Mini App в Telegram через тестового бота
2. Перейдите на экран покупки Premium (`PaymentsScreen`)
3. Выберите план (monthly, annually, или lifetime)

### Шаг 2: Инициировать платеж

1. Нажмите кнопку покупки
2. Должен открыться инвойс Telegram Stars
3. Проверьте:
   - ✅ Цена указана правильно (в Stars)
   - ✅ Описание плана корректное
   - ✅ Валюта: XTR (Telegram Stars)

### Шаг 3: Подтвердить платеж

1. В инвойсе нажмите "Оплатить" (Pay)
2. Подтвердите платеж в Telegram
3. Дождитесь завершения транзакции

### Шаг 4: Проверить результат

#### 4.1 Проверка в приложении

После успешной оплаты:
- ✅ Должно появиться сообщение об успешной покупке
- ✅ Статус Premium должен обновиться
- ✅ Премиум функции должны стать доступными

#### 4.2 Проверка в базе данных

Выполните в Supabase Dashboard → SQL Editor:

```sql
-- Проверить созданную подписку
SELECT 
  id,
  telegram_user_id,
  bot_id,
  bot_username,
  is_test_payment,
  plan_type,
  status,
  telegram_payment_charge_id,
  starts_at,
  expires_at,
  created_at
FROM premium_subscriptions
WHERE telegram_user_id = <ваш_telegram_user_id>
ORDER BY created_at DESC
LIMIT 1;

-- Проверить статус has_premium в users
SELECT 
  telegram_user_id,
  has_premium,
  updated_at
FROM users
WHERE telegram_user_id = <ваш_telegram_user_id>;
```

**Ожидаемый результат:**
- Для **продакшен бота**: `has_premium = true`, `is_test_payment = false`
- Для **тестового бота**: `has_premium = false` (в продакшене), `is_test_payment = true`

#### 4.3 Проверка логов Edge Functions

В Supabase Dashboard → Edge Functions → Logs:

**create-premium-invoice:**
```
[create-premium-invoice] Invoice created: {
  telegramUserId: <id>,
  planType: "monthly",
  botId: <bot_id>,
  isTestPayment: true/false,
  invoiceUrl: "..."
}
```

**handle-payment-webhook:**
```
[handle-payment-webhook] Pre-checkout query answered: {
  queryId: "...",
  canProcess: true,
  planType: "monthly"
}

[handle-payment-webhook] Payment processed successfully: {
  userId: <id>,
  planType: "monthly",
  paymentChargeId: "..."
}

[handle-payment-webhook] Premium subscription activated: {
  telegramUserId: <id>,
  planType: "monthly",
  botId: <bot_id>,
  isTestPayment: true/false,
  paymentChargeId: "..."
}
```

## Тестовые сценарии

### Сценарий 1: Успешный платеж (продакшен бот)

1. Откройте приложение через **продакшен бота**
2. Совершите покупку
3. Проверьте:
   - ✅ `premium_subscriptions.is_test_payment = false`
   - ✅ `users.has_premium = true`
   - ✅ Премиум функции доступны

### Сценарий 2: Успешный платеж (тестовый бот)

1. Откройте приложение через **тестовый бот** (из `TELEGRAM_TEST_BOT_IDS`)
2. Совершите покупку
3. Проверьте:
   - ✅ `premium_subscriptions.is_test_payment = true`
   - ✅ `users.has_premium = false` (в продакшене)
   - ⚠️ Премиум функции **не должны** быть доступны в продакшене

### Сценарий 3: Отмена платежа

1. Откройте инвойс
2. Нажмите "Отмена" (Cancel)
3. Проверьте:
   - ✅ Инвойс закрыт без оплаты
   - ✅ Подписка **не создана** в БД
   - ✅ `has_premium` не изменился

### Сценарий 4: Повторная покупка

1. Совершите первую покупку
2. Попробуйте купить ещё раз
3. Проверьте:
   - ✅ Создана **вторая** подписка в БД
   - ✅ Обе подписки имеют статус `active`
   - ✅ `has_premium` остаётся `true`

### Сценарий 5: Проверка защиты от дублирования

1. Совершите платеж
2. Сохраните `telegram_payment_charge_id`
3. Попробуйте обработать тот же `telegram_payment_charge_id` повторно
4. Проверьте:
   - ✅ Дубликат **не создаётся** в БД
   - ✅ В логах: "Duplicate payment detected"

## Проверка через API

### Создать инвойс вручную:

```bash
# Получить JWT токен (через auth-telegram функцию)
curl -X POST "https://<project>.supabase.co/functions/v1/auth-telegram" \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Init-Data: <initData>" \
  -d '{}'

# Создать инвойс
curl -X POST "https://<project>.supabase.co/functions/v1/create-premium-invoice" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"planType": "monthly"}'
```

Ответ должен содержать `invoiceUrl`.

## Troubleshooting

### Проблема: Инвойс не открывается

**Причины:**
- Telegram WebApp API не доступен (не в Telegram)
- `openInvoice` не поддерживается в вашей версии Telegram

**Решение:**
- Убедитесь, что открываете приложение **в Telegram**, а не в браузере
- Проверьте версию Telegram (должна быть актуальной)

### Проблема: Платеж не обрабатывается

**Причины:**
- Webhook не настроен или настроен неправильно
- `TELEGRAM_WEBHOOK_SECRET` не совпадает
- Edge Function `handle-payment-webhook` не задеплоена

**Решение:**
1. Проверьте webhook:
   ```bash
   curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
   ```
2. Проверьте логи Edge Function `handle-payment-webhook`
3. Убедитесь, что `TELEGRAM_WEBHOOK_SECRET` совпадает в Secrets и в `setWebhook`

### Проблема: `is_test_payment` определяется неправильно

**Причины:**
- `TELEGRAM_TEST_BOT_IDS` не настроен
- `bot_id` не определяется правильно

**Решение:**
1. Проверьте `TELEGRAM_TEST_BOT_IDS`:
   ```bash
   supabase secrets list | grep TELEGRAM_TEST_BOT_IDS
   ```
2. Проверьте логи `create-premium-invoice` - там должен быть `botId`
3. Убедитесь, что `bot_id` из логов есть в `TELEGRAM_TEST_BOT_IDS`

### Проблема: `has_premium` не обновляется

**Причины:**
- Триггер не сработал
- Платеж от тестового бота (для продакшена это нормально)

**Решение:**
1. Проверьте триггеры:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'update_user_premium_status_trigger';
   ```
2. Проверьте `is_test_payment` - для тестовых ботов `has_premium` не должен обновляться в продакшене
3. Проверьте логи триггера (если включены)

### Проблема: "Invalid or missing secret token"

**Причины:**
- `TELEGRAM_WEBHOOK_SECRET` не совпадает с тем, что в `setWebhook`
- Заголовок `X-Telegram-Bot-Api-Secret-Token` не передаётся

**Решение:**
1. Проверьте секрет в Supabase Secrets
2. Перепроверьте настройку webhook с правильным `secret_token`
3. Проверьте логи `handle-payment-webhook` - там должна быть ошибка с деталями

## Чеклист тестирования

- [ ] Инвойс создаётся успешно
- [ ] Инвойс открывается в Telegram
- [ ] Платеж проходит успешно
- [ ] Подписка создаётся в БД с правильными данными
- [ ] `bot_id` определяется правильно
- [ ] `is_test_payment` устанавливается правильно
- [ ] `has_premium` обновляется для продакшен ботов
- [ ] `has_premium` НЕ обновляется для тестовых ботов
- [ ] Защита от дублирования работает
- [ ] Отмена платежа работает корректно
- [ ] Логи показывают все этапы процесса
- [ ] Webhook обрабатывается в течение 10 секунд

## Полезные SQL запросы для отладки

```sql
-- Посмотреть все подписки пользователя
SELECT * FROM premium_subscriptions 
WHERE telegram_user_id = <user_id> 
ORDER BY created_at DESC;

-- Проверить активные подписки
SELECT * FROM premium_subscriptions 
WHERE telegram_user_id = <user_id> 
AND status = 'active';

-- Проверить тестовые подписки
SELECT * FROM premium_subscriptions 
WHERE is_test_payment = true;

-- Проверить продакшен подписки
SELECT * FROM premium_subscriptions 
WHERE is_test_payment = false AND status = 'active';

-- Проверить пользователей с премиумом
SELECT telegram_user_id, has_premium, updated_at 
FROM users 
WHERE has_premium = true;
```

## Следующие шаги после успешного тестирования

1. ✅ Протестировать все планы (monthly, annually, lifetime)
2. ✅ Протестировать на разных ботах (production, staging)
3. ✅ Проверить истечение подписок (для monthly/annual)
4. ✅ Настроить мониторинг платежей
5. ✅ Подготовить документацию для пользователей
