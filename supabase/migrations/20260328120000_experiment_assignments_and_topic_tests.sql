-- Experiment assignments (A/B/C onboarding) and per-topic test results (Segment C)
-- Migration: 20260328120000_experiment_assignments_and_topic_tests

CREATE TABLE IF NOT EXISTS experiment_assignments (
  telegram_user_id BIGINT NOT NULL
    REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  experiment_key VARCHAR(100) NOT NULL DEFAULT 'onboarding_flow_v1',
  variant CHAR(1) NOT NULL CHECK (variant IN ('A', 'B', 'C')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (telegram_user_id, experiment_key)
);

CREATE TABLE IF NOT EXISTS topic_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL
    REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  topic_id VARCHAR(50) NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  score INTEGER NOT NULL DEFAULT 0,
  percentage INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (telegram_user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_test_results_user ON topic_test_results(telegram_user_id);

CREATE TRIGGER update_experiment_assignments_updated_at
  BEFORE UPDATE ON experiment_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_test_results_updated_at
  BEFORE UPDATE ON topic_test_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own experiment assignments"
ON experiment_assignments FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can insert own experiment assignments"
ON experiment_assignments FOR INSERT
TO authenticated
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can update own experiment assignments"
ON experiment_assignments FOR UPDATE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt())
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can view own topic test results"
ON topic_test_results FOR SELECT
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can insert own topic test results"
ON topic_test_results FOR INSERT
TO authenticated
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

CREATE POLICY "Users can update own topic test results"
ON topic_test_results FOR UPDATE
TO authenticated
USING (telegram_user_id = get_telegram_user_id_from_jwt())
WITH CHECK (telegram_user_id = get_telegram_user_id_from_jwt());

COMMENT ON TABLE experiment_assignments IS 'A/B/C experiment variant per user (deterministic assignment synced from client)';
COMMENT ON TABLE topic_test_results IS 'Embedded topic-specific psych test results (Segment C)';
