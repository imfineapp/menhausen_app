/**
 * Per-type localStorage → API payload (for batched POST).
 */

import type { SyncDataType } from './types';
import { transformToAPIFormat } from './dataTransformers';
import { loadUserStats } from '../../services/userStatsService';
import { loadUserAchievements } from '../../services/achievementStorage';
import { loadTestResults } from '../psychologicalTestStorage';
import { DailyCheckinManager } from '../DailyCheckinManager';
import { ThemeCardManager } from '../ThemeCardManager';
import { getReferrerId, isReferralRegistered, getReferralList } from '../referralUtils';
import { getTelegramUserId } from '../telegramUserUtils';
import { syncLog } from './syncLogger';
import { loadExperimentAssignmentSyncPayload } from '../experiment/experimentAssignment';
import { loadTopicTestResultsMap } from '../experiment/topicTestStorage';
import { storageReadJson } from '@/src/effects/storage.effects'

export function loadSyncPayloadForType(
  type: SyncDataType,
  parsePreferencesFromStorage: (raw: string) => Record<string, unknown> | null
): unknown {
  switch (type) {
    case 'surveyResults':
      try {
        const surveyResultsRaw = localStorage.getItem('survey-results');
        if (!surveyResultsRaw) return undefined;
        const surveyResults = JSON.parse(surveyResultsRaw);
        return transformToAPIFormat('surveyResults', surveyResults);
      } catch (e) {
        console.warn('Error loading survey results:', e);
        return undefined;
      }

    case 'dailyCheckins':
      try {
        const checkins = DailyCheckinManager.getAllCheckins();
        syncLog.debug('[SyncService] dailyCheckins count:', checkins.length);
        if (checkins.length === 0) return undefined;
        const checkinsObj: Record<string, unknown> = {};
        checkins.forEach((checkin) => {
          if (!checkin.date || typeof checkin.date !== 'string') {
            console.warn('[SyncService] Skipping checkin with invalid date:', checkin);
            return;
          }
          if (!/^\d{4}-\d{2}-\d{2}$/.test(checkin.date)) {
            console.warn('[SyncService] Skipping checkin with invalid date format:', checkin.date);
            return;
          }
          checkinsObj[checkin.date] = {
            mood: checkin.mood,
            value: checkin.value,
            color: checkin.color,
            completed: checkin.completed,
          };
        });
        return Object.keys(checkinsObj).length ? checkinsObj : undefined;
      } catch (e) {
        console.warn('[SyncService] Error loading checkins:', e);
        return undefined;
      }

    case 'userStats':
      try {
        const userStats = loadUserStats();
        if (!userStats) return undefined;
        return transformToAPIFormat('userStats', userStats);
      } catch (e) {
        console.warn('Error loading user stats:', e);
        return undefined;
      }

    case 'achievements':
      try {
        const achievements = loadUserAchievements();
        if (!achievements) return undefined;
        return transformToAPIFormat('achievements', achievements);
      } catch (e) {
        console.warn('Error loading achievements:', e);
        return undefined;
      }

    case 'points':
      // points are now server-authoritative via grant-reward
      return undefined;

    case 'preferences':
      try {
        let preferences: Record<string, unknown> = {};
        const preferencesRaw = localStorage.getItem('menhausen_user_preferences');
        if (preferencesRaw) {
          const parsedPreferences = parsePreferencesFromStorage(preferencesRaw);
          if (parsedPreferences) {
            preferences = parsedPreferences;
          }
        }
        const language = localStorage.getItem('menhausen-language');
        if (language && (language === 'en' || language === 'ru')) {
          preferences.language = language;
        }
        if (preferences.language || Object.keys(preferences).length > 0) {
          return transformToAPIFormat('preferences', preferences);
        }
        return undefined;
      } catch (e) {
        console.warn('Error loading preferences:', e);
        return undefined;
      }

    case 'flowProgress':
      try {
        const flowProgressRaw = localStorage.getItem('app-flow-progress');
        if (!flowProgressRaw) return undefined;
        const flowProgress = JSON.parse(flowProgressRaw);
        return transformToAPIFormat('flowProgress', flowProgress);
      } catch (e) {
        console.warn('Error loading flow progress:', e);
        return undefined;
      }

    case 'psychologicalTest':
      try {
        const psychologicalTest = loadTestResults();
        if (!psychologicalTest) return undefined;
        return transformToAPIFormat('psychologicalTest', psychologicalTest);
      } catch (e) {
        console.warn('Error loading psychological test:', e);
        return undefined;
      }

    case 'cardProgress':
      try {
        const cardProgressObj: Record<string, unknown> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('theme_card_progress_')) {
            const cardId = key.replace('theme_card_progress_', '');
            const cardProgress = ThemeCardManager.getCardProgress(cardId);
            if (cardProgress) {
              cardProgressObj[cardId] = cardProgress;
            }
          }
        }
        if (Object.keys(cardProgressObj).length > 0) {
          return transformToAPIFormat('cardProgress', cardProgressObj);
        }
        return undefined;
      } catch (e) {
        console.warn('Error loading card progress:', e);
        return undefined;
      }

    case 'referralData':
      try {
        const telegramUserId = getTelegramUserId();
        if (!telegramUserId) return undefined;
        const referralData: Record<string, unknown> = {
          referredBy: getReferrerId(),
          referralRegistered: isReferralRegistered(),
          referralList: [] as unknown[],
        };
        try {
          const referralList = getReferralList(telegramUserId);
          referralData.referralList = referralList.referrals.map((r) => r.userId);
        } catch {
          // ignore
        }
        return transformToAPIFormat('referralData', referralData);
      } catch (e) {
        console.warn('Error loading referral data:', e);
        return undefined;
      }

    case 'rapidTechniquesResults':
      try {
        const results = storageReadJson<any>('rapid-techniques-flow-results', null as any)
        return results ? transformToAPIFormat('rapidTechniquesResults', results) : undefined
      } catch (e) {
        console.warn('Error loading rapid techniques results:', e)
        return undefined
      }

    case 'experimentAssignment': {
      const payload = loadExperimentAssignmentSyncPayload();
      return payload ? transformToAPIFormat('experimentAssignment', payload) : undefined;
    }

    case 'topicTestResults': {
      const map = loadTopicTestResultsMap();
      return Object.keys(map).length > 0 ? transformToAPIFormat('topicTestResults', map) : undefined;
    }

    case 'language':
    case 'hasShownFirstAchievement':
      return undefined;

    default:
      return undefined;
  }
}
