# Хранение статуса премиума

## Где хранится информация о премиуме

### 1. База данных (Supabase) - Источник истины

#### Таблица `users`
```sql
users.has_premium BOOLEAN DEFAULT false
```
- **Обновляется автоматически** через триггер при изменении подписок
- **Только для продакшен-подписок** (`is_test_payment = false`)
- Тестовые подписки (`is_test_payment = true`) **не обновляют** это поле

#### Таблица `premium_subscriptions`
```sql
premium_subscriptions (
  id UUID,
  telegram_user_id BIGINT,
  bot_id BIGINT,
  bot_username VARCHAR(255),
  is_test_payment BOOLEAN,  -- true = тестовая оплата
  plan_type VARCHAR(20),    -- 'monthly', 'annually', 'lifetime'
  status VARCHAR(20),       -- 'pending', 'active', 'expired', 'cancelled', 'refunded'
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,  -- NULL для lifetime
  telegram_payment_charge_id VARCHAR(255),
  ...
)
```
- Хранит **все подписки** (и тестовые, и продакшен)
- Используется для проверки активных подписок

### 2. Локальное хранилище (localStorage) - Кэш на фронтенде

```javascript
localStorage.setItem('user-premium-status', 'true');
localStorage.setItem('user-premium-plan', 'monthly'); // или 'annually', 'lifetime'
localStorage.setItem('user-premium-purchased-at', '2026-02-03T10:00:00.000Z');
```

**Обновляется:**
- После успешной оплаты (`telegramStarsPaymentService.handlePaymentResult`)
- При синхронизации с Supabase (`get-user-data`)

### 3. React State - Состояние приложения

```typescript
// В App.tsx
const [userHasPremium, setUserHasPremium] = useState<boolean>(false);
```

**Обновляется:**
- При загрузке данных из Supabase
- При получении события `premium:activated`
- При синхронизации

## Как работает синхронизация

### 1. После успешной оплаты

```typescript
// В telegramStarsPaymentService.ts
if (status === 'paid') {
  // 1. Обновляем localStorage
  localStorage.setItem('user-premium-status', 'true');
  localStorage.setItem('user-premium-plan', planType);
  
  // 2. Отправляем событие для обновления UI
  window.dispatchEvent(new CustomEvent('premium:activated', { 
    detail: { planType, timestamp: Date.now() } 
  }));
}
```

### 2. Webhook обрабатывает платеж

```typescript
// В handle-payment-webhook/index.ts
// 1. Создаётся запись в premium_subscriptions
// 2. Триггер автоматически обновляет users.has_premium (если is_test_payment = false)
```

### 3. При загрузке приложения

```typescript
// В get-user-data/index.ts
// 1. Определяется окружение (test/production) по bot_id
// 2. Для продакшена: возвращается users.has_premium
// 3. Для теста: проверяется наличие активной подписки с is_test_payment = true
// 4. Результат возвращается как hasPremium в ответе
```

### 4. Синхронизация с Supabase

```typescript
// В supabaseSyncService.ts (если реализовано)
// При синхронизации данных обновляется localStorage и React state
```

## Логика определения премиума

### Для продакшен бота:
```typescript
// Проверяется users.has_premium
// Обновляется только продакшен-подписками (is_test_payment = false)
const hasPremium = user.has_premium === true;
```

### Для тестового бота:
```typescript
// Проверяется наличие активной тестовой подписки
const { data: testSubscriptions } = await supabase
  .from('premium_subscriptions')
  .select('id')
  .eq('telegram_user_id', telegramUserId)
  .eq('status', 'active')
  .eq('is_test_payment', true)
  .limit(1);

const hasPremium = testSubscriptions && testSubscriptions.length > 0;
```

## Автоматическое обновление через триггер

```sql
-- Триггер автоматически обновляет users.has_premium
CREATE TRIGGER update_user_premium_status_trigger
  AFTER INSERT OR UPDATE OF status ON premium_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_premium_status();

-- Функция обновляет has_premium только для продакшен-подписок
CREATE OR REPLACE FUNCTION update_user_premium_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.is_test_payment = false THEN
    UPDATE users SET has_premium = true WHERE telegram_user_id = NEW.telegram_user_id;
  ELSIF NEW.status IN ('expired', 'cancelled', 'refunded') AND NEW.is_test_payment = false THEN
    -- Проверяем, есть ли другие активные продакшен-подписки
    IF NOT EXISTS (
      SELECT 1 FROM premium_subscriptions 
      WHERE telegram_user_id = NEW.telegram_user_id 
      AND status = 'active' 
      AND is_test_payment = false
      AND id != NEW.id
    ) THEN
      UPDATE users SET has_premium = false WHERE telegram_user_id = NEW.telegram_user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Проверка статуса премиума

### В коде компонентов:

```typescript
// Проверка через React state
if (userHasPremium) {
  // Показать премиум функции
}

// Проверка через localStorage (если нужно)
const premiumStatus = localStorage.getItem('user-premium-status') === 'true';
```

### SQL запросы для проверки:

```sql
-- Проверить статус премиума пользователя
SELECT telegram_user_id, has_premium 
FROM users 
WHERE telegram_user_id = <user_id>;

-- Проверить активные подписки
SELECT * FROM premium_subscriptions 
WHERE telegram_user_id = <user_id> 
AND status = 'active';

-- Проверить продакшен подписки
SELECT * FROM premium_subscriptions 
WHERE telegram_user_id = <user_id> 
AND status = 'active' 
AND is_test_payment = false;
```

## Важные моменты

1. **Источник истины:** База данных (`users.has_premium` для продакшена)
2. **Тестовые подписки:** Не обновляют `users.has_premium`, но хранятся в `premium_subscriptions`
3. **Автоматическое обновление:** Триггер обновляет `has_premium` при изменении подписок
4. **Кэширование:** localStorage используется как кэш на фронтенде
5. **Синхронизация:** При загрузке приложения данные синхронизируются с Supabase

## Схема потока данных

```
Платеж → Webhook → premium_subscriptions (INSERT)
                    ↓
              Триггер (если is_test_payment = false)
                    ↓
              users.has_premium = true
                    ↓
         get-user-data возвращает hasPremium
                    ↓
         localStorage обновляется
                    ↓
         React state обновляется
                    ↓
              UI обновляется
```
