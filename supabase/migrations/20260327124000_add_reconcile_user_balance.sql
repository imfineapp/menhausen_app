-- Server-side balance reconciliation against reward_transactions ledger.
CREATE OR REPLACE FUNCTION reconcile_user_balance(
  p_telegram_user_id BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expected_balance INTEGER;
  v_current_balance INTEGER;
  v_reconciled BOOLEAN := false;
BEGIN
  IF p_telegram_user_id IS NULL OR p_telegram_user_id <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'invalid_user'
    );
  END IF;

  SELECT COALESCE(SUM(points), 0)
  INTO v_expected_balance
  FROM reward_transactions
  WHERE telegram_user_id = p_telegram_user_id;

  SELECT COALESCE(balance, 0)
  INTO v_current_balance
  FROM user_points
  WHERE telegram_user_id = p_telegram_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_points (telegram_user_id, balance)
    VALUES (p_telegram_user_id, v_expected_balance)
    ON CONFLICT (telegram_user_id)
    DO UPDATE SET balance = EXCLUDED.balance;
    v_current_balance := 0;
    v_reconciled := true;
  ELSIF v_current_balance <> v_expected_balance THEN
    UPDATE user_points
    SET balance = v_expected_balance
    WHERE telegram_user_id = p_telegram_user_id;
    v_reconciled := true;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'telegram_user_id', p_telegram_user_id,
    'expected_balance', v_expected_balance,
    'previous_balance', v_current_balance,
    'reconciled', v_reconciled,
    'balance', v_expected_balance
  );
END;
$$;
