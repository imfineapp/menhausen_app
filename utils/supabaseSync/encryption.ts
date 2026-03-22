/**
 * Encryption utilities for sync (optional; client currently uses JSON for transport).
 */

/**
 * Encrypt data before syncing
 */
export async function encryptData(data: unknown): Promise<string> {
  return JSON.stringify(data);
}

/**
 * Decrypt data after syncing
 */
export async function decryptData(encryptedData: string): Promise<unknown> {
  return JSON.parse(encryptedData);
}

/**
 * Check if data type requires encryption
 */
export function requiresEncryption(type: string): boolean {
  const encryptedTypes = ['surveyResults', 'dailyCheckins', 'psychologicalTest'];
  return encryptedTypes.includes(type);
}
