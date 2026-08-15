import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eventSubSignature } from "@/lib/twitch-eventsub";

const { writeStore } = vi.hoisted(() => ({
  writeStore: vi.fn(async () => {}),
}));

vi.mock("@/lib/store", () => ({
  writeStore,
  readStore: vi.fn(),
}));

describe("EventSub webhook route", () => {
  const secret = "route-secret";
  const originalSecret = process.env.TWITCH_EVENTSUB_SECRET;

  beforeEach(() => {
    process.env.TWITCH_EVENTSUB_SECRET = secret;
    writeStore.mockClear();
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.TWITCH_EVENTSUB_SECRET;
    else process.env.TWITCH_EVENTSUB_SECRET = originalSecret;
  });

  async function signedRequest(opts: {
    body: string;
    signature?: string;
    timestamp?: string;
    type?: string;
  }) {
    const timestamp = opts.timestamp ?? new Date().toISOString();
    const messageId = "evt-1";
    const signature =
      opts.signature ?? (await eventSubSignature(secret, messageId, timestamp, opts.body));
    return new Request("http://localhost/api/twitch/eventsub", {
      method: "POST",
      headers: {
        "twitch-eventsub-message-id": messageId,
        "twitch-eventsub-message-timestamp": timestamp,
        "twitch-eventsub-message-signature": signature,
        "twitch-eventsub-message-type": opts.type ?? "notification",
      },
      body: opts.body,
    });
  }

  it("accepts a valid HMAC and stores stream.online", async () => {
    const { POST } = await import("./route");
    const body = JSON.stringify({
      subscription: { type: "stream.online" },
      event: { title: "Customs" },
    });
    const res = await POST(await signedRequest({ body }));
    expect(res.status).toBe(204);
    expect(writeStore).toHaveBeenCalledWith(
      "live",
      expect.objectContaining({ live: true, title: "Customs" }),
    );
  });

  it("rejects an invalid HMAC without writing live state", async () => {
    const { POST } = await import("./route");
    const body = JSON.stringify({ subscription: { type: "stream.online" } });
    const res = await POST(await signedRequest({ body, signature: "sha256=deadbeef" }));
    expect(res.status).toBe(403);
    expect(writeStore).not.toHaveBeenCalled();
  });
});
