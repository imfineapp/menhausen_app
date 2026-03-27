import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('reward offline queue behavior', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it('stores failed sync payload in offline queue', async () => {
    const { SupabaseSyncService } = await import('@/utils/supabaseSync/supabaseSyncService');
    const svc = new SupabaseSyncService({ debounceMs: 1 });
    const internal = svc as any;
    internal.supabase = {};
    internal.syncStatus.isOnline = true;
    vi.spyOn(internal, 'syncToSupabase').mockRejectedValue(new Error('offline'));

    localStorage.setItem('menhausen-language', 'en');
    svc.queueSync('preferences');
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(internal.offlineQueue.length).toBeGreaterThan(0);
  });
});
