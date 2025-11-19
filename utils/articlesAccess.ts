export function getRequiredPointsForArticle(orderOrIndex: number): number {
  // Первые 3 статьи (1..3) открыты бесплатно; с 4-й шаг по 1000
  const index = Math.max(1, Math.floor(orderOrIndex));
  const steps = Math.max(0, index - 3);
  return steps * 1000;
}

export function isArticleLocked(orderOrIndex: number, userPoints: number): boolean {
  const required = getRequiredPointsForArticle(orderOrIndex);
  return required > (userPoints || 0);
}














