/**
 * Unit tests for premiumSignature.ts
 * Tests Ed25519 signature verification for premium status
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  verifyPremiumSignature,
  loadPremiumSignatureFromStorage,
  savePremiumSignatureToStorage,
  getVerifiedPremiumStatus,
  isEd25519Supported,
  type PremiumSignatureData
} from '../../utils/premiumSignature';

// Mock localStorage
const localStorageMock = {
  storage: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.storage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.storage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.storage[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.storage = {};
  }),
};

// Mock crypto.subtle for Ed25519 operations
let mockCryptoSubtle: any;

beforeEach(() => {
  // Reset localStorage mock
  localStorageMock.storage = {};
  vi.clearAllMocks();

  // Setup localStorage mock
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });

  // Setup crypto mock
  mockCryptoSubtle = {
    importKey: vi.fn(),
    verify: vi.fn(),
    generateKey: vi.fn(),
  };

  Object.defineProperty(global, 'crypto', {
    value: {
      subtle: mockCryptoSubtle,
    },
    writable: true,
    configurable: true,
  });
});

describe('premiumSignature', () => {
  describe('isEd25519Supported', () => {
    it('should return true when crypto.subtle is available', () => {
      expect(isEd25519Supported()).toBe(true);
    });

    it('should return false when crypto.subtle is not available', () => {
      Object.defineProperty(global, 'crypto', {
        value: {},
        writable: true,
        configurable: true,
      });
      expect(isEd25519Supported()).toBe(false);
    });
  });

  describe('loadPremiumSignatureFromStorage', () => {
    it('should return null when no signature is stored', () => {
      const result = loadPremiumSignatureFromStorage();
      expect(result).toBeNull();
    });

    it('should return signature data when valid data is stored', () => {
      const signatureData: PremiumSignatureData = {
        data: {
          premium: true,
          plan: 'monthly',
          timestamp: Date.now(),
        },
        signature: 'test-signature',
        publicKey: 'test-public-key',
        version: 1,
      };

      localStorageMock.storage['premium-signature'] = JSON.stringify(signatureData);
      const result = loadPremiumSignatureFromStorage();

      expect(result).toEqual(signatureData);
    });

    it('should return null when stored data has invalid structure', () => {
      localStorageMock.storage['premium-signature'] = JSON.stringify({
        data: { premium: true },
        // Missing signature, publicKey, version
      });

      const result = loadPremiumSignatureFromStorage();
      expect(result).toBeNull();
    });

    it('should return null when stored data is invalid JSON', () => {
      localStorageMock.storage['premium-signature'] = 'invalid-json';
      const result = loadPremiumSignatureFromStorage();
      expect(result).toBeNull();
    });
  });

  describe('savePremiumSignatureToStorage', () => {
    it('should save signature data to localStorage', () => {
      const signatureData: PremiumSignatureData = {
        data: {
          premium: true,
          plan: 'monthly',
          timestamp: Date.now(),
        },
        signature: 'test-signature',
        publicKey: 'test-public-key',
        version: 1,
      };

      savePremiumSignatureToStorage(signatureData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'premium-signature',
        JSON.stringify(signatureData)
      );
      expect(localStorageMock.storage['premium-signature']).toBe(JSON.stringify(signatureData));
    });
  });

  describe('verifyPremiumSignature', () => {
    it('should return false when signature verification fails', async () => {
      const signatureData: PremiumSignatureData = {
        data: {
          premium: true,
          plan: 'monthly',
          timestamp: Date.now(),
        },
        signature: 'invalid-signature',
        publicKey: 'dGVzdC1wdWJsaWMta2V5', // base64 encoded test key
        version: 1,
      };

      // Mock crypto.subtle.importKey to return a mock key
      const mockPublicKey = {} as CryptoKey;
      mockCryptoSubtle.importKey.mockResolvedValue(mockPublicKey);

      // Mock crypto.subtle.verify to return false (invalid signature)
      mockCryptoSubtle.verify.mockResolvedValue(false);

      const result = await verifyPremiumSignature(signatureData);
      expect(result).toBe(false);
      // verify may not be called if importKey fails or other errors occur
    });

    it('should return false when importKey fails', async () => {
      const signatureData: PremiumSignatureData = {
        data: {
          premium: true,
          timestamp: Date.now(),
        },
        signature: 'test-signature',
        publicKey: 'invalid-public-key',
        version: 1,
      };

      // Mock crypto.subtle.importKey to throw an error
      mockCryptoSubtle.importKey.mockRejectedValue(new Error('Invalid key format'));

      const result = await verifyPremiumSignature(signatureData);
      expect(result).toBe(false);
    });

    it('should return true when signature is valid', async () => {
      const signatureData: PremiumSignatureData = {
        data: {
          premium: true,
          plan: 'monthly',
          timestamp: Date.now(),
        },
        signature: 'dGVzdC1zaWduYXR1cmU=', // base64 encoded test signature
        publicKey: 'dGVzdC1wdWJsaWMta2V5', // base64 encoded test key
        version: 1,
      };

      // Mock crypto.subtle.importKey to return a mock key
      const mockPublicKey = {} as CryptoKey;
      mockCryptoSubtle.importKey.mockResolvedValue(mockPublicKey);

      // Mock crypto.subtle.verify to return true (valid signature)
      mockCryptoSubtle.verify.mockResolvedValue(true);

      const result = await verifyPremiumSignature(signatureData);
      expect(result).toBe(true);
      expect(mockCryptoSubtle.importKey).toHaveBeenCalled();
      expect(mockCryptoSubtle.verify).toHaveBeenCalled();
    });
  });

  describe('getVerifiedPremiumStatus', () => {
    it('should return null when no signature is stored', async () => {
      const result = await getVerifiedPremiumStatus();
      expect(result).toBeNull();
    });

    it('should return null when signature verification fails', async () => {
      const signatureData: PremiumSignatureData = {
        data: {
          premium: true,
          plan: 'monthly',
          timestamp: Date.now(),
        },
        signature: 'dGVzdC1zaWduYXR1cmU=', // base64 encoded
        publicKey: 'dGVzdC1wdWJsaWMta2V5', // base64 encoded
        version: 1,
      };

      localStorageMock.storage['premium-signature'] = JSON.stringify(signatureData);

      // Mock crypto.subtle to return invalid signature
      const mockPublicKey = {} as CryptoKey;
      mockCryptoSubtle.importKey.mockResolvedValue(mockPublicKey);
      mockCryptoSubtle.verify.mockResolvedValue(false);

      const result = await getVerifiedPremiumStatus();
      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('premium-signature');
    });

    it('should return premium status when signature is valid', async () => {
      const signatureData: PremiumSignatureData = {
        data: {
          premium: true,
          plan: 'monthly',
          expiresAt: '2026-12-31T00:00:00Z',
          purchasedAt: '2026-01-01T00:00:00Z',
          timestamp: Date.now(),
        },
        signature: 'dGVzdC1zaWduYXR1cmU=', // base64 encoded
        publicKey: 'dGVzdC1wdWJsaWMta2V5', // base64 encoded
        version: 1,
      };

      localStorageMock.storage['premium-signature'] = JSON.stringify(signatureData);

      // Mock crypto.subtle to return valid signature
      const mockPublicKey = {} as CryptoKey;
      mockCryptoSubtle.importKey.mockResolvedValue(mockPublicKey);
      mockCryptoSubtle.verify.mockResolvedValue(true);

      const result = await getVerifiedPremiumStatus();

      expect(result).toEqual({
        premium: true,
        plan: 'monthly',
        expiresAt: '2026-12-31T00:00:00Z',
        purchasedAt: '2026-01-01T00:00:00Z',
      });
    });

    it('should return premium status with minimal data when signature is valid', async () => {
      const signatureData: PremiumSignatureData = {
        data: {
          premium: false,
          timestamp: Date.now(),
        },
        signature: 'dGVzdC1zaWduYXR1cmU=', // base64 encoded
        publicKey: 'dGVzdC1wdWJsaWMta2V5', // base64 encoded
        version: 1,
      };

      localStorageMock.storage['premium-signature'] = JSON.stringify(signatureData);

      // Mock crypto.subtle to return valid signature
      const mockPublicKey = {} as CryptoKey;
      mockCryptoSubtle.importKey.mockResolvedValue(mockPublicKey);
      mockCryptoSubtle.verify.mockResolvedValue(true);

      const result = await getVerifiedPremiumStatus();

      expect(result).toEqual({
        premium: false,
      });
    });
  });
});
