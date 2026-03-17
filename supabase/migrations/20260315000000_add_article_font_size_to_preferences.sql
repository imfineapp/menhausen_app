-- Add article font size step to user_preferences (-1 = small, 0 = medium, 1 = large)
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS article_font_size SMALLINT DEFAULT 0;

COMMENT ON COLUMN user_preferences.article_font_size IS 'Article body text size step: -1 small, 0 medium, 1 large';
