/**
 * Conflict Resolution
 * 
 * Handles merging of local and remote data when conflicts occur
 */

import type { SyncDataType } from './types';

/**
 * Resolve conflict between local and remote data
 */
export function resolveConflict(
  type: SyncDataType,
  localData: any,
  remoteData: any
): any {
  switch (type) {
    case 'preferences':
    case 'language':
    case 'hasShownFirstAchievement':
    case 'flowProgress':
      // Remote wins for preferences/flags/progress
      return remoteData || localData;
    
    case 'dailyCheckins':
      return mergeDailyCheckins(localData, remoteData);
    
    case 'points':
      return mergePoints(localData, remoteData);
    
    case 'achievements':
      return mergeAchievements(localData, remoteData);
    
    case 'userStats':
      return mergeUserStats(localData, remoteData);
    
    case 'surveyResults':
    case 'psychologicalTest':
      // Remote wins for completed tests/surveys
      return remoteData || localData;
    
    case 'cardProgress':
      return mergeCardProgress(localData, remoteData);
    
    case 'referralData':
      return mergeReferralData(localData, remoteData);
    
    default:
      // Default: remote wins
      return remoteData || localData;
  }
}

/**
 * Merge daily checkins (by date_key)
 */
function mergeDailyCheckins(local: any, remote: any): any {
  console.log('[mergeDailyCheckins] Starting merge');
  console.log('[mergeDailyCheckins] local:', local ? Object.keys(local) : 'null/undefined');
  console.log('[mergeDailyCheckins] remote:', remote ? Object.keys(remote) : 'null/undefined');
  
  if (!local) {
    console.log('[mergeDailyCheckins] No local data, returning remote');
    return remote;
  }
  if (!remote) {
    console.log('[mergeDailyCheckins] No remote data, returning local');
    return local;
  }

  const merged = { ...local };
  console.log('[mergeDailyCheckins] Initial merged keys:', Object.keys(merged));

  // Merge by date_key
  Object.keys(remote).forEach(dateKey => {
    // Skip invalid date keys to prevent "daily_checkin_undefined"
    if (!dateKey || dateKey === 'undefined' || dateKey === 'null' || typeof dateKey !== 'string') {
      console.warn('[mergeDailyCheckins] Skipping invalid dateKey:', dateKey);
      return;
    }
    
    // Validate dateKey format (should be YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      console.warn('[mergeDailyCheckins] Skipping invalid dateKey format, expected YYYY-MM-DD, got:', dateKey);
      return;
    }

    console.log('[mergeDailyCheckins] Processing dateKey:', dateKey);
    console.log('[mergeDailyCheckins] - merged[dateKey] exists:', !!merged[dateKey]);
    console.log('[mergeDailyCheckins] - remote[dateKey]:', remote[dateKey]);
    
    if (!merged[dateKey] || new Date(remote[dateKey].date || dateKey) > new Date(local[dateKey]?.date || dateKey)) {
      console.log('[mergeDailyCheckins] - Merging remote data for', dateKey);
      merged[dateKey] = remote[dateKey];
    } else {
      console.log('[mergeDailyCheckins] - Keeping local data for', dateKey);
    }
  });

  console.log('[mergeDailyCheckins] Final merged keys:', Object.keys(merged));
  return merged;
}

/**
 * Merge points (remote wins for balance, merge transactions)
 */
