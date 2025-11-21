/**
 * Утилиты для работы с реферальной системой
 */

import { getTelegramUserId, isTelegramEnvironment } from './telegramUserUtils';
import { loadUserStats, saveUserStats } from '../services/userStatsService';

// Ключи для localStorage
const REFERRAL_CODE_KEY = 'menhausen_referral_code';
const REFERRED_BY_KEY = 'menhausen_referred_by';
const REFERRAL_REGISTERED_KEY = 'menhausen_referral_registered';
const REFERRAL_LIST_PREFIX = 'menhausen_referral_list_';

// Формат реферального кода: REF_{userId}
const REFERRAL_PREFIX = 'REF_';

/**
 * Получить реферальный код из start_param Telegram WebApp
 * @returns {string | null} Реферальный код или null, если не найден
 */
export function getReferralCodeFromStartParam(): string | null {
  try {
    if (!isTelegramEnvironment()) {
      return null;
    }

    // Метод 1: Получить из initDataUnsafe.start_param
    const webAppStartParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
    if (webAppStartParam) {
      return webAppStartParam;
    }

    // Метод 2: Получить из URL параметров
    const urlParams = new URLSearchParams(window.location.search);
    const startParam = urlParams.get('startapp') || urlParams.get('tgWebAppStartParam');
    if (startParam) {
      return startParam;
    }

    return null;
  } catch (error) {
    console.warn('Error getting referral code from start param:', error);
    return null;
  }
}

/**
 * Извлечь ID реферера из реферального кода
 * @param {string} referralCode - Реферальный код (формат: REF_{userId})
 * @returns {string | null} Telegram User ID реферера или null, если невалидный
 */
export function getReferrerIdFromCode(referralCode: string): string | null {
  if (!referralCode || typeof referralCode !== 'string') {
    return null;
  }

  // Проверка формата кода
  if (!referralCode.startsWith(REFERRAL_PREFIX)) {
    return null;
  }

  // Извлечение ID
  const referrerId = referralCode.substring(REFERRAL_PREFIX.length);
  
  // Валидация: должен быть числовой ID
  if (!referrerId || !/^\d+$/.test(referrerId)) {
    return null;
  }

  return referrerId;
}

/**
 * Проверить, является ли пользователь новым
 * @returns {boolean} True, если пользователь новый (не прошел онбординг)
 */
export function isNewUser(): boolean {
  try {
    const FLOW_KEY = 'app-flow-progress';
    const progressRaw = localStorage.getItem(FLOW_KEY);
    
    if (!progressRaw) {
      return true; // Нет данных о прогрессе - новый пользователь
    }

    const progress = JSON.parse(progressRaw);
    return !progress.onboardingCompleted;
  } catch (error) {
    console.warn('Error checking if user is new:', error);
    return true; // В случае ошибки считаем новым
  }
}

/**
 * Сохранить информацию о реферере
 * @param {string} referrerId - Telegram User ID реферера
 */
export function saveReferrerInfo(referrerId: string): void {
  try {
    // Защита от самоприглашения
    const currentUserId = getTelegramUserId();
    if (currentUserId === referrerId) {
      console.warn('User cannot refer themselves');
      return;
    }

    // Проверка, не сохранен ли уже реферер
    const existingReferrer = localStorage.getItem(REFERRED_BY_KEY);
    if (existingReferrer) {
      console.log('Referrer already saved:', existingReferrer);
      return;
    }

    // Сохранение информации о реферере
    localStorage.setItem(REFERRED_BY_KEY, referrerId);
    
    // Сохранение реферального кода для истории
    const referralCode = `${REFERRAL_PREFIX}${referrerId}`;
    localStorage.setItem(REFERRAL_CODE_KEY, referralCode);

    console.log('Referrer info saved:', { referrerId, referralCode });
  } catch (error) {
    console.error('Error saving referrer info:', error);
  }
}

/**
 * Получить ID реферера текущего пользователя
 * @returns {string | null} Telegram User ID реферера или null
 */
export function getReferrerId(): string | null {
  try {
    return localStorage.getItem(REFERRED_BY_KEY);
  } catch (error) {
    console.warn('Error getting referrer ID:', error);
    return null;
  }
}

/**
 * Обработать реферальный код при первом открытии приложения
 * Должен вызываться при инициализации приложения ДО проверки онбординга
 */
export function processReferralCode(): void {
  try {
    // Получить реферальный код из start_param
    const referralCode = getReferralCodeFromStartParam();
    
    if (!referralCode) {
      return; // Нет реферального кода
    }

    console.log('Processing referral code:', referralCode);

    // Извлечь ID реферера
    const referrerId = getReferrerIdFromCode(referralCode);
    
    if (!referrerId) {
      console.warn('Invalid referral code format:', referralCode);
      return;
    }

    // Проверить, является ли пользователь новым
    if (!isNewUser()) {
      console.log('User is not new, skipping referral processing');
      return;
    }

    // Сохранить информацию о реферере
    saveReferrerInfo(referrerId);

  } catch (error) {
    console.error('Error processing referral code:', error);
  }
}

/**
 * Генерировать реферальную ссылку для текущего пользователя
 * @returns {string} Реферальная ссылка или обычная ссылка, если нет User ID
 */
