-- Expire premium subscriptions whose period has ended.
-- The existing update_user_premium_status trigger clears users.has_premium when status becomes expired.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-premium-subscriptions') THEN
    PERFORM cron.unschedule('expire-premium-subscriptions');
  END IF;
END $$;

SELECT cron.schedule(
  'expire-premium-subscriptions',
  '0 * * * *',
  $$
    UPDATE premium_subscriptions
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at < NOW();
  $$
);
