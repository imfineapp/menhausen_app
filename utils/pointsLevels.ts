export const LEVEL_TO_POINTS: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50
};

export function getPointsForLevel(level: number): number {
  if (!Number.isInteger(level) || level < 1 || level > 5) return 0;
  return LEVEL_TO_POINTS[level as 1 | 2 | 3 | 4 | 5] ?? 0;
}


