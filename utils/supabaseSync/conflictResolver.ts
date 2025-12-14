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
      // Remote wins for preferences/flags
      return remoteData;
    
    case 'dailyCheckins':
      return mergeDailyCheckins(localData, remoteData);
    
    case 'points':
      return mergePoints(localData, remoteData);
    
    case 'achievements':
      return mergeAchievements(localData, remoteData);
    
    case 'userStats':
      return mergeUserStats(localData, remoteData);
    
    default:
      // Default: remote wins
      return remoteData;
  }
}

/**
 * Merge daily checkins (by date_key)
 */
function mergeDailyCheckins(local: any, remote: any): any {
  if (!local) return remote;
  if (!remote) return local;

  const merged = { ...local };

  // Merge by date_key
  Object.keys(remote).forEach(dateKey => {
    if (!merged[dateKey] || new Date(remote[dateKey].date || dateKey) > new Date(local[dateKey]?.date || dateKey)) {
      merged[dateKey] = remote[dateKey];
    }
  });

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

  // Merge arrays (readArticleIds, openedCardIds, topicsCompleted, etc.)
  const readArticleIds = mergeArrays(local.readArticleIds, remote.readArticleIds);
  const openedCardIds = mergeArrays(local.openedCardIds, remote.openedCardIds);
  const topicsCompleted = mergeArrays(local.topicsCompleted, remote.topicsCompleted);

  return {
    ...remote,
    readArticleIds,
    openedCardIds,
    topicsCompleted,
  };
}

/**
 * Merge two arrays (union, no duplicates)
 */
function mergeArrays(local: any[] | undefined, remote: any[] | undefined): any[] {
  const localArr = local || [];
  const remoteArr = remote || [];
  const merged = new Set([...localArr, ...remoteArr]);
  return Array.from(merged);
}

