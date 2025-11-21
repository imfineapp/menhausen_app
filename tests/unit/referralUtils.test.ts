/**
 * Unit тесты для utils/referralUtils.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getReferralCodeFromStartParam,
  getReferrerIdFromCode,
  isNewUser,
  saveReferrerInfo,
  getReferrerId,
  processReferralCode,
  generateReferralLink,
  markReferralAsRegistered,
  isReferralRegistered,
  getReferralList,
  saveReferralList,
  addReferralToList,
  updateReferrerStatsFromList,
  type ReferralStorage
} from '../../utils/referralUtils';
import * as telegramUserUtils from '../../utils/telegramUserUtils';
import * as userStatsService from '../../services/userStatsService';

// Моки для localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

// Моки для window.Telegram
const createTelegramMock = (startParam?: string) => ({
  WebApp: {
    initDataUnsafe: {
      user: { id: '123456789' },
      start_param: startParam
    }
  }
});

describe('referralUtils', () => {
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorageMock.clear();
    
    // Мокируем localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Очищаем window.Telegram перед каждым тестом
    (window as any).Telegram = undefined;

    // Мокируем getTelegramUserId
    vi.spyOn(telegramUserUtils, 'getTelegramUserId').mockReturnValue('123456789');
    vi.spyOn(telegramUserUtils, 'isTelegramEnvironment').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorageMock.clear();
    (window as any).Telegram = undefined;
  });

  describe('getReferralCodeFromStartParam', () => {
    it('должен получить реферальный код из start_param WebApp', () => {
      (window as any).Telegram = createTelegramMock('REF_987654321');
      
      const code = getReferralCodeFromStartParam();
      expect(code).toBe('REF_987654321');
      
      (window as any).Telegram = undefined;
    });

    it('должен получить реферальный код из URL параметров', () => {
      // Мокируем location через Object.defineProperty с правильными настройками
      const originalLocation = window.location;
      delete (window as any).location;
      
      (window as any).location = {
        origin: 'https://t.me',
        search: '?startapp=REF_987654321',
        hostname: 't.me'
      };

      const code = getReferralCodeFromStartParam();
      expect(code).toBe('REF_987654321');
      
      (window as any).location = originalLocation;
    });

    it('должен вернуть null, если реферального кода нет', () => {
      (window as any).Telegram = createTelegramMock();
      
      const code = getReferralCodeFromStartParam();
      expect(code).toBeNull();
      
      (window as any).Telegram = undefined;
    });

    it('должен вернуть null, если не в Telegram окружении', () => {
      vi.spyOn(telegramUserUtils, 'isTelegramEnvironment').mockReturnValue(false);
      
      const code = getReferralCodeFromStartParam();
      expect(code).toBeNull();
    });
  });

  describe('getReferrerIdFromCode', () => {
    it('должен извлечь ID реферера из валидного кода', () => {
      const referrerId = getReferrerIdFromCode('REF_987654321');
      expect(referrerId).toBe('987654321');
    });

    it('должен вернуть null для невалидного формата', () => {
      expect(getReferrerIdFromCode('INVALID_CODE')).toBeNull();
      expect(getReferrerIdFromCode('REF_')).toBeNull();
      expect(getReferrerIdFromCode('REF_abc')).toBeNull();
      expect(getReferrerIdFromCode('')).toBeNull();
    });

    it('должен вернуть null для null или undefined', () => {
      expect(getReferrerIdFromCode(null as any)).toBeNull();
      expect(getReferrerIdFromCode(undefined as any)).toBeNull();
    });
  });

  describe('isNewUser', () => {
    it('должен вернуть true, если нет данных о прогрессе', () => {
      expect(isNewUser()).toBe(true);
    });

    it('должен вернуть true, если onboarding не завершен', () => {
      localStorageMock.setItem('app-flow-progress', JSON.stringify({
        onboardingCompleted: false,
        surveyCompleted: false
      }));

      expect(isNewUser()).toBe(true);
    });

    it('должен вернуть false, если onboarding завершен', () => {
      localStorageMock.setItem('app-flow-progress', JSON.stringify({
        onboardingCompleted: true,
        surveyCompleted: true
      }));

      expect(isNewUser()).toBe(false);
    });

    it('должен вернуть true при ошибке парсинга', () => {
      localStorageMock.setItem('app-flow-progress', 'invalid json');
      expect(isNewUser()).toBe(true);
    });
  });

  describe('saveReferrerInfo', () => {
    it('должен сохранить информацию о реферере', () => {
      saveReferrerInfo('987654321');
      
      expect(localStorageMock.getItem('menhausen_referred_by')).toBe('987654321');
      expect(localStorageMock.getItem('menhausen_referral_code')).toBe('REF_987654321');
    });

    it('не должен сохранить, если пользователь приглашает сам себя', () => {
      vi.spyOn(telegramUserUtils, 'getTelegramUserId').mockReturnValue('123456789');
      
      saveReferrerInfo('123456789');
      
      expect(localStorageMock.getItem('menhausen_referred_by')).toBeNull();
    });

    it('не должен перезаписывать существующего реферера', () => {
      localStorageMock.setItem('menhausen_referred_by', '999999999');
      
      saveReferrerInfo('987654321');
      
      expect(localStorageMock.getItem('menhausen_referred_by')).toBe('999999999');
    });
  });

  describe('getReferrerId', () => {
    it('должен вернуть ID реферера, если сохранен', () => {
      localStorageMock.setItem('menhausen_referred_by', '987654321');
      
      expect(getReferrerId()).toBe('987654321');
    });

    it('должен вернуть null, если реферер не сохранен', () => {
      expect(getReferrerId()).toBeNull();
    });
  });

  describe('processReferralCode', () => {
    it('должен обработать реферальный код и сохранить реферера', () => {
      (window as any).Telegram = createTelegramMock('REF_987654321');
      
      // Устанавливаем, что пользователь новый
      localStorageMock.setItem('app-flow-progress', JSON.stringify({
        onboardingCompleted: false
      }));

      processReferralCode();
      
      expect(getReferrerId()).toBe('987654321');
      
      (window as any).Telegram = undefined;
    });

    it('не должен сохранять реферера, если пользователь не новый', () => {
      (window as any).Telegram = createTelegramMock('REF_987654321');
      
      localStorageMock.setItem('app-flow-progress', JSON.stringify({
        onboardingCompleted: true
      }));

      processReferralCode();
      
      expect(getReferrerId()).toBeNull();
      
      (window as any).Telegram = undefined;
    });

    it('не должен обрабатывать невалидный код', () => {
      (window as any).Telegram = createTelegramMock('INVALID');
      
      processReferralCode();
      
      expect(getReferrerId()).toBeNull();
      
      (window as any).Telegram = undefined;
    });
  });

  describe('generateReferralLink', () => {
    it('должен сгенерировать реферальную ссылку с User ID', () => {
      vi.spyOn(telegramUserUtils, 'getTelegramUserId').mockReturnValue('123456789');
      
      const originalLocation = window.location;
      delete (window as any).location;
      (window as any).location = {
        origin: 'https://t.me/bot/app'
      };

      const link = generateReferralLink();
      expect(link).toBe('https://t.me/menhausen_app_bot/app?startapp=REF_123456789');
      
      (window as any).location = originalLocation;
    });

    it('должен вернуть обычную ссылку, если нет User ID', () => {
      vi.spyOn(telegramUserUtils, 'getTelegramUserId').mockReturnValue(null);
      
      const originalLocation = window.location;
      delete (window as any).location;
      (window as any).location = {
        origin: 'https://t.me/bot/app'
      };

      const link = generateReferralLink();
      expect(link).toBe('https://t.me/menhausen_app_bot/app');
      
      (window as any).location = originalLocation;
    });
  });

  describe('markReferralAsRegistered и isReferralRegistered', () => {
    it('должен отметить реферала как зарегистрированного', () => {
      markReferralAsRegistered();
      expect(isReferralRegistered()).toBe(true);
    });

    it('должен вернуть false, если реферал не зарегистрирован', () => {
      expect(isReferralRegistered()).toBe(false);
    });
  });

  describe('getReferralList и saveReferralList', () => {
    it('должен сохранить и загрузить список рефералов', () => {
      const referralList: ReferralStorage = {
        referrerId: '123456789',
        referrals: [
          {
            userId: '987654321',
            registeredAt: '2024-01-01T00:00:00.000Z',
            hasPremium: false
          }
        ]
      };

      saveReferralList(referralList);
      const loaded = getReferralList('123456789');

      expect(loaded.referrerId).toBe('123456789');
      expect(loaded.referrals).toHaveLength(1);
      expect(loaded.referrals[0].userId).toBe('987654321');
    });

    it('должен вернуть пустой список, если нет данных', () => {
      const list = getReferralList('123456789');
      
      expect(list.referrerId).toBe('123456789');
      expect(list.referrals).toHaveLength(0);
    });
  });

  describe('addReferralToList', () => {
    it('должен добавить нового реферала в список', () => {
      addReferralToList('123456789', '987654321');
      
      const list = getReferralList('123456789');
      expect(list.referrals).toHaveLength(1);
      expect(list.referrals[0].userId).toBe('987654321');
      expect(list.referrals[0].hasPremium).toBe(false);
    });

    it('не должен добавлять дубликаты', () => {
      addReferralToList('123456789', '987654321');
      addReferralToList('123456789', '987654321');
      
      const list = getReferralList('123456789');
      expect(list.referrals).toHaveLength(1);
    });

    it('должен добавить несколько разных рефералов', () => {
      addReferralToList('123456789', '987654321');
      addReferralToList('123456789', '111222333');
      
      const list = getReferralList('123456789');
      expect(list.referrals).toHaveLength(2);
    });
  });

  describe('updateReferrerStatsFromList', () => {
    beforeEach(() => {
      // Мокируем функции из userStatsService
      vi.spyOn(userStatsService, 'loadUserStats').mockReturnValue({
        version: 1,
        checkins: 0,
        checkinStreak: 0,
        lastCheckinDate: null,
        cardsOpened: {},
        topicsCompleted: [],
        cardsRepeated: {},
        topicsRepeated: [],
        articlesRead: 0,
        referralsInvited: 0,
        referralsPremium: 0,
        lastUpdated: new Date().toISOString()
      });

      vi.spyOn(userStatsService, 'saveUserStats').mockImplementation(() => {});
    });

    it('должен обновить статистику на основе списка рефералов', () => {
      // Добавляем рефералов
      addReferralToList('123456789', '987654321');
      addReferralToList('123456789', '111222333');

      updateReferrerStatsFromList('123456789');

      expect(userStatsService.saveUserStats).toHaveBeenCalled();
      const call = (userStatsService.saveUserStats as any).mock.calls[0][0];
      expect(call.referralsInvited).toBe(2);
      expect(call.referralsPremium).toBe(0);
    });

    it('должен подсчитать рефералов с premium', () => {
      const list: ReferralStorage = {
        referrerId: '123456789',
        referrals: [
          {
            userId: '987654321',
            registeredAt: '2024-01-01T00:00:00.000Z',
            hasPremium: true
          },
          {
            userId: '111222333',
            registeredAt: '2024-01-01T00:00:00.000Z',
            hasPremium: false
          }
        ]
      };
      saveReferralList(list);

      updateReferrerStatsFromList('123456789');

      const call = (userStatsService.saveUserStats as any).mock.calls[0][0];
      expect(call.referralsInvited).toBe(2);
      expect(call.referralsPremium).toBe(1);
    });

    it('не должен обновлять, если нет рефералов', () => {
      updateReferrerStatsFromList('123456789');

      expect(userStatsService.saveUserStats).not.toHaveBeenCalled();
    });

    it('не должен обновлять, если значения не изменились', () => {
      vi.spyOn(userStatsService, 'loadUserStats').mockReturnValue({
        version: 1,
        checkins: 0,
        checkinStreak: 0,
        lastCheckinDate: null,
        cardsOpened: {},
        topicsCompleted: [],
        cardsRepeated: {},
        topicsRepeated: [],
        articlesRead: 0,
        referralsInvited: 1,
        referralsPremium: 0,
        lastUpdated: new Date().toISOString()
      });

      vi.spyOn(userStatsService, 'saveUserStats').mockImplementation(() => {});

      addReferralToList('123456789', '987654321');

      updateReferrerStatsFromList('123456789');

      // Не должен вызвать, так как значения не изменились (уже есть 1 реферал)
      expect(userStatsService.saveUserStats).not.toHaveBeenCalled();
    });

    it('должен использовать текущего пользователя, если referrerId не указан', () => {
      vi.spyOn(telegramUserUtils, 'getTelegramUserId').mockReturnValue('123456789');
      
      addReferralToList('123456789', '987654321');

      updateReferrerStatsFromList();

      expect(userStatsService.saveUserStats).toHaveBeenCalled();
    });

    it('не должен обновлять, если нет User ID', () => {
      vi.spyOn(telegramUserUtils, 'getTelegramUserId').mockReturnValue(null);

      const result = updateReferrerStatsFromList();

      expect(result).toBe(false);
      expect(userStatsService.saveUserStats).not.toHaveBeenCalled();
    });
  });
});

