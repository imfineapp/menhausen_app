ALTER TABLE reward_rules
ADD COLUMN IF NOT EXISTS max_payload_points INTEGER NOT NULL DEFAULT 0;

UPDATE reward_rules
SET event_type = 'achievement_unlock'
WHERE event_type = 'achievement_xp';

UPDATE reward_rules
SET points = 0,
    max_payload_points = 7000
WHERE event_type = 'achievement_unlock';

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
  v_payload_points INTEGER;
  v_reward_tx reward_transactions%ROWTYPE;
  v_balance INTEGER;
  v_now TIMESTAMPTZ := NOW();
  v_existing_id UUID;
  v_payload_cap INTEGER;
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

  v_payload_points := NULL;
  BEGIN
    IF p_payload ? 'points' THEN
      v_payload_points := NULLIF(trim(p_payload->>'points'), '')::INTEGER;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_payload_points := NULL;
  END;

  IF v_rule.points > 0 THEN
    v_points := v_rule.points;
  ELSE
    v_payload_cap := COALESCE(NULLIF(v_rule.max_payload_points, 0), 500);
    v_points := LEAST(GREATEST(COALESCE(v_payload_points, 0), 0), v_payload_cap);
  END IF;

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
