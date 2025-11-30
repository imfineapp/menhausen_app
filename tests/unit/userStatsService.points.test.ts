import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadUserStats,
  saveUserStats,
  updateUserStats,
  incrementCheckin,
  markArticleRead,
  incrementReferralsInvited,
  incrementReferralsPremium,
  resetUserStats
} from '../../services/userStatsService';
import type { UserStats } from '../../types/achievements';

describe('userStatsService points & persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    resetUserStats();
  });

  it('loads default stats when empty', () => {
    const stats = loadUserStats();
    expect(stats.checkins).toBe(0);
    expect(stats.articlesRead).toBe(0);
    expect(stats.lastCheckinDate).toBeNull();
  });

  it('persists and loads stats', () => {
    const s1 = loadUserStats();
    const modified: UserStats = { ...s1, checkins: 3 };
    saveUserStats(modified);
    const s2 = loadUserStats();
    expect(s2.checkins).toBe(3);
    expect(typeof s2.lastUpdated).toBe('string');
  });

  it('updates via functional updater against latest snapshot', () => {
    updateUserStats({ checkins: 1 });
    const next = updateUserStats((cur) => ({ ...cur, checkins: cur.checkins + 1 }));
    expect(next.checkins).toBe(2);
  });

  it('incrementCheckin updates count and streak once per day', () => {
    const s1 = incrementCheckin();
    expect(s1.checkins).toBe(1);
    expect(s1.checkinStreak).toBe(1);
    const s2 = incrementCheckin();
    // повтор в тот же день не увеличивает
    expect(s2.checkins).toBe(1);
    expect(s2.checkinStreak).toBe(1);
  });

  it('markArticleRead is idempotent and aligns articlesRead with unique ids', () => {
    const a1 = markArticleRead('a1');
    expect(a1.articlesRead).toBe(1);
    const a2 = markArticleRead('a1');
    expect(a2.articlesRead).toBe(1);
    const a3 = markArticleRead('a2');
    expect(a3.articlesRead).toBe(2);
    expect(a3.readArticleIds).toEqual(['a1', 'a2']);
  });

  it('increments referral counters', () => {
    const r1 = incrementReferralsInvited();
    expect(r1.referralsInvited).toBe(1);
    const r2 = incrementReferralsPremium();
    expect(r2.referralsPremium).toBe(1);
  });
});