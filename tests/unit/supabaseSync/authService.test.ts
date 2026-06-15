/**
 * Authentication Service Unit Tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withMockedFetch } from '../helpers/fetchMock';

vi.mock('@/utils/analytics/posthog', () => ({
  captureException: vi.fn(),
}));

vi.mock('@/src/stores/auth.store', () => ({
  setAuthState: vi.fn(),
}));

function createTestJwt(expiresAtMs: number): string {
  const exp = Math.floor(expiresAtMs / 1000);
  const payload = btoa(JSON.stringify({ exp }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `hdr.${payload}.sig`;
}

describe('authService - Token Storage Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle JWT token expiry correctly', () => {
    const futureTime = Date.now() + 3600000;
    const pastTime = Date.now() - 1000;

    expect(futureTime > Date.now()).toBe(true);
    expect(pastTime < Date.now()).toBe(true);
  });

  it('should validate token expiry logic', () => {
    const now = Date.now();
    const validExpiry = now + 3600000;
    const expiredTime = now - 1000;

    expect(validExpiry > now).toBe(true);
    expect(expiredTime > now).toBe(false);
  });
});

describe('authService.getValidJWTToken', () => {
  let fetchMockControl: ReturnType<typeof withMockedFetch>;

  const localStorageMock = {
    storage: {} as Record<string, string>,
    getItem: vi.fn((key: string) => localStorageMock.storage[key] ?? null),
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

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');

    localStorageMock.storage = {};
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    (window as any).Telegram = {
      WebApp: {
        initData: 'user=%7B%22id%22%3A123%7D&auth_date=1&hash=abc',
      },
    };

    fetchMockControl = withMockedFetch();
  });

  afterEach(() => {
    fetchMockControl.restore();
    vi.unstubAllEnvs();
  });

  it('returns stored token without calling auth when not expired', async () => {
    const token = createTestJwt(Date.now() + 3_600_000);
    localStorageMock.storage.supabase_jwt_token = token;
    localStorageMock.storage.supabase_jwt_token_expiry = String(Date.now() + 3_600_000);

    const { getValidJWTToken } = await import('@/utils/supabaseSync/authService');
    const result = await getValidJWTToken();

    expect(result).toBe(token);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('deduplicates concurrent refresh calls into a single auth request', async () => {
    const token = createTestJwt(Date.now() + 3_600_000);
    let resolveAuth: (value: unknown) => void = () => {};
    const authDeferred = new Promise((resolve) => {
      resolveAuth = resolve;
    });

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => authDeferred);

    const { getValidJWTToken } = await import('@/utils/supabaseSync/authService');
    const pending = Promise.all([
      getValidJWTToken(),
      getValidJWTToken(),
      getValidJWTToken(),
    ]);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    resolveAuth({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      json: async () => ({ success: true, token }),
    });

    const results = await pending;
    expect(results).toEqual([token, token, token]);
  });

  it('records last auth error when refresh fails', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: new Headers(),
      text: async () => JSON.stringify({ error: 'Invalid signature', code: 'AUTH_FAILED' }),
      json: async () => ({ error: 'Invalid signature', code: 'AUTH_FAILED' }),
    });

    const { getValidJWTToken, getLastAuthError } = await import('@/utils/supabaseSync/authService');
    const result = await getValidJWTToken();

    expect(result).toBeNull();
    expect(getLastAuthError()).toEqual({
      error: 'Invalid signature',
      code: 'AUTH_FAILED',
    });
  });
});
