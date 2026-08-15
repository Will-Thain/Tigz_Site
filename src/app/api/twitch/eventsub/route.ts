import { NextResponse } from "next/server";
import { writeStore } from "@/lib/store";
import {
  eventSubTimestampIsFresh,
  subscribeToStreamEvents,
  verifyEventSubHmac,
} from "@/lib/twitch-eventsub";
import { eventSubSetupTokenMatches } from "@/lib/eventsub-admin";
import type { LiveFlag } from "@/lib/twitch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const valid = await verifyEventSubHmac({
      secret,
      messageId,
      timestamp,
      body: rawBody,
      signature,
    });
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    if (!eventSubTimestampIsFresh(timestamp)) {
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
    if (!eventSubSetupTokenMatches(req, url)) {
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
