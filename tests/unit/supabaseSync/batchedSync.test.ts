import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('SupabaseSyncService batched sync', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('queues preferences within debounce window and sends one POST without points payload', async () => {
    localStorage.setItem('menhausen-language', 'en');

    // Import with real timers to avoid deadlocks in module init.
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

    vi.useFakeTimers();
    svc.queueSync('preferences');

    await vi.advanceTimersByTimeAsync(500);
    await Promise.resolve();

    expect(syncSpy).toHaveBeenCalledTimes(1);
    const payload = syncSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).toHaveProperty('preferences');
    expect(payload).not.toHaveProperty('points');
  }, 15000);
});
