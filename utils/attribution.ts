/**
 * Утилиты для UTM атрибуции
 * Извлекает UTM параметры из start параметра Telegram Mini App
 */

import { isTelegramEnvironment } from './telegramUserUtils';

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_referrer?: string;
  attribution_timestamp: number;
  attribution_version: number;
}

const REFERRAL_PREFIX = 'REF_';

/**
 * Декодировать base64url строку в JSON
 * @param {string} encoded - base64url закодированная строка
 * @returns {string} Декодированная JSON строка
 */
function decodeBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  return atob(base64)
}

/**
 * Парсить JSON строку в объект
 * @param {string} jsonString - JSON строка
 * @returns {Record<string, any> | null} Распарсенный объект или null при ошибке
 */
function parseJsonSafe(jsonString: string): Record<string, any> | null {
  try {
    return JSON.parse(jsonString)
  } catch {
    return null
  }
}

/**
 * Проверить, является ли параметр реферальным кодом
 * @param {string | null} param - Параметр из URL
 * @returns {boolean} True если это реферальный код (начинается с REF_)
 */
function isReferralCode(param: string | null): boolean {
  return param !== null && param.startsWith(REFERRAL_PREFIX)
}

/**
 * Валидировать что объект содержит минимально необходимые поля для UTM атрибуции
 * @param {Record<string, any>} obj - Распарсенный объект
 * @returns {boolean} True если содержит поля t (timestamp) и v (version)
 */
function isValidAttribution(obj: Record<string, any>): boolean {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.t === 'number' &&
    typeof obj.v === 'number'
  )
}

/**
 * Конвертировать внутренние поля в UTM поля
 * @param {Record<string, any>} obj - Распарсенный объект из base64
 * @returns {AttributionData} Объект атрибуции с UTM полями
 */
function convertToAttribution(obj: Record<string, any>): AttributionData {
  return {
    utm_source: obj.s,
    utm_medium: obj.m,
    utm_campaign: obj.c,
    utm_referrer: obj.r,
    attribution_timestamp: obj.t,
    attribution_version: obj.v,
  }
}

/**
 * Получить start параметр из Telegram WebApp или URL
 * @returns {string | null} Значение start параметра или null
 */
function getStartParam(): string | null {
  try {
    const isTg = isTelegramEnvironment()
    if (!isTg) {
      return null
    }

    // Метод 1: Получить из initDataUnsafe.start_param
    const webAppStartParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param
    if (webAppStartParam) {
      return webAppStartParam
    }

    // Метод 2: Получить из URL параметров
    const urlParams = new URLSearchParams(window.location.search)
    const startParam = urlParams.get('start') || urlParams.get('startapp') || urlParams.get('tgWebAppStartParam')
    if (startParam) {
      return startParam
    }

    return null
  } catch (error) {
    console.warn('[Attribution] Error getting start param:', error)
    return null
  }
}

/**
 * Получить UTM атрибуцию из start параметра
 * @returns {AttributionData | null} Данные атрибуции или null если не найдены
 */
export function getAttributionFromStartParam(): AttributionData | null {
  try {
    const startParam = getStartParam()

    // Debug: выводим весь start параметр
    console.log('[Attribution] Start param:', startParam)

    // Нет параметра
    if (!startParam) {
      console.log('[Attribution] No start param found')
      return null
    }

    // Это реферальный код - не UTM атрибуция
    if (isReferralCode(startParam)) {
      console.log('[Attribution] Detected as referral code, not UTM attribution')
      return null
    }

    // Пробуем декодировать как base64
    let decoded: string
    try {
      decoded = decodeBase64Url(startParam)
    } catch {
      console.log('[Attribution] Not base64 encoded, treating as regular start param')
      return null
    }

    // Парсим JSON
    const parsed = parseJsonSafe(decoded)
    if (!parsed) {
      console.log('[Attribution] Not valid JSON, treating as regular start param')
      return null
    }

    // Валидируем что это UTM атрибуция (есть t и v)
    if (!isValidAttribution(parsed)) {
      console.log('[Attribution] No valid attribution fields (t, v), treating as regular start param')
      return null
    }

    // Конвертируем в формат атрибуции
    const attribution = convertToAttribution(parsed)

    console.log('[Attribution] Decoded attribution:', parsed)
    console.log('[Attribution] Attribution data:', attribution)

    return attribution
  } catch (error) {
    console.error('[Attribution] Error parsing attribution:', error)
    return null
  }
}

/**
 * Проверить, является ли start параметр реферальным кодом
 * Используется для разделения логики обработки
 * @param {string | null} param - Параметр для проверки
 * @returns {boolean} True если это реферальный код
 */
export function isStartParamReferralCode(param: string | null): boolean {
  return isReferralCode(param)
}