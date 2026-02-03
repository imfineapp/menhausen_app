/**
 * Unit tests for telegramStarsPaymentService.ts
 * Tests Telegram Stars payment flow
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { telegramStarsPaymentService } from '../../utils/telegramStarsPaymentService';
import * as telegramUserUtils from '../../utils/telegramUserUtils';
import * as authService from '../../utils/supabaseSync/authService';

// Mock dependencies
vi.mock('../../utils/telegramUserUtils', () => ({
  getTelegramUserId: vi.fn(),
}));

vi.mock('../../utils/supabaseSync/authService', () => ({
  getValidJWTToken: vi.fn(),
}));

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

// Mock window.Telegram
const createTelegramMock = (initData?: string, openInvoice?: any) => ({
  WebApp: {
    initData: initData || 'test-init-data',
    openInvoice: openInvoice || vi.fn(),
    HapticFeedback: {
      notificationOccurred: vi.fn(),
    },
  },
});

// Mock fetch
const fetchMock = vi.fn();

beforeEach(() => {
  // Reset mocks
  localStorageMock.storage = {};
  vi.clearAllMocks();

  // Setup localStorage
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

  // Setup fetch - replace global.fetch from setup.ts
  global.fetch = fetchMock as any;

  // Setup Telegram mock - use assignment instead of defineProperty
  (window as any).Telegram = createTelegramMock();

  // Setup environment variable - need to clear module cache to reload with new env
  vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
  
  // Force reload the module to pick up new env var
  // Note: This is a workaround - in real scenario, env vars are read at import time
  // We'll check the actual URL used instead of expecting a specific one

  // Default mocks
  vi.mocked(telegramUserUtils.getTelegramUserId).mockReturnValue('123456789');
  vi.mocked(authService.getValidJWTToken).mockResolvedValue('test-jwt-token');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('TelegramStarsPaymentService', () => {
  describe('createInvoice', () => {
    it('should create invoice successfully', async () => {
      const mockResponse = {
        success: true,
        invoiceUrl: 'https://t.me/invoice/test123',
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const invoiceUrl = await telegramStarsPaymentService.createInvoice('monthly');

      expect(invoiceUrl).toBe('https://t.me/invoice/test123');
      expect(fetchMock).toHaveBeenCalled();
      const fetchCall = fetchMock.mock.calls[0];
      
      // Check URL contains expected path (env var might be different)
      expect(fetchCall[0]).toContain('/functions/v1/create-premium-invoice');
      expect(fetchCall[1]?.method).toBe('POST');
      
      // Headers can be Headers object or plain object
      const headers = fetchCall[1]?.headers;
      if (headers instanceof Headers) {
        expect(headers.get('Content-Type')).toBe('application/json');
        expect(headers.get('Authorization')).toBe('Bearer test-jwt-token');
        expect(headers.get('X-Telegram-Init-Data')).toBe('test-init-data');
      } else {
        expect(headers?.['Content-Type']).toBe('application/json');
        expect(headers?.['Authorization']).toBe('Bearer test-jwt-token');
        expect(headers?.['X-Telegram-Init-Data']).toBe('test-init-data');
      }
      
      expect(fetchCall[1]?.body).toBe(JSON.stringify({ planType: 'monthly' }));
    });

    it('should throw error when Telegram user ID is not available', async () => {
      vi.mocked(telegramUserUtils.getTelegramUserId).mockReturnValue(null);

      await expect(telegramStarsPaymentService.createInvoice('monthly')).rejects.toThrow(
        'Telegram user ID not available'
      );
    });

    it('should throw error when initData is not available', async () => {
      (window as any).Telegram = { WebApp: {} };

      await expect(telegramStarsPaymentService.createInvoice('monthly')).rejects.toThrow(
        'Telegram WebApp initData not available'
      );
    });

    it('should throw error when JWT token is not available', async () => {
      vi.mocked(authService.getValidJWTToken).mockResolvedValue(null);

      await expect(telegramStarsPaymentService.createInvoice('monthly')).rejects.toThrow(
        'JWT token not available'
      );
    });

    it('should throw error when API returns error', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          success: false,
          error: 'Invalid plan type',
        }),
      });

      await expect(telegramStarsPaymentService.createInvoice('monthly')).rejects.toThrow(
        'Invalid plan type'
      );
    });

    it('should throw error when response is not ok and has no error message', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ success: false }),
      });

      await expect(telegramStarsPaymentService.createInvoice('monthly')).rejects.toThrow(
        'Failed to create invoice'
      );
    });
  });

  describe('openInvoice', () => {
    it('should open invoice and return paid status', async () => {
      const mockOpenInvoice = vi.fn((url: string, callback: (status: string) => void) => {
        callback('paid');
      });

      (window as any).Telegram = createTelegramMock('test-init-data', mockOpenInvoice);

      const status = await telegramStarsPaymentService.openInvoice('https://t.me/invoice/test123');

      expect(status).toBe('paid');
      expect(mockOpenInvoice).toHaveBeenCalledWith(
        'https://t.me/invoice/test123',
        expect.any(Function)
      );
    });

    it('should return failed when Telegram WebApp API is not available', async () => {
      (window as any).Telegram = { WebApp: {} };

      const status = await telegramStarsPaymentService.openInvoice('https://t.me/invoice/test123');

      expect(status).toBe('failed');
    });

    it('should handle cancelled status', async () => {
      const mockOpenInvoice = vi.fn((url: string, callback: (status: string) => void) => {
        callback('cancelled');
      });

      (window as any).Telegram = createTelegramMock('test-init-data', mockOpenInvoice);

      const status = await telegramStarsPaymentService.openInvoice('https://t.me/invoice/test123');

      expect(status).toBe('cancelled');
    });
  });

  describe('handlePaymentResult', () => {
    it('should update localStorage and dispatch event on paid status', async () => {
      const mockHapticFeedback = vi.fn();
      (window as any).Telegram = {
        WebApp: {
          HapticFeedback: {
            notificationOccurred: mockHapticFeedback,
          },
        },
      };

      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

      await telegramStarsPaymentService.handlePaymentResult('paid', 'monthly');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('user-premium-status', 'true');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user-premium-plan', 'monthly');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user-premium-purchased-at',
        expect.any(String)
      );

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'premium:activated',
          detail: expect.objectContaining({
            planType: 'monthly',
            timestamp: expect.any(Number),
          }),
        })
      );

      expect(mockHapticFeedback).toHaveBeenCalledWith('success');
    });

    it('should trigger warning haptic feedback on cancelled status', async () => {
      const mockHapticFeedback = vi.fn();
      (window as any).Telegram = {
        WebApp: {
          HapticFeedback: {
            notificationOccurred: mockHapticFeedback,
          },
        },
      };

      await telegramStarsPaymentService.handlePaymentResult('cancelled', 'monthly');

      expect(mockHapticFeedback).toHaveBeenCalledWith('warning');
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('user-premium-status', 'true');
    });

    it('should trigger error haptic feedback on failed status', async () => {
      const mockHapticFeedback = vi.fn();
      (window as any).Telegram = {
        WebApp: {
          HapticFeedback: {
            notificationOccurred: mockHapticFeedback,
          },
        },
      };

      await telegramStarsPaymentService.handlePaymentResult('failed', 'monthly');

      expect(mockHapticFeedback).toHaveBeenCalledWith('error');
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('user-premium-status', 'true');
    });
  });

  describe('purchasePremium', () => {
    it('should complete full payment flow successfully', async () => {
      const mockResponse = {
        success: true,
        invoiceUrl: 'https://t.me/invoice/test123',
      };

      const mockOpenInvoice = vi.fn((url: string, callback: (status: string) => void) => {
        callback('paid');
      });

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      (window as any).Telegram = createTelegramMock('test-init-data', mockOpenInvoice);

      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

      const status = await telegramStarsPaymentService.purchasePremium('annually');

      expect(status).toBe('paid');
      expect(fetchMock).toHaveBeenCalled();
      expect(mockOpenInvoice).toHaveBeenCalled();
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'premium:activated',
        })
      );
    });

    it('should throw error when createInvoice fails', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          success: false,
          error: 'Invalid request',
        }),
      });

      await expect(telegramStarsPaymentService.purchasePremium('lifetime')).rejects.toThrow(
        'Invalid request'
      );
    });
  });
});
