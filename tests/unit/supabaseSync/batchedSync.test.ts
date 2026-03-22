import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('SupabaseSyncService batched sync', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('queues points and preferences within debounce window and sends one POST with both types', async () => {
    vi.useFakeTimers();
    localStorage.setItem('menhausen_points_balance', '10');
    localStorage.setItem('menhausen-language', 'en');

    const { getSyncService } = await import('@/utils/supabaseSync/supabaseSyncService');
    const svc = getSyncService();
    const internal = svc as unknown as {
      supabase: unknown;
      syncStatus: { isOnline: boolean };
      syncToSupabase: (data: Record<string, unknown>) => Promise<unknown>;
    };
    internal.supabase = {};
    internal.syncStatus.isOnline = true;
    const syncSpy = vi.spyOn(internal, 'syncToSupabase').mockResolvedValue({ success: true, syncedTypes: [] });

    svc.queueSync('points');
    svc.queueSync('preferences');

    await vi.advanceTimersByTimeAsync(500);
    await Promise.resolve();

    expect(syncSpy).toHaveBeenCalledTimes(1);
    const payload = syncSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).toHaveProperty('points');
    expect(payload).toHaveProperty('preferences');
  });
});
