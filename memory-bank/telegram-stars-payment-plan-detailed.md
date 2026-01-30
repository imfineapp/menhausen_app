# Детальный технический план внедрения Telegram Stars Payment

## Дополнительные технические детали

### Структура файлов проекта

```
supabase/
├── functions/
│   ├── create-premium-invoice/
│   │   ├── index.ts          # Создание инвойсов через Bot API
│   │   └── deno.json         # Deno конфигурация
│   ├── handle-payment-webhook/
│   │   ├── index.ts          # Обработка webhook от Telegram
│   │   └── deno.json         # Deno конфигурация
│   └── _shared/
│       └── telegram-bot-api.ts  # Утилиты для Bot API
├── migrations/
│   └── [timestamp]_premium_subscriptions.sql
└── config.toml               # Конфигурация Edge Functions

utils/
└── telegramStarsPaymentService.ts  # Frontend сервис для платежей

components/
└── PaymentsScreen.tsx         # Обновленный компонент оплаты

types/
└── payments.ts               # TypeScript типы для платежей
```

### Детальные примеры API запросов/ответов

#### 1. Создание инвойса (Frontend → Edge Function)

**Запрос:**
```typescript
POST /functions/v1/create-premium-invoice
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
Body:
{
  "planType": "monthly"
}
```

**Ответ (успех):**
```json
{
  "success": true,
  "invoiceUrl": "https://t.me/invoice/..."
}
```

**Ответ (ошибка):**
```json
{
  "success": false,
  "error": "Invalid plan type"
}
```

#### 2. Webhook от Telegram (Telegram → Edge Function)

**Запрос (pre_checkout_query):**
```json
{
  "update_id": 123456789,
  "pre_checkout_query": {
    "id": "abc123",
    "from": {
      "id": 123456789,
      "is_bot": false,
      "first_name": "John"
    },
    "currency": "XTR",
    "total_amount": 150,
    "invoice_payload": "{\"planType\":\"monthly\",\"telegramUserId\":123456789,\"timestamp\":1234567890}"
  }
}
```

**Ответ (через Bot API):**
```typescript
POST https://api.telegram.org/bot<TOKEN>/answerPreCheckoutQuery
{
  "pre_checkout_query_id": "abc123",
  "ok": true
}
```

**Запрос (successful_payment):**
```json
{
  "update_id": 123456790,
  "message": {
    "message_id": 123,
    "from": {
      "id": 123456789,
      "is_bot": false,
      "first_name": "John"
    },
    "date": 1234567890,
    "successful_payment": {
      "currency": "XTR",
      "total_amount": 150,
      "invoice_payload": "{\"planType\":\"monthly\",\"telegramUserId\":123456789,\"timestamp\":1234567890}",
      "telegram_payment_charge_id": "charge_123456789"
    }
  }
}
```

### Конфигурация переменных окружения

#### Edge Functions (.env или Supabase Dashboard)

```bash
# Telegram Bot Token (уже существует)
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11

# Webhook Secret Token (новый)
TELEGRAM_WEBHOOK_SECRET=your-secret-token-here-min-32-chars

# Supabase (уже существует)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Frontend (.env)

```bash
# Уже существует
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Детальная последовательность операций

#### Сценарий успешной оплаты:

1. **Пользователь нажимает "Купить Premium"**
   - Frontend: `PaymentsScreen.handlePurchase()` вызывается
   - Frontend: Показывается loading индикатор

2. **Создание инвойса**
   - Frontend: Вызов `telegramStarsPaymentService.createInvoice('monthly')`
   - Frontend: POST запрос к `/functions/v1/create-premium-invoice`
   - Backend: Валидация JWT токена или Telegram initData
   - Backend: Извлечение `telegram_user_id`
   - Backend: Вызов Telegram Bot API `createInvoiceLink`
   - Backend: Возврат `invoiceUrl` в ответе

3. **Открытие инвойса**
   - Frontend: Вызов `window.Telegram.WebApp.openInvoice(invoiceUrl, callback)`
   - Telegram: Показывает интерфейс оплаты пользователю
   - Пользователь: Подтверждает оплату

4. **Pre-checkout query**
   - Telegram: Отправляет webhook с `pre_checkout_query`
   - Backend: `handle-payment-webhook` получает запрос
   - Backend: Парсит `invoice_payload`
   - Backend: Проверяет доступность плана (быстрая проверка!)
   - Backend: Отвечает через `answerPreCheckoutQuery` в течение 10 секунд

5. **Успешная оплата**
   - Telegram: Отправляет webhook с `successful_payment`
   - Backend: `handle-payment-webhook` получает запрос
   - Backend: Проверяет на дубликаты (`telegram_payment_charge_id`)
   - Backend: Создает запись в `premium_subscriptions`:
     ```sql
     INSERT INTO premium_subscriptions (
       telegram_user_id,
       plan_type,
       telegram_payment_charge_id,
       invoice_message_id,
       status,
       starts_at,
       expires_at
     ) VALUES (
       123456789,
       'monthly',
       'charge_123456789',
       123,
       'active',
       NOW(),
       NOW() + INTERVAL '1 month'
     );
     ```
   - Backend: Триггер автоматически обновляет `users.has_premium = true`

6. **Callback в Frontend**
   - Telegram: Вызывает callback с `status = 'paid'`
   - Frontend: `handlePaymentResult('paid', 'monthly')`
   - Frontend: Обновляет localStorage
   - Frontend: Отправляет событие `premium:activated`
   - Frontend: Обновляет UI (разблокирует premium контент)
   - Frontend: Показывает сообщение об успехе

### Обработка ошибок

#### Типы ошибок и их обработка:

