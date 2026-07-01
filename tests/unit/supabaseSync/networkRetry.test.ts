import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/utils/supabaseSync/authService', () => ({
  getValidJWTToken: vi.fn().mockResolvedValue('fake.jwt.token'),
}));

describe('SupabaseSyncService network retry', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('retries transient Failed to fetch errors before succeeding', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ success: true, syncedTypes: ['preferences'] }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const { getSyncService } = await import('@/utils/supabaseSync/supabaseSyncService');
    const svc = getSyncService();
    await (svc as unknown as { initializationPromise: Promise<void> }).initializationPromise;

    const internal = svc as unknown as {
      supabase: unknown;
      config: { maxRetries: number; retryDelayMs: number };
      syncToSupabase: (data: Record<string, unknown>) => Promise<{ success: boolean }>;
    };
    internal.supabase = {};
    internal.config.maxRetries = 3;
    internal.config.retryDelayMs = 1;

    const result = await internal.syncToSupabase({ preferences: { theme: 'dark' } });

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      mode: 'cors',
      credentials: 'omit',
      method: 'POST',
    });
  });
});
