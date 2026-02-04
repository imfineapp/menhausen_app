-- Migration: 20260204140608_add_get_user_complete_data_function
-- Description: Add PostgreSQL function to fetch all user data in a single query using JSON aggregation
-- This optimizes the data loading process by reducing multiple queries to one

CREATE OR REPLACE FUNCTION get_user_complete_data(p_telegram_user_id BIGINT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    -- Basic user info
    'telegramUserId', u.telegram_user_id,
    'createdAt', u.created_at,
    'lastSyncAt', u.last_sync_at,
    
    -- Survey results
    'surveyResults', (
      SELECT json_build_object(
        'screen01', sr.screen01,
        'screen02', sr.screen02,
        'screen03', sr.screen03,
        'screen04', sr.screen04,
        'screen05', sr.screen05,
        'completedAt', sr.completed_at
      )
      FROM survey_results sr
      WHERE sr.telegram_user_id = p_telegram_user_id
    ),
    
    -- Flow progress
    'flowProgress', (
      SELECT json_build_object(
        'onboardingCompleted', COALESCE(afp.onboarding_completed, false),
        'surveyCompleted', COALESCE(afp.survey_completed, false),
        'psychologicalTestCompleted', COALESCE(afp.psychological_test_completed, false),
        'pinEnabled', COALESCE(afp.pin_enabled, false),
        'pinCompleted', COALESCE(afp.pin_completed, false),
        'firstCheckinDone', COALESCE(afp.first_checkin_done, false),
        'firstRewardShown', COALESCE(afp.first_reward_shown, false)
      )
      FROM app_flow_progress afp
      WHERE afp.telegram_user_id = p_telegram_user_id
    ),
    
    -- Preferences
    'preferences', (
      SELECT json_build_object(
        'language', COALESCE(up.language, 'en'),
        'theme', COALESCE(up.theme, 'light'),
        'notifications', COALESCE(up.notifications, true),
        'analytics', COALESCE(up.analytics, false)
      )
      FROM user_preferences up
      WHERE up.telegram_user_id = p_telegram_user_id
    ),
    
    -- Daily checkins (as object with date_key as key)
    'dailyCheckins', COALESCE(
      (SELECT json_object_agg(
        dc.date_key,
        json_build_object(
          'mood', dc.mood,
          'value', dc.value,
          'color', dc.color,
          'completed', COALESCE(dc.completed, true)
        )
      )
      FROM daily_checkins dc
      WHERE dc.telegram_user_id = p_telegram_user_id),
      '{}'::json
    ),
    
    -- User stats
    'userStats', (
      SELECT json_build_object(
        'version', COALESCE(us.version, 1),
        'checkins', COALESCE(us.checkins, 0),
        'checkinStreak', COALESCE(us.checkin_streak, 0),
        'lastCheckinDate', us.last_checkin_date,
        'cardsOpened', COALESCE(us.cards_opened, '{}'::jsonb),
        'topicsCompleted', COALESCE(us.topics_completed, '[]'::jsonb),
        'cardsRepeated', COALESCE(us.cards_repeated, '{}'::jsonb),
        'topicsRepeated', COALESCE(us.topics_repeated, '[]'::jsonb),
        'articlesRead', COALESCE(us.articles_read, 0),
        'readArticleIds', COALESCE(us.read_article_ids, '[]'::jsonb),
        'openedCardIds', COALESCE(us.opened_card_ids, '[]'::jsonb),
        'referralsInvited', COALESCE(us.referrals_invited, 0),
        'referralsPremium', COALESCE(us.referrals_premium, 0),
        'lastUpdated', us.last_updated
      )
      FROM user_stats us
      WHERE us.telegram_user_id = p_telegram_user_id
    ),
    
    -- Achievements
    'achievements', (
      SELECT json_build_object(
        'version', COALESCE(ua.version, 1),
        'achievements', COALESCE(ua.achievements, '{}'::jsonb),
        'totalXP', COALESCE(ua.total_xp, 0),
        'unlockedCount', COALESCE(ua.unlocked_count, 0)
      )
      FROM user_achievements ua
      WHERE ua.telegram_user_id = p_telegram_user_id
    ),
    
    -- Points
    'points', (
      SELECT json_build_object(
        'balance', COALESCE(upoints.balance, 0),
        'transactions', COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', pt.transaction_id,
              'type', pt.type,
              'amount', pt.amount,
              'balanceAfter', pt.balance_after,
              'note', pt.note,
              'correlationId', pt.correlation_id,
              'timestamp', pt.timestamp
            ) ORDER BY pt.timestamp ASC
          )
          FROM points_transactions pt
          WHERE pt.telegram_user_id = p_telegram_user_id),
          '[]'::json
        )
      )
      FROM user_points upoints
      WHERE upoints.telegram_user_id = p_telegram_user_id
    ),
    
    -- Psychological test
    'psychologicalTest', (
      SELECT json_build_object(
        'lastCompletedAt', ptr.last_completed_at,
        'scores', COALESCE(ptr.scores, '{}'::jsonb),
        'percentages', COALESCE(ptr.percentages, '{}'::jsonb),
        'history', COALESCE(ptr.history, '[]'::jsonb)
      )
      FROM psychological_test_results ptr
      WHERE ptr.telegram_user_id = p_telegram_user_id
    ),
    
    -- Card progress
    'cardProgress', COALESCE(
      (SELECT json_object_agg(
        cp.card_id,
        json_build_object(
          'cardId', cp.card_id,
          'completedAttempts', COALESCE(cp.completed_attempts, '[]'::jsonb),
          'isCompleted', COALESCE(cp.is_completed, false),
          'totalCompletedAttempts', COALESCE(cp.total_completed_attempts, 0)
        )
      )
      FROM card_progress cp
      WHERE cp.telegram_user_id = p_telegram_user_id),
      '{}'::json
    ),
    
    -- Referral data
    'referralData', (
      SELECT json_build_object(
        'referredBy', rd.referred_by,
        'referralCode', rd.referral_code,
        'referralRegistered', COALESCE(rd.referral_registered, false),
        'referralList', COALESCE(rd.referral_list, '[]'::jsonb)
      )
      FROM referral_data rd
      WHERE rd.telegram_user_id = p_telegram_user_id
    )
  ) INTO result
  FROM users u
  WHERE u.telegram_user_id = p_telegram_user_id;
  
  -- Return empty object if user doesn't exist
  RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment to function
COMMENT ON FUNCTION get_user_complete_data(BIGINT) IS 'Fetches all user data in a single JSON object. Optimized for fast data loading on app initialization.';
