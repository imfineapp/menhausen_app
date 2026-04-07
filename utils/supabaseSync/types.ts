/**
 * TypeScript types and interfaces for Supabase Sync Service
 */

/**
 * Data types that can be synced
 */
export type SyncDataType =
  | 'surveyResults'
  | 'dailyCheckins'
  | 'userStats'
  | 'achievements'
  | 'points'
  | 'preferences'
  | 'flowProgress'
  | 'psychologicalTest'
  | 'cardProgress'
  | 'referralData'
  | 'rapidTechniquesResults'
  | 'experimentAssignment'
  | 'topicTestResults'
  | 'language'
  | 'hasShownFirstAchievement';

/**
 * Sync status
 */
export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingItems: number;
  syncInProgress: boolean;
  errors: SyncError[];
}

/**
 * Sync error
 */
export interface SyncError {
  type: SyncDataType;
  error: string;
  timestamp: Date;
  retryable: boolean;
}

/**
 * Sync queue item
 */
/** Batched offline retry: payload is POST body `data` object (partial keys). */
export interface SyncQueueItem {
  types: SyncDataType[];
  payload: Record<string, unknown>;
  timestamp: Date;
  retryCount: number;
}

/**
 * Sync operation result
 */
export interface SyncResult {
  success: boolean;
  syncedTypes: SyncDataType[];
  conflicts?: Array<{
    type: SyncDataType;
    resolved: 'remote' | 'merged' | 'local';
  }>;
  errors?: Array<{
    type: SyncDataType;
    error: string;
  }>;
  metadata?: {
    lastSyncAt: string;
    syncVersion: number;
  };
}

/**
 * Full user data structure from API
 */
export interface PremiumSignature {
  data: {
    premium: boolean;
    plan?: string;
    expiresAt?: string;
    purchasedAt?: string;
    timestamp: number;
  };
  signature: string; // Base64 Ed25519 signature
  publicKey: string; // Base64 public key
  version: number; // Key version
}

export interface UserDataFromAPI {
  surveyResults?: any;
  dailyCheckins?: Record<string, any>;
  userStats?: any;
  achievements?: any;
  points?: {
    balance: number;
    transactions: any[];
  };
  preferences?: any;
  flowProgress?: any;
  psychologicalTest?: any;
  cardProgress?: Record<string, any>;
  referralData?: any;
  rapidTechniquesResults?: any;
  experimentAssignment?: { experimentKey: string; variant: string; assignedAt?: string };
  topicTestResults?: Record<
    string,
    { topicId: string; answers: number[]; score: number; percentage: number; completedAt?: string }
  >;
  language?: string;
  hasShownFirstAchievement?: boolean;
  hasPremium?: boolean; // Premium subscription status
  premiumSignature?: PremiumSignature; // Signed premium status data
}

/**
 * Sync configuration
 */
export interface SyncConfig {
  debounceMs: number;
  maxRetries: number;
  retryDelayMs: number;
  enableOfflineQueue: boolean;
  enableEncryption: boolean;
}

/**
 * Default sync configuration
 */
export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  debounceMs: 500,
  maxRetries: 3,
  retryDelayMs: 1000,
  enableOfflineQueue: true,
  enableEncryption: true,
};

