import { describe, it, expect } from 'vitest';
import { getPointsForLevel, LEVEL_TO_POINTS } from '../../utils/pointsLevels';

describe('pointsLevels config', () => {
  it('returns correct points for levels 1-5', () => {
    expect(getPointsForLevel(1)).toBe(LEVEL_TO_POINTS[1]);
    expect(getPointsForLevel(2)).toBe(LEVEL_TO_POINTS[2]);
    expect(getPointsForLevel(3)).toBe(LEVEL_TO_POINTS[3]);
    expect(getPointsForLevel(4)).toBe(LEVEL_TO_POINTS[4]);
    expect(getPointsForLevel(5)).toBe(LEVEL_TO_POINTS[5]);
  });

  it('returns 0 for invalid levels', () => {
    expect(getPointsForLevel(0)).toBe(0);
    expect(getPointsForLevel(6)).toBe(0);
    expect(getPointsForLevel(-1)).toBe(0);
    expect(getPointsForLevel(1.5 as any)).toBe(0);
    expect(getPointsForLevel(NaN as any)).toBe(0);
  });
});


