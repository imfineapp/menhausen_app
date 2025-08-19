// API Service Layer with Offline Support and Retry Queue
// Based on creative phase decisions for API integration architecture

interface QueueItem {
  id: string;
  type: 'survey' | 'exercise' | 'progress' | 'preferences';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: string;
  pendingItems: number;
  syncInProgress: boolean;
}

export class APIService {
  private readonly BASE_URL = process.env.REACT_APP_API_URL || '/api';
  private readonly QUEUE_STORAGE_KEY = 'menhausen_api_queue';
  private readonly SYNC_STATUS_KEY = 'menhausen_sync_status';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [1000, 3000, 9000]; // Exponential backoff in ms

  private queue: QueueItem[] = [];
  private syncInProgress = false;
  private onlineStatus = navigator.onLine;

  constructor() {
    this.initializeQueue();
    this.setupOnlineStatusListeners();
    this.startPeriodicSync();
  }

  private initializeQueue(): void {
    try {
      const savedQueue = localStorage.getItem(this.QUEUE_STORAGE_KEY);
      if (savedQueue) {
        this.queue = JSON.parse(savedQueue);
      }
    } catch (error) {
      console.error('Failed to load API queue:', error);
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(this.QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save API queue:', error);
    }
  }

  private setupOnlineStatusListeners(): void {
    window.addEventListener('online', () => {
      this.onlineStatus = true;
      console.log('Connection restored - starting sync');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.onlineStatus = false;
      console.log('Connection lost - queuing requests');
    });
  }

  private startPeriodicSync(): void {
    // Sync every 30 seconds when online
    setInterval(() => {
      if (this.onlineStatus && this.queue.length > 0) {
        this.processQueue();
      }
    }, 30000);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private async makeRequest<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any
  ): Promise<APIResponse<T>> {
    try {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.BASE_URL}${endpoint}`, config);
      const responseData = await response.json();

      return {
        success: response.ok,
        data: responseData,
        statusCode: response.status,
        error: response.ok ? undefined : responseData.message || 'Request failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        statusCode: 0
      };
    }
  }

  private addToQueue(type: QueueItem['type'], data: any): string {
    const queueItem: QueueItem = {
      id: this.generateId(),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.MAX_RETRIES
    };

    this.queue.push(queueItem);
    this.saveQueue();
    
    // Try to process immediately if online
    if (this.onlineStatus) {
      this.processQueue();
    }

    return queueItem.id;
  }

  private async processQueue(): Promise<void> {
    if (!this.onlineStatus || this.syncInProgress || this.queue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`Processing API queue: ${this.queue.length} items`);

    const itemsToProcess = [...this.queue];
    const successful: string[] = [];

    for (const item of itemsToProcess) {
      try {
        const success = await this.processQueueItem(item);
        if (success) {
          successful.push(item.id);
        } else {
          // Increment retry count
          item.retryCount++;
          if (item.retryCount >= item.maxRetries) {
            console.error('Max retries reached for queue item:', item.id);
            successful.push(item.id); // Remove from queue
          } else {
            // Wait before next retry
            const delay = this.RETRY_DELAYS[item.retryCount - 1] || 9000;
            setTimeout(() => {
              if (this.onlineStatus) {
                this.processQueue();
              }
            }, delay);
          }
        }
      } catch (error) {
        console.error('Error processing queue item:', item.id, error);
        item.retryCount++;
        if (item.retryCount >= item.maxRetries) {
          successful.push(item.id); // Remove from queue
        }
      }
    }

    // Remove successful items from queue
    this.queue = this.queue.filter(item => !successful.includes(item.id));
    this.saveQueue();
    this.updateSyncStatus();

    this.syncInProgress = false;
  }

  private async processQueueItem(item: QueueItem): Promise<boolean> {
    let endpoint: string;
    let method: string = 'POST';

    switch (item.type) {
      case 'survey':
        endpoint = '/surveys';
        break;
      case 'exercise':
        endpoint = '/exercises/completion';
        break;
      case 'progress':
        endpoint = '/progress';
        method = 'PUT';
        break;
      case 'preferences':
        endpoint = '/preferences';
        method = 'PUT';
        break;
      default:
        console.error('Unknown queue item type:', item.type);
        return false;
    }

    const response = await this.makeRequest(endpoint, method, item.data);
    
    if (response.success) {
      console.log(`Successfully synced ${item.type} data:`, item.id);
      return true;
    } else {
      console.error(`Failed to sync ${item.type} data:`, response.error);
      return false;
    }
  }

  private updateSyncStatus(): void {
    const status: SyncStatus = {
      isOnline: this.onlineStatus,
      lastSync: new Date().toISOString(),
      pendingItems: this.queue.length,
      syncInProgress: this.syncInProgress
    };

    localStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(status));
  }

  // Public API methods
  async submitSurveyResults(surveyData: any): Promise<string> {
    console.log('Submitting survey results:', surveyData);
    
    if (this.onlineStatus) {
      const response = await this.makeRequest('/surveys', 'POST', surveyData);
      if (response.success) {
        return 'sync_immediate';
      }
    }

    // Queue for later sync
    const queueId = this.addToQueue('survey', surveyData);
    console.log('Survey results queued for sync:', queueId);
    return queueId;
  }

  async submitExerciseCompletion(exerciseData: any): Promise<string> {
    console.log('Submitting exercise completion:', exerciseData);
    
    if (this.onlineStatus) {
      const response = await this.makeRequest('/exercises/completion', 'POST', exerciseData);
      if (response.success) {
        return 'sync_immediate';
      }
    }

    // Queue for later sync
    const queueId = this.addToQueue('exercise', exerciseData);
    console.log('Exercise completion queued for sync:', queueId);
    return queueId;
  }

  async updateProgress(progressData: any): Promise<string> {
    console.log('Updating progress:', progressData);
    
    if (this.onlineStatus) {
      const response = await this.makeRequest('/progress', 'PUT', progressData);
      if (response.success) {
        return 'sync_immediate';
      }
    }

    // Queue for later sync
    const queueId = this.addToQueue('progress', progressData);
    console.log('Progress update queued for sync:', queueId);
    return queueId;
  }

  async updatePreferences(preferences: any): Promise<string> {
    console.log('Updating preferences:', preferences);
    
    if (this.onlineStatus) {
      const response = await this.makeRequest('/preferences', 'PUT', preferences);
      if (response.success) {
        return 'sync_immediate';
      }
    }

    // Queue for later sync
    const queueId = this.addToQueue('preferences', preferences);
    console.log('Preferences update queued for sync:', queueId);
    return queueId;
  }

  // Get current sync status
  getSyncStatus(): SyncStatus {
    try {
      const saved = localStorage.getItem(this.SYNC_STATUS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }

    return {
      isOnline: this.onlineStatus,
      lastSync: 'never',
      pendingItems: this.queue.length,
      syncInProgress: this.syncInProgress
    };
  }

  // Force sync attempt
  async forcSync(): Promise<boolean> {
    if (!this.onlineStatus) {
      console.warn('Cannot force sync while offline');
      return false;
    }

    await this.processQueue();
    return this.queue.length === 0;
  }

  // Clear queue (use with caution)
  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
    this.updateSyncStatus();
    console.log('API queue cleared');
  }

  // Get queue info for debugging
  getQueueInfo(): { length: number; items: QueueItem[] } {
    return {
      length: this.queue.length,
      items: [...this.queue]
    };
  }
}

// Export singleton instance
export const apiService = new APIService();
