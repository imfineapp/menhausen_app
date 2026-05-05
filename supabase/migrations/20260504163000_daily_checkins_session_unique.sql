-- Restore a target for PostgREST upsert after multi_checkin_sessions dropped UNIQUE(user, date_key).
-- sync-user-data uses ON CONFLICT (telegram_user_id, session_id).

-- Legacy rows: exactly one check-in per (user, day) → use date_key as stable session_id for client upserts
WITH singletons AS (
  SELECT telegram_user_id, date_key
  FROM daily_checkins
  GROUP BY telegram_user_id, date_key
  HAVING COUNT(*) = 1
)
UPDATE daily_checkins dc
SET session_id = dc.date_key
FROM singletons s
WHERE dc.telegram_user_id = s.telegram_user_id
  AND dc.date_key = s.date_key
  AND dc.session_id IS DISTINCT FROM dc.date_key;

UPDATE daily_checkins
SET session_id = id::text
WHERE session_id IS NULL OR trim(session_id) = '';

-- If any duplicate (telegram_user_id, session_id) remains, keep the oldest row and reset others to id::text
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY telegram_user_id, session_id
      ORDER BY created_at NULLS LAST, id
    ) AS rn
  FROM daily_checkins
)
UPDATE daily_checkins dc
SET session_id = dc.id::text
FROM ranked r
WHERE dc.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS daily_checkins_telegram_user_id_session_id_key
  ON daily_checkins (telegram_user_id, session_id);
