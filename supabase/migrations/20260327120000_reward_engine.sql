-- Reward engine: append-only ledger + declarative rules + centralized granting function

CREATE TABLE IF NOT EXISTS reward_rules (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(120) NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 0,
  cooldown_seconds INTEGER NOT NULL DEFAULT 0,
  max_per_user INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  event_type VARCHAR(120) NOT NULL,
  reference_id VARCHAR(255) NOT NULL,
  points INTEGER NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(telegram_user_id, event_type, reference_id)
);

CREATE INDEX IF NOT EXISTS idx_reward_transactions_user_time
  ON reward_transactions(telegram_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reward_transactions_event
  ON reward_transactions(event_type);

CREATE TRIGGER update_reward_rules_updated_at BEFORE UPDATE ON reward_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE reward_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reward_rules_select_all ON reward_rules;
CREATE POLICY reward_rules_select_all ON reward_rules
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS reward_transactions_select_own ON reward_transactions;
CREATE POLICY reward_transactions_select_own ON reward_transactions
  FOR SELECT TO authenticated
  USING (telegram_user_id = get_telegram_user_id_from_jwt());

INSERT INTO reward_rules (event_type, points, cooldown_seconds, enabled)
VALUES
  ('daily_checkin', 10, 86400, true),
  ('card_complete_level_1', 10, 0, true),
  ('card_complete_level_2', 20, 0, true),
  ('card_complete_level_3', 30, 0, true),
  ('card_complete_level_4', 40, 0, true),
  ('card_complete_level_5', 50, 0, true),
  ('achievement_xp', 0, 0, true)
ON CONFLICT (event_type) DO NOTHING;

CREATE OR REPLACE FUNCTION grant_reward(
  p_telegram_user_id BIGINT,
  p_event_type VARCHAR(120),
  p_reference_id VARCHAR(255),
  p_payload JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rule reward_rules%ROWTYPE;
  v_points INTEGER;
  v_reward_tx reward_transactions%ROWTYPE;
  v_balance INTEGER;
  v_now TIMESTAMPTZ := NOW();
  v_existing_id UUID;
BEGIN
  IF p_telegram_user_id IS NULL OR p_telegram_user_id <= 0 THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'invalid_user');
  END IF;

  IF p_event_type IS NULL OR length(trim(p_event_type)) = 0 THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'invalid_event_type');
  END IF;

  IF p_reference_id IS NULL OR length(trim(p_reference_id)) = 0 THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'invalid_reference_id');
  END IF;

  SELECT *
  INTO v_rule
  FROM reward_rules
  WHERE event_type = p_event_type
    AND enabled = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'rule_not_found');
  END IF;

  SELECT id
  INTO v_existing_id
  FROM reward_transactions
  WHERE telegram_user_id = p_telegram_user_id
    AND event_type = p_event_type
    AND reference_id = p_reference_id
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    SELECT COALESCE(balance, 0)
    INTO v_balance
    FROM user_points
    WHERE telegram_user_id = p_telegram_user_id;

    RETURN jsonb_build_object(
      'granted', false,
      'reason', 'already_granted',
      'balance', COALESCE(v_balance, 0),
      'transaction_id', v_existing_id
    );
  END IF;

  IF v_rule.max_per_user > 0 THEN
    IF (
      SELECT COUNT(*)
      FROM reward_transactions
      WHERE telegram_user_id = p_telegram_user_id
        AND event_type = p_event_type
    ) >= v_rule.max_per_user THEN
      RETURN jsonb_build_object('granted', false, 'reason', 'max_per_user_reached');
    END IF;
  END IF;

  IF v_rule.cooldown_seconds > 0 THEN
    IF EXISTS (
      SELECT 1
      FROM reward_transactions
      WHERE telegram_user_id = p_telegram_user_id
        AND event_type = p_event_type
        AND created_at > (v_now - make_interval(secs => v_rule.cooldown_seconds))
    ) THEN
      RETURN jsonb_build_object('granted', false, 'reason', 'cooldown_active');
    END IF;
  END IF;

  v_points := COALESCE(NULLIF((p_payload->>'points')::INTEGER, 0), v_rule.points, 0);
  IF v_points <= 0 THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'non_positive_points');
  END IF;

  INSERT INTO reward_transactions (
    telegram_user_id,
    event_type,
    reference_id,
    points,
    metadata
  )
  VALUES (
    p_telegram_user_id,
    p_event_type,
    p_reference_id,
    v_points,
    COALESCE(p_payload, '{}'::jsonb)
  )
  RETURNING *
  INTO v_reward_tx;

  INSERT INTO user_points (telegram_user_id, balance)
  VALUES (p_telegram_user_id, v_points)
  ON CONFLICT (telegram_user_id)
  DO UPDATE SET balance = user_points.balance + EXCLUDED.balance;

  SELECT balance
  INTO v_balance
  FROM user_points
  WHERE telegram_user_id = p_telegram_user_id;

  -- Keep legacy points_transactions table in sync during migration.
  INSERT INTO points_transactions (
    telegram_user_id,
    transaction_id,
    type,
    amount,
    balance_after,
    note,
    correlation_id,
    timestamp
  )
  VALUES (
    p_telegram_user_id,
    v_reward_tx.id::TEXT,
    'earn',
    v_points,
    COALESCE(v_balance, 0),
    COALESCE(p_payload->>'note', NULL),
    p_event_type || ':' || p_reference_id,
    v_now
  )
  ON CONFLICT (telegram_user_id, transaction_id) DO NOTHING;

  RETURN jsonb_build_object(
    'granted', true,
    'reason', 'granted',
    'points', v_points,
    'balance', COALESCE(v_balance, 0),
    'transaction_id', v_reward_tx.id,
    'event_type', p_event_type,
    'reference_id', p_reference_id,
    'created_at', v_reward_tx.created_at
  );
END;
$$;
