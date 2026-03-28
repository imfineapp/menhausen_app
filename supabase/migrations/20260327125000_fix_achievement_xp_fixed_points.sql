-- Make achievement_xp server-authoritative: fixed points, ignore client payload.
UPDATE reward_rules
SET points = 50
WHERE event_type = 'achievement_xp';