export function generateReferralLink(): string {
  try {
    const userId = getTelegramUserId();
    // Используем стандартную ссылку на Telegram WebApp
    const telegramAppUrl = 'https://t.me/menhausen_app_bot/app';

    if (!userId) {
      // Fallback: обычная ссылка без реферального кода
      console.log('No user ID available, returning standard app link');
      return telegramAppUrl;
    }

    // Формат реферальной ссылки для Telegram WebApp
    // startapp передается как параметр в URL для передачи реферального кода
    const referralCode = `${REFERRAL_PREFIX}${userId}`;
    const referralLink = `${telegramAppUrl}?startapp=${referralCode}`;
    
    console.log('Generated referral link:', {
      userId,
      referralCode,
      referralLink
    });
    
    return referralLink;
  } catch (error) {
    console.error('Error generating referral link:', error);
    return 'https://t.me/menhausen_app_bot/app';
  }
}

/**
 * Отметить, что реферал зарегистрирован (прошел онбординг)
 */
export function markReferralAsRegistered(): void {
  try {
    localStorage.setItem(REFERRAL_REGISTERED_KEY, 'true');
  } catch (error) {
    console.error('Error marking referral as registered:', error);
  }
}

/**
 * Проверить, зарегистрирован ли реферал
 * @returns {boolean} True, если реферал зарегистрирован
 */
export function isReferralRegistered(): boolean {
  try {
    return localStorage.getItem(REFERRAL_REGISTERED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Интерфейс для хранения информации о реферале
 */
export interface ReferralInfo {
  userId: string;
  registeredAt: string;
  hasPremium: boolean;
}

/**
 * Интерфейс для списка рефералов реферера
 */
export interface ReferralStorage {
  referrerId: string;
  referrals: ReferralInfo[];
}

/**
 * Получить список рефералов для реферера
 * @param {string} referrerId - Telegram User ID реферера
 * @returns {ReferralStorage} Список рефералов
 */
export function getReferralList(referrerId: string): ReferralStorage {
  try {
    const key = `${REFERRAL_LIST_PREFIX}${referrerId}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return {
        referrerId,
        referrals: []
      };
    }

    return JSON.parse(stored) as ReferralStorage;
  } catch (error) {
    console.error('Error getting referral list:', error);
    return {
      referrerId,
      referrals: []
    };
  }
}

/**
 * Сохранить список рефералов для реферера
 * @param {ReferralStorage} referralList - Список рефералов
 */
export function saveReferralList(referralList: ReferralStorage): void {
  try {
    const key = `${REFERRAL_LIST_PREFIX}${referralList.referrerId}`;
    localStorage.setItem(key, JSON.stringify(referralList));
  } catch (error) {
    console.error('Error saving referral list:', error);
  }
}

/**
 * Добавить реферала в список реферера
 * @param {string} referrerId - Telegram User ID реферера
 * @param {string} referralUserId - Telegram User ID реферала
 */
export function addReferralToList(referrerId: string, referralUserId: string): void {
  try {
    const referralList = getReferralList(referrerId);
    
    // Проверка, не добавлен ли уже этот реферал
    const exists = referralList.referrals.some(r => r.userId === referralUserId);
    if (exists) {
      console.log('Referral already in list:', referralUserId);
      return;
    }

    // Добавление нового реферала
    referralList.referrals.push({
      userId: referralUserId,
      registeredAt: new Date().toISOString(),
      hasPremium: false // Будет обновлено при покупке premium
    });

    saveReferralList(referralList);
    console.log('Referral added to list:', { referrerId, referralUserId });
  } catch (err) {
    console.error('Error adding referral to list:', err);
  }
}

/**
 * Обновить статистику реферера на основе списка рефералов
 * Вызывается при инициализации приложения на устройстве реферера
 * @param {string} referrerId - Telegram User ID реферера (опционально, если не указан - берется текущий пользователь)
 * @returns {boolean} True, если статистика была обновлена
 */
export function updateReferrerStatsFromList(referrerId?: string): boolean {
  try {
    // Если referrerId не указан, берем текущего пользователя
    const userId = referrerId || getTelegramUserId();
    if (!userId) {
      console.log('No user ID available for updating referrer stats');
      return false;
    }

    // Получаем список рефералов для этого пользователя
    const referralList = getReferralList(userId);
    
    // Проверяем, есть ли вообще рефералы
    if (referralList.referrals.length === 0) {
      return false;
    }

    // Загружаем текущую статистику пользователя
    const stats = loadUserStats();
    
    // Обновляем количество приглашенных рефералов
    const referralsInvited = referralList.referrals.length;
    
    // Подсчитываем количество рефералов с premium
    const referralsPremium = referralList.referrals.filter(r => r.hasPremium).length;
    
    // Обновляем статистику только если значения изменились
    if (stats.referralsInvited !== referralsInvited || stats.referralsPremium !== referralsPremium) {
      const updatedStats = {
        ...stats,
        referralsInvited,
        referralsPremium
      };
      
      saveUserStats(updatedStats);
      console.log('Referrer stats updated:', { userId, referralsInvited, referralsPremium });
      
      // Триггерим событие обновления статистики для проверки достижений
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'menhausen_user_stats',
        newValue: JSON.stringify(updatedStats)
      }));
    }

    return true;
  } catch (err) {
    console.error('Error in updateReferrerStatsFromList:', err);
    return false;
  }
}

