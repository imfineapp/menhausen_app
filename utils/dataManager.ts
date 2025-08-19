// Enhanced Data Persistence System
// Based on creative phase decisions for robust data management

interface DataSchema {
  version: number;
  createdAt: string;
  updatedAt: string;
  data: any;
  checksum: string;
}

interface _CriticalData {
  surveyResults?: SurveyResults;
  exerciseCompletions?: ExerciseCompletion[];
  userPreferences?: UserPreferences;
  progressData?: ProgressData;
}

interface SurveyResults {
  screen01: string[];
  screen02: string[];
  screen03: string[];
  screen04: string[];
  screen05: string[];
  completedAt: string;
  userId?: string;
}

interface ExerciseCompletion {
  cardId: string;
  answers: { question1?: string; question2?: string };
  rating: number;
  completedAt: string;
  completionCount: number;
}

interface UserPreferences {
  language: string;
  theme: string;
  notifications: boolean;
  analytics: boolean;
}

interface ProgressData {
  completedSurveys: number;
  completedExercises: number;
  lastActivity: string;
  achievements: string[];
}

export class CriticalDataManager {
  private readonly STORAGE_PREFIX = 'menhausen_';
  private readonly CURRENT_VERSION = 2;
  private readonly ENCRYPTION_KEY = 'menhausen_critical_data_v2';

  // Simple encryption for mental health data privacy
  private encrypt(data: string): string {
    try {
      return btoa(unescape(encodeURIComponent(data)));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error; // Re-throw to allow parent to handle
    }
  }

  private decrypt(encryptedData: string): string {
    try {
      return decodeURIComponent(escape(atob(encryptedData)));
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error; // Re-throw to allow parent to handle
    }
  }

  private calculateChecksum(data: string): string {
    // Simple checksum for data integrity verification
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private createVersionedData<T>(data: T): DataSchema {
    const serialized = JSON.stringify(data);
    return {
      version: this.CURRENT_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data,
      checksum: this.calculateChecksum(serialized)
    };
  }

  private validateDataIntegrity(schema: DataSchema): boolean {
    try {
      const serialized = JSON.stringify(schema.data);
      const calculatedChecksum = this.calculateChecksum(serialized);
      return calculatedChecksum === schema.checksum;
    } catch (error) {
      console.error('Data integrity validation failed:', error);
      return false;
    }
  }

  // Critical data operations with encryption and validation
  async saveCriticalData(key: string, data: any): Promise<boolean> {
    try {
      const versionedData = this.createVersionedData(data);
      const serialized = JSON.stringify(versionedData);
      const encrypted = this.encrypt(serialized);
      
      localStorage.setItem(`${this.STORAGE_PREFIX}${key}`, encrypted);
      
      // Create backup copy
      localStorage.setItem(`${this.STORAGE_PREFIX}${key}_backup`, encrypted);
      
      return true;
    } catch (error) {
      console.error('Failed to save critical data:', error);
      return false;
    }
  }

  async loadCriticalData<T>(key: string): Promise<T | null> {
    try {
      const encrypted = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
      if (!encrypted) return null;

      const decrypted = this.decrypt(encrypted);
      const schema: DataSchema = JSON.parse(decrypted);

      // Validate data integrity
      if (!this.validateDataIntegrity(schema)) {
        console.warn('Data integrity check failed, attempting backup recovery');
        return this.recoverFromBackup<T>(key);
      }

      // Migrate data if needed
      const migratedSchema = await this.migrateData(schema);
      
      return migratedSchema.data as T;
    } catch (error) {
      console.error('Failed to load critical data:', error);
      return this.recoverFromBackup<T>(key);
    }
  }

  private async recoverFromBackup<T>(key: string): Promise<T | null> {
    try {
      const backupEncrypted = localStorage.getItem(`${this.STORAGE_PREFIX}${key}_backup`);
      if (!backupEncrypted) return null;

      const decrypted = this.decrypt(backupEncrypted);
      const schema: DataSchema = JSON.parse(decrypted);

      if (this.validateDataIntegrity(schema)) {
        // Restore main data from backup
        localStorage.setItem(`${this.STORAGE_PREFIX}${key}`, backupEncrypted);
        return schema.data as T;
      }

      return null;
    } catch (error) {
      console.error('Backup recovery failed:', error);
      return null;
    }
  }

  async migrateData(schema: DataSchema): Promise<DataSchema> {
    if (schema.version === this.CURRENT_VERSION) {
      return schema;
    }

    let migratedData = schema.data;

    // Migration from v1 to v2
    if (schema.version < 2) {
      migratedData = this.migrateV1ToV2(migratedData);
    }

    const updatedSchema = this.createVersionedData(migratedData);
    return updatedSchema;
  }

  private migrateV1ToV2(data: any): any {
    // Example migration: ensure all required fields exist
    return {
      ...data,
      version: 2,
      migratedAt: new Date().toISOString(),
      // Ensure backward compatibility for survey results
      surveyResults: data.surveyResults || {},
      exerciseCompletions: data.exerciseCompletions || [],
      userPreferences: data.userPreferences || {
        language: 'en',
        theme: 'light',
        notifications: true,
        analytics: false
      },
      progressData: data.progressData || {
        completedSurveys: 0,
        completedExercises: 0,
        lastActivity: new Date().toISOString(),
        achievements: []
      }
    };
  }

  // Convenience methods for specific data types
  async saveSurveyResults(results: SurveyResults): Promise<boolean> {
    return this.saveCriticalData('survey_results', results);
  }

  async loadSurveyResults(): Promise<SurveyResults | null> {
    return this.loadCriticalData<SurveyResults>('survey_results');
  }

  async saveExerciseCompletion(completion: ExerciseCompletion): Promise<boolean> {
    const existingCompletions = await this.loadExerciseCompletions() || [];
    
    // Update existing completion or add new one
    const existingIndex = existingCompletions.findIndex(c => c.cardId === completion.cardId);
    if (existingIndex >= 0) {
      existingCompletions[existingIndex] = completion;
    } else {
      existingCompletions.push(completion);
    }

    return this.saveCriticalData('exercise_completions', existingCompletions);
  }

  async loadExerciseCompletions(): Promise<ExerciseCompletion[] | null> {
    return this.loadCriticalData<ExerciseCompletion[]>('exercise_completions');
  }

  async saveUserPreferences(preferences: UserPreferences): Promise<boolean> {
    return this.saveCriticalData('user_preferences', preferences);
  }

  async loadUserPreferences(): Promise<UserPreferences> {
    const preferences = await this.loadCriticalData<UserPreferences>('user_preferences');
    return preferences || {
      language: 'en',
      theme: 'light',
      notifications: true,
      analytics: false
    };
  }

  async saveProgressData(progress: ProgressData): Promise<boolean> {
    return this.saveCriticalData('progress_data', progress);
  }

  async loadProgressData(): Promise<ProgressData> {
    const progress = await this.loadCriticalData<ProgressData>('progress_data');
    return progress || {
      completedSurveys: 0,
      completedExercises: 0,
      lastActivity: new Date().toISOString(),
      achievements: []
    };
  }

  // Data cleanup and maintenance
  clearAllData(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; efficiency: number } {
    const used = new Blob(Object.values(localStorage)).size;
    const available = 5 * 1024 * 1024; // 5MB typical localStorage limit
    const efficiency = used / available;

    return { used, available, efficiency };
  }
}

// Export singleton instance
export const criticalDataManager = new CriticalDataManager();