1. **Ошибка создания инвойса**
   - Причина: Неверный план, проблемы с Bot API, сетевые ошибки
   - Обработка: Показать сообщение об ошибке, предложить повторить
   - Логирование: Записать в консоль и отправить в PostHog

2. **Таймаут pre_checkout_query**
   - Причина: Медленный ответ от БД, проблемы с сетью
   - Обработка: Telegram автоматически отменяет платеж
   - Митигация: Использовать кеш, быстрые запросы, мониторинг времени ответа

3. **Дублирование платежа**
   - Причина: Повторный webhook, сбой при обработке
   - Обработка: Проверка `telegram_payment_charge_id` перед активацией
   - Логирование: Записать попытку дубликата

4. **Отмена пользователем**
   - Причина: Пользователь нажал "Отмена" в интерфейсе оплаты
   - Обработка: Просто закрыть диалог, вернуться к выбору плана
   - Логирование: Не требуется (нормальное поведение)

5. **Ошибка активации подписки**
   - Причина: Проблемы с БД, нарушение ограничений
   - Обработка: Записать в лог, отправить уведомление администратору
   - Восстановление: Реализовать механизм повторной активации

### Тестирование

#### Unit тесты:

```typescript
// utils/telegramStarsPaymentService.test.ts
describe('TelegramStarsPaymentService', () => {
  it('should create invoice for monthly plan', async () => {
    const invoiceUrl = await service.createInvoice('monthly');
    expect(invoiceUrl).toMatch(/^https:\/\/t\.me\/invoice\//);
  });
  
  it('should handle payment cancellation', async () => {
    const result = await service.handlePaymentResult('cancelled', 'monthly');
    expect(localStorage.getItem('user-premium-status')).toBeNull();
  });
});
```

#### Integration тесты:

```typescript
// tests/integration/payment-flow.test.ts
describe('Payment Flow Integration', () => {
  it('should complete full payment flow', async () => {
    // 1. Создать инвойс
    const invoiceUrl = await createInvoice('monthly');
    
    // 2. Симулировать успешную оплату
    await simulateSuccessfulPayment(invoiceUrl);
    
    // 3. Проверить активацию premium
    const premiumStatus = await checkPremiumStatus(userId);
    expect(premiumStatus).toBe(true);
  });
});
```

#### E2E тесты (Playwright):

```typescript
// tests/e2e/payment-flow.spec.ts
test('user can purchase premium subscription', async ({ page }) => {
  await page.goto('/payments');
  
  // Выбрать план
  await page.click('[data-plan="monthly"]');
  
  // Нажать кнопку покупки
  await page.click('button:has-text("Buy Premium")');
  
  // Симулировать успешную оплату (в тестовой среде)
  await simulateTelegramPayment(page, 'success');
  
  // Проверить успешное сообщение
  await expect(page.locator('text=Thank you')).toBeVisible();
  
  // Проверить разблокировку premium контента
  await expect(page.locator('[data-premium="unlocked"]')).toBeVisible();
});
```

### Мониторинг и метрики

#### Ключевые метрики для отслеживания:

1. **Конверсия платежей**
   - Созданные инвойсы → Оплаченные
   - Целевой показатель: >30%

2. **Время обработки**
   - Создание инвойса: <1 секунда
   - Pre-checkout query: <2 секунды (критично!)
   - Активация подписки: <3 секунды

3. **Ошибки**
   - Ошибки создания инвойса: <1%
   - Таймауты pre_checkout_query: <0.1%
   - Ошибки активации: <0.5%

4. **Выручка**
   - Количество активных подписок
   - Средний чек
   - MRR (Monthly Recurring Revenue)

#### Логирование:

```typescript
// Пример структуры логов
{
  "event": "invoice_created",
  "timestamp": "2026-01-30T12:00:00Z",
  "userId": 123456789,
  "planType": "monthly",
  "invoiceUrl": "https://t.me/invoice/...",
  "duration_ms": 450
}

{
  "event": "payment_successful",
  "timestamp": "2026-01-30T12:00:05Z",
  "userId": 123456789,
  "planType": "monthly",
  "paymentChargeId": "charge_123456789",
  "duration_ms": 1200
}

{
  "event": "pre_checkout_timeout",
  "timestamp": "2026-01-30T12:00:03Z",
  "queryId": "abc123",
  "duration_ms": 11000,
  "error": "Response time exceeded 10 seconds"
}
```

### Безопасность

#### Проверки безопасности:

1. **Валидация запросов**
   - JWT токены проверяются через Supabase Auth
   - Telegram initData проверяется через `validateTelegramAuthWithMultipleTokens`
   - Webhook secret token проверяется для всех webhook запросов

2. **Защита от дублирования**
   - Уникальный constraint на `telegram_payment_charge_id`
   - Проверка перед активацией подписки

3. **Защита от манипуляций**
   - Payload подписывается и проверяется Telegram
   - Цены хранятся на сервере, не передаются от клиента
   - Все критические операции выполняются на сервере

4. **Логирование безопасности**
   - Все попытки создания инвойсов
   - Все webhook запросы
   - Все активации подписок
   - Все ошибки валидации

### Чеклист перед продакшеном

- [ ] Все миграции применены к production БД
- [ ] Edge Functions развернуты в production
- [ ] Webhook настроен в Telegram Bot API
- [ ] Переменные окружения настроены в Supabase Dashboard
- [ ] Цены в Stars согласованы с бизнесом
- [ ] Тесты пройдены (unit, integration, E2E)
- [ ] Мониторинг настроен
- [ ] Документация обновлена
- [ ] Инструкции для поддержки созданы
- [ ] Процесс возврата средств документирован
- [ ] Проведено тестирование в тестовой среде Telegram
- [ ] Проверена безопасность (валидация, защита от дублирования)
- [ ] Настроены алерты для критических ошибок
