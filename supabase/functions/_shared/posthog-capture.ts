/**
 * Server-side PostHog capture for Supabase Edge Functions.
 * Uses POSTHOG_API_KEY (or VITE_PUBLIC_POSTHOG_KEY) from Supabase secrets.
 */

export const POSTHOG_EVENT = {
  PURCHASE_ATTEMPT: 'purchase_attempt',
  PREMIUM_PAYMENT_CONFIRMED: 'premium_payment_confirmed',
} as const;

export type PostHogCaptureProperties = Record<string, string | number | boolean | null | undefined>;

function getPostHogConfig(): { apiKey: string; host: string } | null {
  const apiKey = Deno.env.get('POSTHOG_API_KEY') ?? Deno.env.get('VITE_PUBLIC_POSTHOG_KEY');
  if (!apiKey) {
    return null;
  }

  const host = (Deno.env.get('POSTHOG_HOST') ?? Deno.env.get('VITE_PUBLIC_POSTHOG_HOST') ?? 'https://us.i.posthog.com')
    .replace(/\/$/, '');

  return { apiKey, host };
}

/**
 * Fire-and-forget PostHog capture. Never throws — payment flow must not fail on analytics.
 */
export async function capturePostHogEvent(
  event: string,
  distinctId: string | number,
  properties?: PostHogCaptureProperties,
): Promise<void> {
  const config = getPostHogConfig();
  if (!config) {
    console.warn('[posthog-capture] PostHog API key not configured, skipping event:', event);
    return;
  }

  const distinctIdStr = String(distinctId);
  const payload = {
    api_key: config.apiKey,
    event,
    distinct_id: distinctIdStr,
    properties: {
      source: 'server',
      $lib: 'supabase-edge',
      ...properties,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${config.host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.warn('[posthog-capture] PostHog capture failed:', {
        event,
        status: response.status,
        body: body.slice(0, 200),
      });
    }
  } catch (error) {
    console.warn('[posthog-capture] PostHog capture error:', {
      event,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
