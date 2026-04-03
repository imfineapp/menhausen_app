/**
 * Points required per article after the first three (order 1–3 are free).
 * Gating uses **wallet balance** (`user_points` / `$pointsBalance`), which grows from
 * check-ins, card rewards, and achievement grants — faster than achievement-XP-only totals.
 * Tune this constant to keep a similar progression feel to the old `(order - 3) * 1000` on achievement XP.
 */
export const ARTICLE_UNLOCK_POINTS_STEP = 1000

export function getRequiredPointsForArticle(orderOrIndex: number): number {
  // Первые 3 статьи (1..3) открыты бесплатно; с 4-й — шаг по ARTICLE_UNLOCK_POINTS_STEP
  const index = Math.max(1, Math.floor(orderOrIndex));
  const steps = Math.max(0, index - 3)
  return steps * ARTICLE_UNLOCK_POINTS_STEP
}

/**
 * @param walletBalance — server-aligned balance from `PointsManager` / `$pointsBalance` (not achievement `totalPointsFromAchievements`).
 * If `spendPoints` is ever used in production, consider gating on lifetime earned instead of current balance.
 */
export function isArticleLocked(orderOrIndex: number, walletBalance: number): boolean {
  const required = getRequiredPointsForArticle(orderOrIndex)
  return required > (walletBalance || 0)
}