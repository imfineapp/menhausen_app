import type { AppScreen } from '@/types/userState'
import { getAchievementMetadata } from '@/utils/achievementsMetadata'

const CARD_CONDITION_TYPES = new Set([
  'cards_opened',
  'topic_completed',
  'cards_repeated',
  'topic_repeated',
])

const STREAK_TYPES = new Set(['streak', 'streak_repeat'])

const ARTICLE_TYPES = new Set(['articles_read'])

const REFERRAL_TYPES = new Set(['referral_invite', 'referral_premium'])

export interface AchievementDisplayBuckets {
  cardRelated: string[]
  articleRelated: string[]
  streakRelated: string[]
  referralRelated: string[]
}

/**
 * Classify newly unlocked achievement ids by when/where the UI should show the reward.
 */
export function classifyAchievementsForDisplay(achievementIds: string[]): AchievementDisplayBuckets {
  const cardRelated: string[] = []
  const articleRelated: string[] = []
  const streakRelated: string[] = []
  const referralRelated: string[] = []

  for (const achievementId of achievementIds) {
    const metadata = getAchievementMetadata(achievementId)
    if (!metadata) continue

    const conditionType = metadata.conditionType
    const conditionTypes = Array.isArray(conditionType) ? conditionType : [conditionType]

    const hasCardConditions = conditionTypes.some((t) => CARD_CONDITION_TYPES.has(t))
    const hasArticle = conditionTypes.some((t) => ARTICLE_TYPES.has(t))
    const hasStreak = conditionTypes.some((t) => STREAK_TYPES.has(t))
    const hasReferral = conditionTypes.some((t) => REFERRAL_TYPES.has(t))

    if (hasCardConditions) {
      cardRelated.push(achievementId)
    }
    if (hasArticle) {
      articleRelated.push(achievementId)
    }
    if (!hasCardConditions && hasStreak) {
      streakRelated.push(achievementId)
    }
    if (hasReferral) {
      referralRelated.push(achievementId)
    }
  }

  return { cardRelated, articleRelated, streakRelated, referralRelated }
}

/**
 * Screens where automatic reward navigation is suppressed until user finishes a flow.
 */
export const BLOCKED_SCREENS_FOR_REWARD: AppScreen[] = [
  'onboarding1',
  'onboarding2',
  'survey01',
  'survey02',
  'survey03',
  'survey04',
  'survey05',
  'survey06',
  'psychological-test-preambula',
  'psychological-test-instruction',
  'psychological-test-question-01',
  'psychological-test-question-02',
  'psychological-test-question-03',
  'psychological-test-question-04',
  'psychological-test-question-05',
  'psychological-test-question-06',
  'psychological-test-question-07',
  'psychological-test-question-08',
  'psychological-test-question-09',
  'psychological-test-question-10',
  'psychological-test-question-11',
  'psychological-test-question-12',
  'psychological-test-question-13',
  'psychological-test-question-14',
  'psychological-test-question-15',
  'psychological-test-question-16',
  'psychological-test-question-17',
  'psychological-test-question-18',
  'psychological-test-question-19',
  'psychological-test-question-20',
  'psychological-test-question-21',
  'psychological-test-question-22',
  'psychological-test-question-23',
  'psychological-test-question-24',
  'psychological-test-question-25',
  'psychological-test-question-26',
  'psychological-test-question-27',
  'psychological-test-question-28',
  'psychological-test-question-29',
  'psychological-test-question-30',
  'psychological-test-results',
  'pin',
  'checkin',
  'reward',
  'card-welcome',
  'question-01',
  'question-02',
  'final-message',
  'rate-card',
]

/**
 * Whether to navigate to reward immediately vs defer (card/article/streak/referral rules).
 */
export function shouldShowRewardImmediately(
  currentScreen: AppScreen,
  buckets: AchievementDisplayBuckets
): boolean {
  const {
    cardRelated: cardRelatedAchievements,
    articleRelated: articleRelatedAchievements,
    streakRelated: streakRelatedAchievements,
    referralRelated: referralRelatedAchievements,
  } = buckets

  return !(
    (cardRelatedAchievements.length > 0 &&
      (currentScreen === 'card-details' || currentScreen === 'theme-home')) ||
    (articleRelatedAchievements.length > 0 && currentScreen === 'article') ||
    (streakRelatedAchievements.length > 0 && currentScreen === 'checkin') ||
    referralRelatedAchievements.length > 0
  )
}
