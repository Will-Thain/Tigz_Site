import { TWITCH_USER_ID } from "./links";
import { appAccessToken } from "./twitch";

const SUB_TYPES = ["stream.online", "stream.offline"] as const;

export const EVENTSUB_REPLAY_WINDOW_MS = 10 * 60 * 1000;

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function timingSafeEqual(a: string, b: string) {
  const encoder = new TextEncoder();
  const aa = encoder.encode(a);
  const bb = encoder.encode(b);
  const len = Math.max(aa.length, bb.length);
  let mismatch = aa.length ^ bb.length;
  for (let i = 0; i < len; i++) {
    mismatch |= (aa[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return mismatch === 0;
}

export async function eventSubSignature(
  secret: string,
  messageId: string,
  timestamp: string,
  body: string,
): Promise<string> {
  return `sha256=${await hmacSha256Hex(secret, messageId + timestamp + body)}`;
}

export async function verifyEventSubHmac(input: {
  secret: string;
  messageId: string;
  timestamp: string;
  body: string;
  signature: string;
}): Promise<boolean> {
  if (!input.messageId || !input.timestamp || !input.signature) return false;
  const expected = await eventSubSignature(input.secret, input.messageId, input.timestamp, input.body);
  return timingSafeEqual(expected, input.signature.toLowerCase());
}

export function eventSubTimestampIsFresh(
  timestamp: string,
  now = Date.now(),
  windowMs = EVENTSUB_REPLAY_WINDOW_MS,
) {
  const sentAt = Date.parse(timestamp);
  return Number.isFinite(sentAt) && Math.abs(now - sentAt) <= windowMs;
}

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
