import { describe, expect, it } from "vitest";
import {
  EVENTSUB_REPLAY_WINDOW_MS,
  eventSubSignature,
  eventSubTimestampIsFresh,
  verifyEventSubHmac,
} from "./twitch-eventsub";

describe("EventSub HMAC verification", () => {
  const secret = "test-eventsub-secret";
  const messageId = "msg-1";
  const timestamp = "2026-08-15T21:00:00.000Z";
  const body = JSON.stringify({ subscription: { type: "stream.online" } });

  it("accepts a signature computed over id + timestamp + raw body", async () => {
    const signature = await eventSubSignature(secret, messageId, timestamp, body);
    await expect(
      verifyEventSubHmac({ secret, messageId, timestamp, body, signature }),
    ).resolves.toBe(true);
  });

  it("accepts an uppercase hex digest because comparison is case-insensitive", async () => {
    const signature = (await eventSubSignature(secret, messageId, timestamp, body)).toUpperCase();
    await expect(
      verifyEventSubHmac({ secret, messageId, timestamp, body, signature }),
    ).resolves.toBe(true);
  });

  it("rejects a signature for a different body", async () => {
    const signature = await eventSubSignature(secret, messageId, timestamp, body);
    await expect(
      verifyEventSubHmac({
        secret,
        messageId,
        timestamp,
        body: JSON.stringify({ subscription: { type: "stream.offline" } }),
        signature,
      }),
    ).resolves.toBe(false);
  });

  it("rejects a signature made with the wrong secret", async () => {
    const signature = await eventSubSignature("other-secret", messageId, timestamp, body);
    await expect(
      verifyEventSubHmac({ secret, messageId, timestamp, body, signature }),
    ).resolves.toBe(false);
  });

  it("rejects missing headers instead of treating them as valid", async () => {
    const signature = await eventSubSignature(secret, messageId, timestamp, body);
    await expect(
      verifyEventSubHmac({ secret, messageId: "", timestamp, body, signature }),
    ).resolves.toBe(false);
    await expect(
      verifyEventSubHmac({ secret, messageId, timestamp: "", body, signature }),
    ).resolves.toBe(false);
    await expect(
      verifyEventSubHmac({ secret, messageId, timestamp, body, signature: "" }),
    ).resolves.toBe(false);
  });
});

describe("EventSub timestamp freshness", () => {
  it("accepts a timestamp inside the replay window", () => {
    const now = Date.parse("2026-08-15T21:05:00.000Z");
    expect(eventSubTimestampIsFresh("2026-08-15T21:00:00.000Z", now)).toBe(true);
  });

  it("rejects a stale timestamp", () => {
    const now = Date.parse("2026-08-15T21:20:00.000Z");
    expect(eventSubTimestampIsFresh("2026-08-15T21:00:00.000Z", now)).toBe(false);
  });

  it("accepts a timestamp exactly at the replay window", () => {
    const sent = "2026-08-15T21:00:00.000Z";
    const now = Date.parse(sent) + EVENTSUB_REPLAY_WINDOW_MS;
    expect(eventSubTimestampIsFresh(sent, now)).toBe(true);
  });

  it("rejects a timestamp just outside the replay window", () => {
    const sent = "2026-08-15T21:00:00.000Z";
    const now = Date.parse(sent) + EVENTSUB_REPLAY_WINDOW_MS + 1;
    expect(eventSubTimestampIsFresh(sent, now)).toBe(false);
  });

  it("rejects a future timestamp outside the replay window", () => {
    const now = Date.parse("2026-08-15T21:00:00.000Z");
    expect(eventSubTimestampIsFresh("2026-08-15T21:20:00.000Z", now)).toBe(false);
  });

  it("rejects an unparseable timestamp", () => {
    expect(eventSubTimestampIsFresh("not-a-date", Date.parse("2026-08-15T21:00:00.000Z"))).toBe(false);
  });
});
