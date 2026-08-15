import { afterEach, describe, expect, it } from "vitest";
import { eventSubSetupTokenMatches } from "./eventsub-admin";

describe("EventSub setup token", () => {
  const original = process.env.ADMIN_PASSWORD;

  afterEach(() => {
    if (original === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = original;
  });

  it("rejects setup when ADMIN_PASSWORD is unset", () => {
    delete process.env.ADMIN_PASSWORD;
    const req = new Request("http://localhost/api/twitch/eventsub?setup=1&token=x");
    expect(eventSubSetupTokenMatches(req, new URL(req.url))).toBe(false);
  });

  it("accepts a matching bearer token", () => {
    process.env.ADMIN_PASSWORD = "raid-key";
    const req = new Request("http://localhost/api/twitch/eventsub?setup=1", {
      headers: { authorization: "Bearer raid-key" },
    });
    expect(eventSubSetupTokenMatches(req, new URL(req.url))).toBe(true);
  });

  it("rejects a wrong query token", () => {
    process.env.ADMIN_PASSWORD = "raid-key";
    const req = new Request("http://localhost/api/twitch/eventsub?setup=1&token=nope");
    expect(eventSubSetupTokenMatches(req, new URL(req.url))).toBe(false);
  });
});
