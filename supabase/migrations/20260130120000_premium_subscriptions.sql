-- Premium Subscriptions table for Telegram Stars payments
-- Migration: 20260130120000_premium_subscriptions
-- Purpose: Store premium subscription information with bot identification and test/production separation

-- Create premium_subscriptions table
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  bot_id BIGINT, -- ID бота, через который была произведена оплата
  bot_username VARCHAR(255), -- Username бота (опционально, для удобства в отчётах)
  is_test_payment BOOLEAN NOT NULL DEFAULT false, -- true = тестовая среда; не даёт премиум в продакшене
  plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'annually', 'lifetime')),
  telegram_payment_charge_id VARCHAR(255) UNIQUE, -- Уникальный ID платежа от Telegram
  invoice_message_id INTEGER, -- ID сообщения с инвойсом
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'refunded')),
  starts_at TIMESTAMPTZ, -- Дата начала подписки
  expires_at TIMESTAMPTZ, -- NULL для lifetime планов
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user_id ON premium_subscriptions(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_status ON premium_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_bot_id ON premium_subscriptions(bot_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_is_test ON premium_subscriptions(is_test_payment);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_active ON premium_subscriptions(telegram_user_id, status) 
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_expires ON premium_subscriptions(expires_at) 
  WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_bot_user ON premium_subscriptions(bot_id, telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_active_production ON premium_subscriptions(telegram_user_id, is_test_payment, status)
  WHERE status = 'active' AND is_test_payment = false;

-- Добавление поля has_premium в таблицу users (если еще нет)
-- Это поле обновляется только продакшен-подписками (is_test_payment = false)
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

-- Функция для обновления has_premium в users только по продакшен-подпискам
-- Тестовые оплаты (is_test_payment = true) не влияют на users.has_premium
CREATE OR REPLACE FUNCTION update_user_premium_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Обновляем has_premium только для продакшен-подписок
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

-- Триггер для автоматического обновления has_premium
CREATE TRIGGER update_user_premium_status_trigger
  AFTER INSERT OR UPDATE OF status ON premium_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_premium_status();

-- RLS политики (если RLS включен)
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON premium_subscriptions FOR SELECT
  TO authenticated
  USING (telegram_user_id = get_telegram_user_id_from_jwt());

-- INSERT и UPDATE будут выполняться через Edge Functions с Service Role Key
-- Поэтому не создаём политики для INSERT/UPDATE - они выполняются от имени service_role

-- Комментарии к таблице и полям
COMMENT ON TABLE premium_subscriptions IS 'Premium subscriptions purchased via Telegram Stars payments';
COMMENT ON COLUMN premium_subscriptions.bot_id IS 'ID бота, через который была произведена оплата';
COMMENT ON COLUMN premium_subscriptions.bot_username IS 'Username бота (опционально, для удобства в отчётах)';
COMMENT ON COLUMN premium_subscriptions.is_test_payment IS 'true = тестовая оплата (не даёт премиум в продакшене), false = продакшен оплата';
COMMENT ON COLUMN premium_subscriptions.telegram_payment_charge_id IS 'Уникальный ID платежа от Telegram (для защиты от дублирования и возвратов)';
COMMENT ON COLUMN premium_subscriptions.invoice_message_id IS 'ID сообщения с инвойсом в Telegram';
