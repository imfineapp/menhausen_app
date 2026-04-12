-- Add breathing_46_completed reward rule (15 points, 4 hour cooldown)
INSERT INTO reward_rules (event_type, points, cooldown_seconds, enabled)
VALUES ('breathing_46_completed', 15, 14400, true)
ON CONFLICT (event_type) DO NOTHING;