function mergePoints(local: any, remote: any): any {
  if (!local) return remote;
  if (!remote) return local;

  // Balance: remote wins
  const balance = remote.balance ?? local.balance ?? 0;

  // Transactions: merge by transaction_id
  const localTransactions = local.transactions || [];
  const remoteTransactions = remote.transactions || [];
  const transactionMap = new Map();

  // Add local transactions
  localTransactions.forEach((tx: any) => {
    transactionMap.set(tx.id, tx);
  });

  // Add/update with remote transactions
  remoteTransactions.forEach((tx: any) => {
    transactionMap.set(tx.id, tx);
  });

  // Sort by timestamp
  const mergedTransactions = Array.from(transactionMap.values()).sort(
    (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return {
    balance,
    transactions: mergedTransactions,
  };
}

/**
 * Merge achievements (remote wins)
 */
function mergeAchievements(local: any, remote: any): any {
  if (!local) return remote;
  if (!remote) return local;

  // Remote wins for achievements
  return remote;
}

/**
 * Merge user stats (remote wins for most fields, merge arrays)
 */
function mergeUserStats(local: any, remote: any): any {
  if (!local) return remote;
  if (!remote) return local;

  // Merge arrays (readArticleIds, openedCardIds, topicsCompleted, topicsRepeated)
  const readArticleIds = mergeArrays(local.readArticleIds, remote.readArticleIds);
  const openedCardIds = mergeArrays(local.openedCardIds, remote.openedCardIds);
  const topicsCompleted = mergeArrays(local.topicsCompleted, remote.topicsCompleted);
  const topicsRepeated = mergeArrays(local.topicsRepeated, remote.topicsRepeated);

  // Merge objects (cardsOpened, cardsRepeated) - take maximum values
  const cardsOpened = mergeObjects(local.cardsOpened, remote.cardsOpened);
  const cardsRepeated = mergeObjects(local.cardsRepeated, remote.cardsRepeated);

  return {
    ...remote,
    readArticleIds,
    openedCardIds,
    topicsCompleted,
    topicsRepeated,
    cardsOpened,
    cardsRepeated,
    // Use maximum values for counters (to avoid data loss)
    checkins: Math.max(local.checkins || 0, remote.checkins || 0),
    checkinStreak: Math.max(local.checkinStreak || 0, remote.checkinStreak || 0),
    articlesRead: Math.max(local.articlesRead || 0, remote.articlesRead || 0),
    referralsInvited: Math.max(local.referralsInvited || 0, remote.referralsInvited || 0),
    referralsPremium: Math.max(local.referralsPremium || 0, remote.referralsPremium || 0),
    // Use latest date
    lastCheckinDate: remote.lastCheckinDate || local.lastCheckinDate || null,
    lastUpdated: remote.lastUpdated > local.lastUpdated ? remote.lastUpdated : local.lastUpdated,
  };
}

/**
 * Merge two objects by taking maximum values
 */
function mergeObjects(local: Record<string, number> | undefined, remote: Record<string, number> | undefined): Record<string, number> {
  const localObj = local || {};
  const remoteObj = remote || {};
  const merged: Record<string, number> = { ...localObj };

  Object.keys(remoteObj).forEach(key => {
    merged[key] = Math.max(localObj[key] || 0, remoteObj[key] || 0);
  });

  return merged;
}

/**
 * Merge card progress (merge attempts by cardId)
 */
function mergeCardProgress(local: any, remote: any): any {
  if (!local) return remote;
  if (!remote) return local;

  // If both are objects with cardId keys
  const merged: Record<string, any> = { ...local };

  Object.keys(remote).forEach(cardId => {
    const localCard = local[cardId];
    const remoteCard = remote[cardId];

    if (!localCard) {
      merged[cardId] = remoteCard;
    } else if (!remoteCard) {
      merged[cardId] = localCard;
    } else {
      // Merge attempts by attemptId
      const localAttempts = localCard.completedAttempts || [];
      const remoteAttempts = remoteCard.completedAttempts || [];
      const attemptMap = new Map();

      // Add local attempts
      localAttempts.forEach((attempt: any) => {
        if (attempt.attemptId) {
          attemptMap.set(attempt.attemptId, attempt);
        }
      });

      // Add/update with remote attempts
      remoteAttempts.forEach((attempt: any) => {
        if (attempt.attemptId) {
          attemptMap.set(attempt.attemptId, attempt);
        }
      });

      const mergedAttempts = Array.from(attemptMap.values())
        .sort((a: any, b: any) => 
          new Date(a.completedAt || a.date || 0).getTime() - 
          new Date(b.completedAt || b.date || 0).getTime()
        );

      merged[cardId] = {
        ...remoteCard,
        completedAttempts: mergedAttempts,
        totalCompletedAttempts: mergedAttempts.length,
        isCompleted: mergedAttempts.length > 0,
      };
    }
  });

  return merged;
}

/**
 * Merge referral data (remote wins for most fields, merge lists)
 */
function mergeReferralData(local: any, remote: any): any {
  if (!local) return remote;
  if (!remote) return local;

  // Remote wins for referredBy and referralCode
  // Merge referralList arrays
  const localList = local.referralList || [];
  const remoteList = remote.referralList || [];
  const mergedList = mergeArrays(localList, remoteList);

  return {
    referredBy: remote.referredBy || local.referredBy || null,
    referralCode: remote.referralCode || local.referralCode || null,
    referralRegistered: remote.referralRegistered !== undefined 
      ? remote.referralRegistered 
      : local.referralRegistered,
    referralList: mergedList,
  };
}

/**
 * Merge two arrays (union, no duplicates)
 */
function mergeArrays(local: any[] | undefined, remote: any[] | undefined): any[] {
  const localArr = local || [];
  const remoteArr = remote || [];
  
  // Handle both string arrays and object arrays
  if (localArr.length === 0 && remoteArr.length === 0) {
    return [];
  }

  // For primitive arrays (strings, numbers)
  if (localArr.length > 0 && typeof localArr[0] !== 'object') {
    const merged = new Set([...localArr, ...remoteArr]);
    return Array.from(merged);
  }

  // For object arrays, merge by unique identifier
  // If objects have userId, use that; otherwise use full object comparison
  const mergedMap = new Map();
  
  localArr.forEach((item: any) => {
    const key = item?.userId || item?.id || JSON.stringify(item);
    mergedMap.set(key, item);
  });

  remoteArr.forEach((item: any) => {
    const key = item?.userId || item?.id || JSON.stringify(item);
    mergedMap.set(key, item);
  });

  return Array.from(mergedMap.values());
}

