import { vi } from 'vitest';

export function withMockedFetch() {
  const originalFetch = globalThis.fetch;
  (globalThis as any).fetch = vi.fn();
  return {
    restore() {
      globalThis.fetch = originalFetch;
    },
  };
}
