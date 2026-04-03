import { describe, expect, it } from 'vitest';

import { RewardEventType } from '@/utils/supabaseSync/rewardService';

describe('RewardEventType contract', () => {
  it('contains expected built-in event names used by SQL seed', () => {
    expect(RewardEventType.DAILY_CHECKIN).toBe('daily_checkin');
    expect(RewardEventType.ACHIEVEMENT_UNLOCK).toBe('achievement_unlock');
    expect(RewardEventType.CARD_COMPLETE_LEVEL_1).toBe('card_complete_level_1');
    expect(RewardEventType.CARD_COMPLETE_LEVEL_2).toBe('card_complete_level_2');
    expect(RewardEventType.CARD_COMPLETE_LEVEL_3).toBe('card_complete_level_3');
    expect(RewardEventType.CARD_COMPLETE_LEVEL_4).toBe('card_complete_level_4');
    expect(RewardEventType.CARD_COMPLETE_LEVEL_5).toBe('card_complete_level_5');
  });
});
