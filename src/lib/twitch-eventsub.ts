import { TWITCH_USER_ID } from "./links";
import { appAccessToken } from "./twitch";

const SUB_TYPES = ["stream.online", "stream.offline"] as const;

export type EventSubSetupResult = {
  type: (typeof SUB_TYPES)[number];
  ok: boolean;
  status: number;
  id?: string;
  error?: string;
};

function callbackUrl() {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return site ? `${site}/api/twitch/eventsub` : null;
}

export async function subscribeToStreamEvents(): Promise<{
  ok: boolean;
  callback: string | null;
  results: EventSubSetupResult[];
  error?: string;
}> {
  const token = await appAccessToken();
  const clientId = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_EVENTSUB_SECRET;
  const callback = callbackUrl();
  const userId = process.env.TWITCH_BROADCASTER_ID ?? TWITCH_USER_ID;

  if (!token || !clientId) {
    return { ok: false, callback, results: [], error: "Twitch credentials missing" };
  }
  if (!secret) {
    return { ok: false, callback, results: [], error: "TWITCH_EVENTSUB_SECRET missing" };
  }
  if (!callback) {
    return { ok: false, callback, results: [], error: "NEXT_PUBLIC_SITE_URL missing" };
  }

  const results = await Promise.all(
    SUB_TYPES.map((type) => createSubscription({ type, token, clientId, secret, callback, userId })),
  );
  return { ok: results.every((row) => row.ok), callback, results };
}

async function createSubscription(opts: {
  type: (typeof SUB_TYPES)[number];
  token: string;
  clientId: string;
  secret: string;
  callback: string;
  userId: string;
}): Promise<EventSubSetupResult> {
  try {
    const res = await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.token}`,
        "Client-Id": opts.clientId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: opts.type,
        version: "1",
        condition: { broadcaster_user_id: opts.userId },
        transport: {
          method: "webhook",
          callback: opts.callback,
          secret: opts.secret,
        },
      }),
      cache: "no-store",
    });

    const json = (await res.json().catch(() => null)) as
      | { data?: Array<{ id?: string }>; message?: string; error?: string }
      | null;

    // 409 = subscription already exists
    if (res.ok || res.status === 409) {
      return {
        type: opts.type,
        ok: true,
        status: res.status,
        id: json?.data?.[0]?.id,
      };
    }

    return {
      type: opts.type,
      ok: false,
      status: res.status,
      error: json?.message ?? json?.error ?? `HTTP ${res.status}`,
    };
  } catch {
    return { type: opts.type, ok: false, status: 0, error: "Network error" };
  }
}
