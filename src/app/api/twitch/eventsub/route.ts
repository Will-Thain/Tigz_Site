import { NextResponse } from "next/server";
import { writeStore } from "@/lib/store";
import { subscribeToStreamEvents } from "@/lib/twitch-eventsub";
import type { LiveFlag } from "@/lib/twitch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REPLAY_WINDOW_MS = 10 * 60 * 1000;

type EventSubBody = {
  challenge?: string;
  subscription?: { type?: string };
  event?: { title?: unknown };
};

export async function POST(req: Request) {
  try {
    const secret = process.env.TWITCH_EVENTSUB_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "EventSub secret not configured" }, { status: 503 });
    }

    const rawBody = await req.text();
    const messageId = req.headers.get("twitch-eventsub-message-id") ?? "";
    const timestamp = req.headers.get("twitch-eventsub-message-timestamp") ?? "";
    const signature = req.headers.get("twitch-eventsub-message-signature") ?? "";
    const messageType = req.headers.get("twitch-eventsub-message-type") ?? "";

    if (!messageId || !timestamp || !signature) {
      return NextResponse.json({ error: "Missing EventSub headers" }, { status: 400 });
    }

    const expected = `sha256=${await hmacSha256Hex(secret, messageId + timestamp + rawBody)}`;
    if (!timingSafeEqual(expected, signature.toLowerCase())) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const sentAt = Date.parse(timestamp);
    if (!Number.isFinite(sentAt) || Math.abs(Date.now() - sentAt) > REPLAY_WINDOW_MS) {
      return NextResponse.json({ error: "Stale message" }, { status: 403 });
    }

    if (messageType === "webhook_callback_verification") {
      const body = parseBody(rawBody);
      const challenge = body?.challenge;
      if (!challenge) {
        return NextResponse.json({ error: "Missing challenge" }, { status: 400 });
      }
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (messageType === "revocation") {
      return new Response(null, { status: 204 });
    }

    if (messageType === "notification") {
      const body = parseBody(rawBody);
      const subType = body?.subscription?.type;
      if (subType === "stream.online") {
        const title = typeof body?.event?.title === "string" ? body.event.title : undefined;
        const payload: LiveFlag = { live: true, at: new Date().toISOString(), ...(title ? { title } : {}) };
        await writeStore("live", payload);
      } else if (subType === "stream.offline") {
        await writeStore("live", { live: false, at: new Date().toISOString() } satisfies LiveFlag);
      }
      return new Response(null, { status: 204 });
    }

    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "EventSub handler failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("setup") !== "1") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!adminTokenMatches(req, url)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await subscribeToStreamEvents();
    if (!result.ok) {
      const missing = Boolean(result.error?.includes("missing") || result.error?.includes("Missing"));
      return NextResponse.json(result, { status: missing ? 503 : 502 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}

function parseBody(raw: string): EventSubBody | null {
  try {
    return JSON.parse(raw) as EventSubBody;
  } catch {
    return null;
  }
}

function adminTokenMatches(req: Request, url: URL) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const header = req.headers.get("authorization");
  const bearer = header?.toLowerCase().startsWith("bearer ") ? header.slice(7) : "";
  const token = bearer || url.searchParams.get("token") || "";
  return timingSafeEqual(expected, token);
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
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

function timingSafeEqual(a: string, b: string) {
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
