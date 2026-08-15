import { afterEach, describe, expect, it, vi } from "vitest";
import { isTurnstileEnabled, verifyTurnstileToken } from "./turnstile";

describe("Turnstile verification", () => {
  const original = {
    secret: process.env.TURNSTILE_SECRET_KEY,
    site: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  };

  afterEach(() => {
    if (original.secret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = original.secret;
    if (original.site === undefined) delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    else process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = original.site;
  });

  function enableTurnstile() {
    process.env.TURNSTILE_SECRET_KEY = "turnstile-secret";
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "turnstile-site";
  }

  it("skips siteverify when the env keys are unset", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const fetchImpl = vi.fn();
    expect(isTurnstileEnabled()).toBe(false);
    await expect(verifyTurnstileToken(undefined, { fetchImpl })).resolves.toBe(true);
    await expect(verifyTurnstileToken("", { fetchImpl })).resolves.toBe(true);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fails closed when only one Turnstile env key is set", async () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "turnstile-site";
    delete process.env.TURNSTILE_SECRET_KEY;
    const fetchImpl = vi.fn();
    expect(isTurnstileEnabled()).toBe(false);
    await expect(verifyTurnstileToken("ok-token", { fetchImpl })).resolves.toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects when enabled and the token is missing", async () => {
    enableTurnstile();
    const fetchImpl = vi.fn();
    expect(isTurnstileEnabled()).toBe(true);
    await expect(verifyTurnstileToken(undefined, { fetchImpl })).resolves.toBe(false);
    await expect(verifyTurnstileToken("   ", { fetchImpl })).resolves.toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects when siteverify returns success false", async () => {
    enableTurnstile();
    const fetchImpl = vi.fn(async () => Response.json({ success: false }));
    await expect(verifyTurnstileToken("bad-token", { fetchImpl })).resolves.toBe(false);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("accepts when siteverify returns success true", async () => {
    enableTurnstile();
    const fetchImpl = vi.fn(async () => Response.json({ success: true }));
    await expect(verifyTurnstileToken("ok-token", { ip: "9.9.9.9", fetchImpl })).resolves.toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({ method: "POST" }),
    );
    const call = fetchImpl.mock.calls[0] as unknown as [string, { body: URLSearchParams }];
    expect(call[1].body.get("secret")).toBe("turnstile-secret");
    expect(call[1].body.get("response")).toBe("ok-token");
    expect(call[1].body.get("remoteip")).toBe("9.9.9.9");
  });
});
