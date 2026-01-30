# План внедрения оплаты Telegram Stars за Premium

## Обзор

Этот документ описывает план интеграции оплаты Telegram Stars для Premium подписки в приложение Menhausen. Telegram Stars (валюта XTR) - это обязательная валюта для всех цифровых товаров и услуг в Telegram Mini Apps.

## Документация и требования

### Ключевые факты о Telegram Stars:

1. **Валюта**: Все платежи за цифровые товары должны использовать `XTR` (Telegram Stars)
2. **Создание инвойсов**: Используется Bot API метод `createInvoiceLink` или `sendInvoice`
3. **Открытие в Mini App**: Используется `window.Telegram.WebApp.openInvoice(invoiceUrl, callback)`
4. **Обработка платежей**: 
   - Бот получает `pre_checkout_query` - нужно ответить в течение 10 секунд через `answerPreCheckoutQuery`
   - После успешной оплаты бот получает `successful_payment` - нужно обработать и выдать товар
5. **Хранение данных**: Важно сохранить `telegram_payment_charge_id` для возможных возвратов

### Источники документации:
- [Bot Payments API for Digital Goods](https://core.telegram.org/bots/payments-stars)
- [createInvoiceLink API](https://core.telegram.org/bots/api#createinvoicelink)
- [WebApp.openInvoice](https://core.telegram.org/bots/webapps#initializing-mini-apps)

## Архитектура решения

### Компоненты системы:

1. **Frontend (React/TypeScript)**:
   - `PaymentsScreen.tsx` - UI для выбора плана и инициации оплаты
   - `TelegramStarsPaymentService.ts` - сервис для работы с Telegram Stars API
   - Интеграция с `window.Telegram.WebApp.openInvoice`

2. **Backend (Supabase Edge Functions)**:
   - `create-premium-invoice` - создание инвойса через Bot API
   - `handle-payment-webhook` - обработка webhook от Telegram Bot API
   - Обновление premium статуса пользователя в Supabase

3. **Telegram Bot**:
   - Обработка `pre_checkout_query` и `successful_payment` updates
   - Webhook endpoint для получения платежных обновлений

## Детальный план реализации

### Этап 1: Подготовка инфраструктуры (1-2 дня)

#### 1.0 Предварительные шаги
- [ ] Проверить наличие Telegram Bot Token в переменных окружения
- [ ] Убедиться, что бот зарегистрирован в BotFather
- [ ] Проверить доступность Supabase проекта
- [ ] Убедиться, что Edge Functions могут делать внешние HTTP запросы

#### 1.1 Настройка Telegram Bot для платежей
- [ ] Убедиться, что бот имеет права на прием платежей
- [ ] Настроить webhook для получения платежных обновлений
- [ ] Получить и сохранить Bot Token в переменных окружения

#### 1.2 Создание Supabase Edge Function для создания инвойсов
- [ ] Создать директорию `supabase/functions/create-premium-invoice/`
- [ ] Создать файл `supabase/functions/create-premium-invoice/index.ts`:
  ```typescript
  import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
  import { validateTelegramAuthWithMultipleTokens } from '../_shared/telegram-auth.ts';
  
  // Структура запроса:
  // POST /functions/v1/create-premium-invoice
  // Body: { planType: 'monthly' | 'annually' | 'lifetime' }
  // Headers: Authorization: Bearer <JWT> или X-Telegram-Init-Data: <initData>
  
  // Структура ответа:
  // { success: true, invoiceUrl: string } или { success: false, error: string }
  ```
- [ ] Создать файл `supabase/functions/create-premium-invoice/deno.json`:
  ```json
  {
    "imports": {
      "supabase": "https://esm.sh/@supabase/supabase-js@2"
    }
  }
  ```
- [ ] Реализовать валидацию запросов (JWT или Telegram initData) - использовать паттерн из `get-user-data`
- [ ] Интегрировать с Telegram Bot API (`createInvoiceLink`):
  ```typescript
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const response = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: getPlanTitle(planType),
      description: getPlanDescription(planType),
      payload: JSON.stringify({ planType, telegramUserId, timestamp: Date.now() }),
      provider_token: '', // Пустая для цифровых товаров
      currency: 'XTR',
      prices: [{ label: getPlanLabel(planType), amount: getPlanPrice(planType) }]
    })
  });
  ```
- [ ] Определить цены в Stars для каждого плана (константы в функции):
  - Monthly: 150 Stars
  - Annually: 1500 Stars (экономия 16%)
  - Lifetime: 2500 Stars
- [ ] Добавить конфигурацию в `supabase/config.toml`:
  ```toml
  [functions.create-premium-invoice]
  enabled = true
  verify_jwt = false
  import_map = "./functions/create-premium-invoice/deno.json"
  entrypoint = "./functions/create-premium-invoice/index.ts"
  ```

#### 1.3 Обновление схемы базы данных
- [ ] Создать миграцию `supabase/migrations/[timestamp]_premium_subscriptions.sql`:
  ```sql
  -- Создание таблицы premium_subscriptions
  CREATE TABLE IF NOT EXISTS premium_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id BIGINT NOT NULL REFERENCES users(telegram_user_id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'annually', 'lifetime')),
    telegram_payment_charge_id VARCHAR(255) UNIQUE,
    invoice_message_id INTEGER,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'refunded')),
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ, -- NULL для lifetime планов
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Индексы для быстрого поиска
  CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user_id ON premium_subscriptions(telegram_user_id);
  CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_status ON premium_subscriptions(status);
  CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_active ON premium_subscriptions(telegram_user_id, status) 
    WHERE status = 'active';
  CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_expires ON premium_subscriptions(expires_at) 
    WHERE expires_at IS NOT NULL;

  -- Добавление поля has_premium в таблицу users (если еще нет)
  ALTER TABLE users ADD COLUMN IF NOT EXISTS has_premium BOOLEAN DEFAULT false;
  CREATE INDEX IF NOT EXISTS idx_users_has_premium ON users(has_premium);

  -- Функция для автоматического обновления updated_at
  CREATE OR REPLACE FUNCTION update_premium_subscriptions_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Триггер для автоматического обновления updated_at
  CREATE TRIGGER update_premium_subscriptions_updated_at
    BEFORE UPDATE ON premium_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_premium_subscriptions_updated_at();

  -- Функция для обновления has_premium в users при изменении подписки
  CREATE OR REPLACE FUNCTION update_user_premium_status()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.status = 'active' THEN
      UPDATE users SET has_premium = true WHERE telegram_user_id = NEW.telegram_user_id;
    ELSIF NEW.status IN ('expired', 'cancelled', 'refunded') THEN
      -- Проверяем, есть ли другие активные подписки
      IF NOT EXISTS (
        SELECT 1 FROM premium_subscriptions 
        WHERE telegram_user_id = NEW.telegram_user_id 
        AND status = 'active' 
        AND id != NEW.id
      ) THEN
        UPDATE users SET has_premium = false WHERE telegram_user_id = NEW.telegram_user_id;
      END IF;
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Триггер для автоматического обновления has_premium
  CREATE TRIGGER update_user_premium_status_trigger
    AFTER INSERT OR UPDATE OF status ON premium_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_premium_status();

  -- RLS политики (если RLS включен)
  ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can view their own subscriptions"
    ON premium_subscriptions FOR SELECT
    USING (telegram_user_id = (SELECT telegram_user_id FROM users WHERE telegram_user_id = premium_subscriptions.telegram_user_id));

  -- Примечание: INSERT и UPDATE будут выполняться через Edge Functions с Service Role Key
  ```
- [ ] Протестировать миграцию локально: `supabase migration up`
- [ ] Проверить создание таблицы и индексов

### Этап 2: Backend - обработка платежей (2-3 дня)

#### 2.1 Создание Edge Function для webhook
- [ ] Создать директорию `supabase/functions/handle-payment-webhook/`
- [ ] Создать файл `supabase/functions/handle-payment-webhook/index.ts`:
  ```typescript
  import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
  
  // Структура webhook от Telegram:
  // POST /functions/v1/handle-payment-webhook
  // Body: { update_id: number, pre_checkout_query?: {...}, message?: {...} }
  // Headers: X-Telegram-Bot-Api-Secret-Token: <secret_token>
  
  // Обработка pre_checkout_query:
  // 1. Валидация secret_token
  // 2. Парсинг payload из query.invoice_payload
  // 3. Проверка доступности плана
  // 4. Ответ через answerPreCheckoutQuery в течение 10 секунд!
  
  // Обработка successful_payment:
  // 1. Валидация secret_token
  // 2. Парсинг payment данных
  // 3. Проверка на дубликаты (по telegram_payment_charge_id)
  // 4. Активация подписки в БД
  // 5. Обновление has_premium статуса
  ```
- [ ] Реализовать валидацию secret_token из заголовка
- [ ] Реализовать обработку `pre_checkout_query`:
  ```typescript
  if (update.pre_checkout_query) {
    const query = update.pre_checkout_query;
    const payload = JSON.parse(query.invoice_payload);
    
    // Быстрая проверка (кеш или простой запрос)
    const canProcess = await checkPlanAvailability(payload.planType);
    
    // Ответ в течение 10 секунд!
    await answerPreCheckoutQuery(query.id, canProcess, {
      error_message: canProcess ? undefined : 'Plan unavailable'
    });
  }
  ```
- [ ] Реализовать обработку `successful_payment`:
  ```typescript
  if (update.message?.successful_payment) {
    const payment = update.message.successful_payment;
    const payload = JSON.parse(payment.invoice_payload);
    
    // Проверка на дубликаты
    const existing = await checkExistingPayment(payment.telegram_payment_charge_id);
    if (existing) {
      return; // Уже обработан
    }
    
    // Активация подписки
    await activatePremiumSubscription({
      telegramUserId: update.message.from.id,
      planType: payload.planType,
      paymentChargeId: payment.telegram_payment_charge_id,
      invoiceMessageId: update.message.message_id
    });
  }
  ```
- [ ] Создать `supabase/functions/handle-payment-webhook/deno.json`
- [ ] Добавить конфигурацию в `supabase/config.toml`
- [ ] Настроить webhook URL в Telegram Bot API:
  ```bash
  curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
    -H "Content-Type: application/json" \
    -d '{
      "url": "https://<project>.supabase.co/functions/v1/handle-payment-webhook",
      "secret_token": "<SECRET_TOKEN>",
      "allowed_updates": ["pre_checkout_query", "message"]
    }'
  ```

#### 2.2 Интеграция с Telegram Bot API
- [ ] Создать утилиту `supabase/functions/_shared/telegram-bot-api.ts`:
  ```typescript
  const BOT_API_BASE = 'https://api.telegram.org/bot';
  
  export async function createInvoiceLink(params: {
    title: string;
    description: string;
    payload: string;
    currency: string;
    prices: Array<{ label: string; amount: number }>;
  }): Promise<string> {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const response = await fetch(`${BOT_API_BASE}${botToken}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        provider_token: '', // Пустая для цифровых товаров
      })
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.description);
    return data.result;
  }
  
  export async function answerPreCheckoutQuery(
    queryId: string,
    ok: boolean,
    options?: { error_message?: string }
  ): Promise<void> {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const response = await fetch(`${BOT_API_BASE}${botToken}/answerPreCheckoutQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pre_checkout_query_id: queryId,
        ok,
        ...(options?.error_message && { error_message: options.error_message })
      })
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.description);
  }
  
  export async function refundStarPayment(
    userId: number,
    telegramPaymentChargeId: string
  ): Promise<boolean> {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const response = await fetch(`${BOT_API_BASE}${botToken}/refundStarPayment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        telegram_payment_charge_id: telegramPaymentChargeId
      })
    });
    const data = await response.json();
    return data.ok === true;
  }
  ```
- [ ] Использовать утилиту в Edge Functions

#### 2.3 Логика активации Premium
- [ ] Реализовать функцию активации подписки:
  - Установка `has_premium = true` для пользователя
  - Расчет даты окончания подписки (для monthly/annual)
  - Сохранение информации о подписке
- [ ] Реализовать проверку статуса подписки:
  - Проверка активных подписок
  - Автоматическое истечение подписок (через cron или при запросе)

### Этап 3: Frontend - интеграция с WebApp API (2-3 дня)

#### 3.1 Создание TelegramStarsPaymentService
- [ ] Создать `utils/telegramStarsPaymentService.ts`:
  ```typescript
  import { getTelegramUserId } from './telegramUserUtils';
  import { getSupabaseClient } from './supabaseSync/supabaseSyncService';
  
  interface CreateInvoiceRequest {
    planType: 'monthly' | 'annually' | 'lifetime';
  }
  
  interface CreateInvoiceResponse {
    success: boolean;
    invoiceUrl?: string;
    error?: string;
  }
  
  class TelegramStarsPaymentService {
    private supabaseUrl: string;
    
    constructor() {
      this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    }
    
    async createInvoice(planType: 'monthly' | 'annually' | 'lifetime'): Promise<string> {
      const telegramUserId = getTelegramUserId();
      if (!telegramUserId) {
        throw new Error('Telegram user ID not available');
      }
      
      // Получаем JWT токен для аутентификации
      const jwtToken = await this.getJWTToken();
      
      const response = await fetch(`${this.supabaseUrl}/functions/v1/create-premium-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ planType })
      });
      
      const data: CreateInvoiceResponse = await response.json();
      
      if (!data.success || !data.invoiceUrl) {
        throw new Error(data.error || 'Failed to create invoice');
      }
      
      return data.invoiceUrl;
    }
    
    async openInvoice(invoiceUrl: string): Promise<'paid' | 'cancelled' | 'failed' | 'pending'> {
      return new Promise((resolve) => {
        if (!window.Telegram?.WebApp?.openInvoice) {
          resolve('failed');
          return;
        }
        
        window.Telegram.WebApp.openInvoice(invoiceUrl, (status) => {
          resolve(status as 'paid' | 'cancelled' | 'failed' | 'pending');
        });
      });
    }
    
    async handlePaymentResult(
      status: 'paid' | 'cancelled' | 'failed' | 'pending',
      planType: 'monthly' | 'annually' | 'lifetime'
    ): Promise<void> {
      if (status === 'paid') {
        // Обновляем premium статус локально
        localStorage.setItem('user-premium-status', 'true');
        localStorage.setItem('user-premium-plan', planType);
        
        // Синхронизируем с Supabase
        await this.syncPremiumStatus();
        
        // Отправляем событие для обновления UI
        window.dispatchEvent(new CustomEvent('premium:activated', { detail: { planType } }));
      }
    }
    
    private async getJWTToken(): Promise<string> {
      // Используем существующий authService если есть
      // Или получаем из localStorage
      const token = localStorage.getItem('supabase-auth-token');
      if (token) return token;
      
      // Если нет токена, нужно аутентифицироваться через auth-telegram
      throw new Error('JWT token not available. Please authenticate first.');
    }
    
    private async syncPremiumStatus(): Promise<void> {
      // Используем существующий sync service для синхронизации статуса
      // Это будет реализовано в этапе 4
    }
  }
  
  export const telegramStarsPaymentService = new TelegramStarsPaymentService();
  ```

#### 3.2 Обновление PaymentsScreen
- [ ] Импортировать `telegramStarsPaymentService` в `components/PaymentsScreen.tsx`
- [ ] Заменить функцию `handlePurchase`:
  ```typescript
  const handlePurchase = async () => {
    try {
      console.log('Starting Premium purchase process...', { plan: selectedPlan });
      setIsLoading(true);

      // Тактильная обратная связь
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }

      // Создаем инвойс
      const invoiceUrl = await telegramStarsPaymentService.createInvoice(selectedPlan);
      
      // Открываем инвойс в Telegram
      const paymentStatus = await telegramStarsPaymentService.openInvoice(invoiceUrl);
      
      // Обрабатываем результат
      await telegramStarsPaymentService.handlePaymentResult(paymentStatus, selectedPlan);
      
      if (paymentStatus === 'paid') {
        // Показываем успешное сообщение
        alert(content.payments.messages.successWithPlan);
        // Вызываем callback для обновления UI
        onPurchaseComplete();
      } else if (paymentStatus === 'cancelled') {
        // Пользователь отменил оплату - ничего не делаем
        console.log('Payment cancelled by user');
      } else {
        // Ошибка оплаты
        alert(content.payments.messages.error);
      }

    } catch (error) {
      console.error('Error purchasing Premium:', error);
      alert(content.payments.messages.error);
    } finally {
      setIsLoading(false);
    }
  };
  ```
- [ ] Добавить обработчик события `premium:activated` для обновления UI:
  ```typescript
  useEffect(() => {
    const handlePremiumActivated = () => {
      // Обновляем состояние premium
      // Это будет реализовано в этапе 4
    };
    
    window.addEventListener('premium:activated', handlePremiumActivated);
    return () => window.removeEventListener('premium:activated', handlePremiumActivated);
  }, []);
  ```
- [ ] Добавить обработку ошибок сети с retry логикой
- [ ] Добавить валидацию доступности Telegram WebApp API перед началом оплаты

#### 3.3 Обновление типов TypeScript
- [ ] Добавить типы для платежей в `types/telegram-webapp.d.ts`:
  ```typescript
  openInvoice: (url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void;
  ```
- [ ] Создать `types/payments.ts` с типами для планов и платежей

### Этап 4: Синхронизация Premium статуса (1-2 дня)

#### 4.1 Обновление Supabase Sync
- [ ] Добавить синхронизацию premium статуса в `supabaseSyncService.ts`
- [ ] Обновить `get-user-data` Edge Function для возврата premium статуса
- [ ] Обновить `sync-user-data` Edge Function для синхронизации premium статуса

#### 4.2 Обновление локального состояния
- [ ] Обновить `userStateManager.ts` для работы с premium статусом
- [ ] Добавить проверку premium статуса при загрузке приложения
- [ ] Реализовать автоматическое обновление статуса после успешной оплаты

#### 4.3 Обновление компонентов
- [ ] Обновить все компоненты, которые проверяют premium статус:
  - `HomeScreen.tsx` - отображение статуса
  - `ThemeHomeScreen.tsx` - блокировка premium тем
  - `PaymentsScreen.tsx` - показ текущего плана
- [ ] Убедиться, что premium контент разблокируется после оплаты

### Этап 5: Тестирование и отладка (2-3 дня)

#### 5.1 Тестирование в тестовой среде Telegram
- [ ] Настроить тестового бота для платежей
- [ ] Протестировать создание инвойсов
- [ ] Протестировать полный цикл оплаты:
  - Создание инвойса
  - Открытие в Mini App
  - Обработка pre_checkout_query
  - Обработка successful_payment
  - Активация premium
- [ ] Протестировать обработку ошибок и отмены

#### 5.2 Интеграционное тестирование
- [ ] Тестирование синхронизации premium статуса между устройствами
- [ ] Тестирование истечения подписок
- [ ] Тестирование повторных покупок
- [ ] Тестирование edge cases (сетевые ошибки, таймауты)

#### 5.3 E2E тестирование
- [ ] Создать Playwright тесты для платежного флоу
- [ ] Протестировать UI компоненты
- [ ] Протестировать интеграцию с Supabase

### Этап 6: Подготовка к продакшену (1-2 дня)

#### 6.1 Обновление конфигурации
- [ ] Настроить production Bot Token
- [ ] Настроить production webhook URL
- [ ] Обновить цены в Stars (если необходимо)
- [ ] Настроить мониторинг платежей

#### 6.2 Документация
- [ ] Обновить документацию по платежам
- [ ] Создать инструкцию для поддержки пользователей
- [ ] Документировать процесс возврата средств

#### 6.3 Безопасность
- [ ] Проверить валидацию всех входящих запросов
- [ ] Убедиться в правильной обработке секретных токенов
- [ ] Проверить защиту от дублирования платежей

## Технические детали

### Структура инвойса

```typescript
interface PremiumInvoice {
  title: string; // "Premium Subscription - Monthly"
  description: string; // Описание подписки
  payload: string; // Уникальный идентификатор заказа (JSON)
  provider_token: string; // Пустая строка для цифровых товаров
  currency: "XTR"; // Обязательно XTR для Stars
  prices: Array<{
    label: string; // "Premium Monthly"
    amount: number; // Количество Stars (например, 150)
  }>;
  max_tip_amount?: number; // Опционально
  suggested_tip_amounts?: number[]; // Опционально
  provider_data?: string; // Дополнительные данные
  photo_url?: string; // URL фото для инвойса
  photo_size?: number;
  photo_width?: number;
  photo_height?: number;
  need_name?: boolean; // false для цифровых товаров
  need_phone_number?: boolean; // false для цифровых товаров
  need_email?: boolean; // false для цифровых товаров
  need_shipping_address?: boolean; // false для цифровых товаров
  send_phone_number_to_provider?: boolean; // false
  send_email_to_provider?: boolean; // false
  is_flexible?: boolean; // false для фиксированных цен
}
```

### Пример создания инвойса через Bot API

```typescript
// В Supabase Edge Function
const invoiceUrl = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Premium Monthly Subscription',
    description: 'Unlock all themes and premium features',
    payload: JSON.stringify({ 
      planId: 'monthly',
      userId: telegramUserId,
      timestamp: Date.now()
    }),
    provider_token: '', // Пустая для цифровых товаров
    currency: 'XTR',
    prices: [{ label: 'Premium Monthly', amount: 150 }]
  })
}).then(r => r.json()).then(r => r.result);
```

### Пример открытия инвойса в Mini App

```typescript
// В React компоненте
const handlePurchase = async () => {
  try {
    setIsLoading(true);
    
    // Создать инвойс через наш API
    const invoiceUrl = await createPremiumInvoice(selectedPlan);
    
    // Открыть инвойс в Telegram
    if (window.Telegram?.WebApp?.openInvoice) {
      window.Telegram.WebApp.openInvoice(invoiceUrl, (status) => {
        handlePaymentResult(status, selectedPlan);
      });
    } else {
      throw new Error('Telegram WebApp API not available');
    }
  } catch (error) {
    console.error('Payment error:', error);
    showError(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

### Обработка webhook от Telegram

```typescript
// В Supabase Edge Function handle-payment-webhook
if (update.pre_checkout_query) {
  const query = update.pre_checkout_query;
  
  // Парсим payload
  const payload = JSON.parse(query.invoice_payload);
  
  // Проверяем доступность товара
  const canProcess = await checkPlanAvailability(payload.planId);
  
  // Отвечаем в течение 10 секунд!
  await answerPreCheckoutQuery(query.id, canProcess, {
    error_message: canProcess ? undefined : 'This plan is currently unavailable'
  });
}

if (update.message?.successful_payment) {
  const payment = update.message.successful_payment;
  const payload = JSON.parse(payment.invoice_payload);
  
  // Активируем premium подписку
  await activatePremiumSubscription({
    telegramUserId: update.message.from.id,
    planId: payload.planId,
    paymentChargeId: payment.telegram_payment_charge_id,
    invoiceMessageId: update.message.message_id
  });
}
```

## Риски и митигация

### Риск 1: Таймаут при обработке pre_checkout_query
**Митигация**: 
- Использовать быстрые проверки (кеш, простые запросы к БД)
- Обрабатывать запросы асинхронно, но отвечать синхронно
- Мониторинг времени ответа

### Риск 2: Дублирование платежей
**Митигация**:
- Использовать уникальные `telegram_payment_charge_id`
- Проверять существующие платежи перед активацией
- Использовать idempotency keys

### Риск 3: Потеря данных при сбое
**Митигация**:
- Логировать все платежные операции
- Сохранять промежуточные состояния
- Реализовать механизм восстановления

### Риск 4: Несоответствие цен
**Митигация**:
- Хранить цены в одном месте (конфигурация)
- Валидировать цены при создании инвойса
- Тестировать с разными планами

## Метрики и мониторинг

### Ключевые метрики:
- Количество созданных инвойсов
- Конверсия (созданные → оплаченные)
- Время обработки pre_checkout_query
- Количество ошибок платежей
- Количество активированных подписок
- Выручка в Stars

### Логирование:
- Все запросы на создание инвойсов
- Все webhook события от Telegram
- Все активации подписок
- Все ошибки и исключения

## Следующие шаги после MVP

1. **Подписки с автопродлением**: Реализовать автоматическое продление monthly/annual подписок
2. **Возвраты средств**: Реализовать функционал возврата через `refundStarPayment`
3. **Промокоды**: Интегрировать систему промокодов для скидок
4. **Аналитика**: Добавить детальную аналитику платежей
5. **Уведомления**: Уведомления об истечении подписки
6. **История платежей**: Показ истории покупок пользователю

## Временная оценка

- **Этап 1**: 1-2 дня
- **Этап 2**: 2-3 дня
- **Этап 3**: 2-3 дня
- **Этап 4**: 1-2 дня
- **Этап 5**: 2-3 дня
- **Этап 6**: 1-2 дня

**Итого**: 9-15 рабочих дней

## Зависимости

- Telegram Bot API доступен и работает
- Supabase Edge Functions настроены и работают
- Telegram WebApp API доступен в приложении
- База данных Supabase настроена и доступна

## Примечания

- Все цены в Stars должны быть согласованы с бизнесом
- Необходимо протестировать в тестовой среде Telegram перед продакшеном
- Важно соблюдать требования Telegram по обработке платежей (10 секунд на pre_checkout_query)
- Для цифровых товаров ОБЯЗАТЕЛЬНО использовать только Telegram Stars (XTR)
