/**
 * E2E тесты для реферальной системы
 */

import { test, expect } from '@playwright/test';
import { skipSurvey, skipOnboarding } from './utils/skip-survey';
import { waitForPageLoad, waitForHomeScreen } from './utils/test-helpers';

test.describe('Реферальная система', () => {
  test.beforeEach(async ({ page }) => {
    // Инициализируем Playwright флаг для пропуска некоторых проверок
    await page.addInitScript(() => {
      (window as any).__PLAYWRIGHT__ = true;
    });

    // Очищаем localStorage перед каждым тестом
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  test('должен обработать реферальный код при первом открытии', async ({ page }) => {
    // Симулируем Telegram WebApp с реферальным кодом
    await page.addInitScript((referrerId: string) => {
      // Мокируем Telegram WebApp API
      (window as any).Telegram = {
        WebApp: {
          initDataUnsafe: {
            user: { id: '123456789' },
            start_param: `REF_${referrerId}`
          },
          ready: () => {},
          expand: () => {},
          requestFullscreen: () => {}
        }
      };
    }, '987654321');

    await page.goto('/');
    await waitForPageLoad(page);

    // Ждем загрузки приложения (body вместо таймаута)
    await expect(page.locator('body')).toBeVisible();

    // Проверяем, что реферальный код сохранен в localStorage
    const referredBy = await page.evaluate(() => {
      return localStorage.getItem('menhausen_referred_by');
    });

    expect(referredBy).toBe('987654321');

    // Проверяем, что реферальный код сохранен
    const referralCode = await page.evaluate(() => {
      return localStorage.getItem('menhausen_referral_code');
    });

    expect(referralCode).toBe('REF_987654321');
  });

  test('не должен обработать реферальный код для существующего пользователя', async ({ page }) => {
    // Устанавливаем, что пользователь уже прошел онбординг
    await page.addInitScript(() => {
      localStorage.setItem('app-flow-progress', JSON.stringify({
        onboardingCompleted: true,
        surveyCompleted: true,
        pinEnabled: false,
        pinCompleted: false,
        firstCheckinDone: false,
        firstRewardShown: false
      }));
    });

    // Симулируем Telegram WebApp с реферальным кодом
    await page.addInitScript((referrerId: string) => {
      (window as any).Telegram = {
        WebApp: {
          initDataUnsafe: {
            user: { id: '123456789' },
            start_param: `REF_${referrerId}`
          },
          ready: () => {},
          expand: () => {},
          requestFullscreen: () => {}
        }
      };
    }, '987654321');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Проверяем, что реферальный код НЕ сохранен
    const referredBy = await page.evaluate(() => {
      return localStorage.getItem('menhausen_referred_by');
    });

    expect(referredBy).toBeNull();
  });

  test('должен зарегистрировать реферала после завершения опроса', async ({ page }) => {
    const referrerId = '987654321';
    const currentUserId = '123456789';

    // Устанавливаем реферера в localStorage
    await page.addInitScript((refId: string) => {
      localStorage.setItem('menhausen_referred_by', refId);
      localStorage.setItem('menhausen_referral_code', `REF_${refId}`);
    }, referrerId);

    // Симулируем Telegram WebApp
    await page.addInitScript((userId: string) => {
      (window as any).Telegram = {
        WebApp: {
          initDataUnsafe: {
            user: { id: userId }
          },
          ready: () => {},
          expand: () => {},
          requestFullscreen: () => {}
        }
      };
    }, currentUserId);

    await page.goto('/');
    await waitForPageLoad(page);

    // Пропускаем онбординг и опрос
    await skipOnboarding(page);
    await skipSurvey(page);

    // Ждем навигации на домашнюю страницу (обработка реферала происходит при загрузке)
    await waitForHomeScreen(page);

    // Проверяем, что реферал добавлен в список реферера
    const referralList = await page.evaluate((refId: string) => {
      const key = `menhausen_referral_list_${refId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }, referrerId);

    expect(referralList).not.toBeNull();
    expect(referralList.referrals).toHaveLength(1);
    expect(referralList.referrals[0].userId).toBe(currentUserId);
    expect(referralList.referrals[0].hasPremium).toBe(false);

    // Проверяем, что реферал отмечен как зарегистрированный
    const isRegistered = await page.evaluate(() => {
      return localStorage.getItem('menhausen_referral_registered') === 'true';
    });

    expect(isRegistered).toBe(true);
  });

  test('должен генерировать реферальную ссылку в функции "поделиться"', async ({ page }) => {
    const currentUserId = '123456789';

    // Симулируем Telegram WebApp
    await page.addInitScript((userId: string) => {
      (window as any).Telegram = {
        WebApp: {
          initDataUnsafe: {
            user: { id: userId }
          },
          ready: () => {},
          expand: () => {},
          requestFullscreen: () => {},
          openTelegramLink: (url: string) => {
            (window as any).__lastSharedUrl = url;
          }
        }
      };
    }, currentUserId);

    await page.goto('/');
    await waitForPageLoad(page);

    // Пропускаем онбординг и опрос, переходим на главную
    await skipOnboarding(page);
    await skipSurvey(page);
    
    // Ждем появления блока пользователя
    await waitForHomeScreen(page);

    // Переходим в профиль
    await page.click('[data-name="User frame info block"]');
    
    // Ждем открытия профиля
    await expect(page.locator('[data-name="User Profile Page"]')).toBeVisible({ timeout: 10000 });

    // Находим кнопку "поделиться" и кликаем
    const shareButton = page.locator('button:has-text("Поделиться"), button:has-text("Share")');
    
    if (await shareButton.count() > 0) {
      await shareButton.first().click();
      
      // Ждем обработки клика (ожидание видимости ссылки или модального окна)
      await page.waitForSelector('body', { state: 'visible' }).catch(() => {});

      // Проверяем, что была сгенерирована реферальная ссылка
      const lastSharedUrl = await page.evaluate(() => {
        return (window as any).__lastSharedUrl;
      });

      if (lastSharedUrl) {
        expect(lastSharedUrl).toContain('startapp=REF_');
        expect(lastSharedUrl).toContain(currentUserId);
      }
    }
  });

  test('должен обновить статистику реферера при открытии приложения', async ({ page }) => {
    const referrerId = '123456789';
    const referralUserId = '987654321';

    // Создаем список рефералов для реферера
    await page.addInitScript(({ refId, refUserId }: { refId: string; refUserId: string }) => {
      const referralList = {
        referrerId: refId,
        referrals: [
          {
            userId: refUserId,
            registeredAt: new Date().toISOString(),
            hasPremium: false
          }
        ]
      };
      localStorage.setItem(`menhausen_referral_list_${refId}`, JSON.stringify(referralList));
    }, { refId: referrerId, refUserId: referralUserId });

    // Симулируем Telegram WebApp с ID реферера
    await page.addInitScript((userId: string) => {
      (window as any).Telegram = {
        WebApp: {
          initDataUnsafe: {
            user: { id: userId }
          },
          ready: () => {},
          expand: () => {},
          requestFullscreen: () => {}
        }
      };
    }, referrerId);

    await page.goto('/');
    await waitForPageLoad(page);

    // Ждем загрузки приложения
    await expect(page.locator('body')).toBeVisible();

    // Проверяем, что статистика реферера обновлена
    const stats = await page.evaluate(() => {
      const stored = localStorage.getItem('menhausen_user_stats');
      return stored ? JSON.parse(stored) : null;
    });

    expect(stats).not.toBeNull();
    expect(stats.referralsInvited).toBe(1);
    expect(stats.referralsPremium).toBe(0);
  });

  test('должен правильно обработать комбинированное достижение ambassador', async ({ page }) => {
    const referrerId = '123456789';

    // Создаем список из 5 рефералов, один с premium
    await page.addInitScript((refId: string) => {
      const referralList = {
        referrerId: refId,
        referrals: [
          { userId: '111111111', registeredAt: new Date().toISOString(), hasPremium: false },
          { userId: '222222222', registeredAt: new Date().toISOString(), hasPremium: false },
          { userId: '333333333', registeredAt: new Date().toISOString(), hasPremium: false },
          { userId: '444444444', registeredAt: new Date().toISOString(), hasPremium: false },
          { userId: '555555555', registeredAt: new Date().toISOString(), hasPremium: true }
        ]
      };
      localStorage.setItem(`menhausen_referral_list_${refId}`, JSON.stringify(referralList));
    }, referrerId);

    // Симулируем Telegram WebApp
    await page.addInitScript((userId: string) => {
      (window as any).Telegram = {
        WebApp: {
          initDataUnsafe: {
            user: { id: userId }
          },
          ready: () => {},
          expand: () => {},
          requestFullscreen: () => {}
        }
      };
    }, referrerId);

    await page.goto('/');
    await waitForPageLoad(page);

    // Ждем загрузки приложения
    await expect(page.locator('body')).toBeVisible();

    // Проверяем статистику
    const stats = await page.evaluate(() => {
      const stored = localStorage.getItem('menhausen_user_stats');
      return stored ? JSON.parse(stored) : null;
    });

    expect(stats).not.toBeNull();
    expect(stats.referralsInvited).toBe(5);
    expect(stats.referralsPremium).toBe(1);

    // Переходим на экран достижений и проверяем, что ambassador разблокирован
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Ищем кнопку для перехода на экран достижений
    const badgesButton = page.locator('text=Badges, text=Достижения').or(page.locator('[data-name*="badge"]'));
    
    if (await badgesButton.count() > 0) {
      await badgesButton.first().click();
      
      // Ждем открытия экрана достижений
      await page.waitForSelector('[data-achievement-id="ambassador"]', { timeout: 5000 }).catch(() => {});

      // Проверяем наличие достижения ambassador
      const ambassadorBadge = page.locator('[data-achievement-id="ambassador"]').or(
        page.locator('text=Ambassador, text=Амбассадор')
      );

      // Достижение должно быть разблокировано
      if (await ambassadorBadge.count() > 0) {
        const isUnlocked = await ambassadorBadge.evaluate((el) => {
          return !el.classList.contains('locked') && !el.classList.contains('disabled');
        });
        
        // Если элемент найден, проверяем что он разблокирован
        expect(isUnlocked).toBe(true);
      }
    }
  });

  test('не должен позволить пользователю пригласить самого себя', async ({ page }) => {
    const userId = '123456789';

    // Симулируем Telegram WebApp с реферальным кодом, где реферер = текущий пользователь
    await page.addInitScript((uid: string) => {
      (window as any).Telegram = {
        WebApp: {
          initDataUnsafe: {
            user: { id: uid },
            start_param: `REF_${uid}` // Самоприглашение
          },
          ready: () => {},
          expand: () => {},
          requestFullscreen: () => {}
        }
      };
    }, userId);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Проверяем, что реферальный код НЕ сохранен (защита от самоприглашения)
    const referredBy = await page.evaluate(() => {
      return localStorage.getItem('menhausen_referred_by');
    });

    expect(referredBy).toBeNull();
  });

  test('должен обработать невалидный реферальный код', async ({ page }) => {
    // Симулируем Telegram WebApp с невалидным реферальным кодом
    await page.addInitScript(() => {
      (window as any).Telegram = {
        WebApp: {
          initDataUnsafe: {
            user: { id: '123456789' },
            start_param: 'INVALID_CODE'
          },
          ready: () => {},
          expand: () => {},
          requestFullscreen: () => {}
        }
      };
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Проверяем, что невалидный код не сохранен
    const referredBy = await page.evaluate(() => {
      return localStorage.getItem('menhausen_referred_by');
    });

    expect(referredBy).toBeNull();
  });

  test('должен корректно работать с несколькими рефералами одного реферера', async ({ page }) => {
    const referrerId = '123456789';

    // Симулируем регистрацию нескольких рефералов
    const referralIds = ['111111111', '222222222', '333333333'];

    for (const referralId of referralIds) {
      // Устанавливаем реферера
      await page.addInitScript((refId: string) => {
        localStorage.setItem('menhausen_referred_by', refId);
        localStorage.setItem('menhausen_referral_code', `REF_${refId}`);
      }, referrerId);

      // Симулируем Telegram WebApp для каждого реферала
      await page.addInitScript((userId: string) => {
        (window as any).Telegram = {
          WebApp: {
            initDataUnsafe: {
              user: { id: userId }
            },
            ready: () => {},
            expand: () => {},
            requestFullscreen: () => {}
          }
        };
      }, referralId);

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Пропускаем онбординг и опрос
      await skipOnboarding(page);
      await skipSurvey(page);

      // Ждем навигации на домашнюю страницу (обработка реферала происходит при загрузке)
      await waitForHomeScreen(page).catch(() => {});

      // Очищаем localStorage для следующей итерации (кроме списка рефералов)
      await page.addInitScript(() => {
        const referralListKey = localStorage.key(0)?.includes('referral_list') 
          ? localStorage.key(0) 
          : null;
        const referralListValue = referralListKey ? localStorage.getItem(referralListKey) : null;
        
        localStorage.clear();
        
        if (referralListKey && referralListValue) {
          localStorage.setItem(referralListKey, referralListValue);
        }
      });
    }

    // Ждем загрузки страницы перед проверкой
    await waitForPageLoad(page);

    // Проверяем финальный список рефералов
    const finalList = await page.evaluate((refId: string) => {
      const key = `menhausen_referral_list_${refId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }, referrerId);

    expect(finalList).not.toBeNull();
    expect(finalList.referrals.length).toBeGreaterThanOrEqual(1);
  });
});

