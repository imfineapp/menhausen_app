import { describe, it, expect, beforeEach } from 'vitest';
import { PointsManager } from '../../utils/PointsManager';

describe('PointsManager levels', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sums only earn transactions', () => {
    PointsManager.earn(100);
    PointsManager.earn(200);
    PointsManager.spend(50);
    expect(PointsManager.getTotalEarned()).toBe(300);
  });

  it('next target thresholds (step 1000)', () => {
    expect(PointsManager.getNextLevelTarget(1000)).toBe(1000);

    // 1 -> 1000
    PointsManager.earn(1);
    expect(PointsManager.getTotalEarned()).toBe(1);
    expect(PointsManager.getNextLevelTarget(1000)).toBe(1000);

    // 999 -> 1000
    PointsManager.earn(998);
    expect(PointsManager.getTotalEarned()).toBe(999);
    expect(PointsManager.getNextLevelTarget(1000)).toBe(1000);

    // 1000 -> 2000
    PointsManager.earn(1);
    expect(PointsManager.getTotalEarned()).toBe(1000);
    expect(PointsManager.getNextLevelTarget(1000)).toBe(2000);

    // 1001 -> 2000
    PointsManager.earn(1);
    expect(PointsManager.getTotalEarned()).toBe(1001);
    expect(PointsManager.getNextLevelTarget(1000)).toBe(2000);
  });

  it('example 5863 -> target 6000', () => {
    PointsManager.earn(5863);
    expect(PointsManager.getTotalEarned()).toBe(5863);
    expect(PointsManager.getNextLevelTarget(1000)).toBe(6000);
  });
});


