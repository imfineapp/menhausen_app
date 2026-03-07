-- Add home_tour_completed to app_flow_progress for syncing home tour state across devices
ALTER TABLE app_flow_progress
ADD COLUMN IF NOT EXISTS home_tour_completed BOOLEAN DEFAULT false;
