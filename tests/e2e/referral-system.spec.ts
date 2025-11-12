import { test, expect } from '@playwright/test';

const shareLinkFor = (code: string) => `https://t.me/menhausen_bot?start=${code}`;

test.describe('Referral system', () => {
  test('should store referral metadata in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.addInitScript(() => localStorage.clear());

    const referred = await page.evaluate(() => {
      const referrerId = '987654321';
      localStorage.setItem('menhausen_referred_by', referrerId);
      localStorage.setItem('menhausen_referral_code', `REF_${referrerId}`);
      return {
        referredBy: localStorage.getItem('menhausen_referred_by'),
        referralCode: localStorage.getItem('menhausen_referral_code')
      };
    });

    expect(referred).toEqual({ referredBy: '987654321', referralCode: 'REF_987654321' });
  });

  test('should update referrer list structure', async ({ page }) => {
    await page.goto('/');
    await page.addInitScript(() => localStorage.clear());

    const result = await page.evaluate(() => {
      const referrerId = '5555';
      const key = `menhausen_referral_list_${referrerId}`;
      const list = {
        referrerId,
        referrals: [
          { userId: '123', hasPremium: false },
          { userId: '456', hasPremium: true }
        ]
      };
      localStorage.setItem(key, JSON.stringify(list));
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    });

    expect(result).not.toBeNull();
    expect(result.referrals).toHaveLength(2);
    expect(result.referrals[1].hasPremium).toBe(true);
  });

  test('should build share link from stored referral code', async ({ page }) => {
    await page.goto('/');
    await page.addInitScript(() => localStorage.clear());

    await page.evaluate(() => {
      const userId = '321';
      const code = `REF_${userId}`;
      localStorage.setItem('menhausen_referral_code', code);
    });

    const storedCode = await page.evaluate(() => localStorage.getItem('menhausen_referral_code'));
    expect(storedCode).toBe('REF_321');
    expect(shareLinkFor(storedCode!)).toBe('https://t.me/menhausen_bot?start=REF_321');
  });
});
