import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendSponsorApplication, writeStore, readStore } = vi.hoisted(() => ({
  sendSponsorApplication: vi.fn(),
  writeStore: vi.fn(async () => {}),
  readStore: vi.fn(async () => []),
}));

vi.mock("@/lib/mail", () => ({
  sendSponsorApplication,
}));

vi.mock("@/lib/store", () => ({
  readStore,
  writeStore,
}));

describe("partner apply API", () => {
  beforeEach(() => {
    sendSponsorApplication.mockReset();
    writeStore.mockClear();
    readStore.mockClear();
    process.env.RESEND_API_KEY = "re_should_not_leak";
  });

  it("returns mailto when mail is not delivered and never leaks the Resend key", async () => {
    sendSponsorApplication.mockResolvedValue({
      delivered: false,
      mailto: "mailto:Tigz@mythictalent.com?subject=test",
    });
    const { POST } = await import("./route");
    const res = await POST(
      new Request("http://localhost/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: "Acme",
          contact: "Pat",
          email: "pat@acme.test",
          campaignType: "Hardware",
          dates: "Q4",
          message: "Raid kit drop.",
        }),
      }),
    );
    const json = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.mailto).toBe("mailto:Tigz@mythictalent.com?subject=test");
    expect(JSON.stringify(json)).not.toContain("re_should_not_leak");
    expect(writeStore).toHaveBeenCalledWith("applications", expect.any(Array));
  });

  it("omits mailto after a successful Resend delivery", async () => {
    sendSponsorApplication.mockResolvedValue({
      delivered: true,
      mailto: "mailto:Tigz@mythictalent.com?subject=test",
    });
    const { POST } = await import("./route");
    const res = await POST(
      new Request("http://localhost/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: "Acme",
          contact: "Pat",
          email: "pat@acme.test",
          campaignType: "Hardware",
          dates: "Q4",
          message: "Raid kit drop.",
        }),
      }),
    );
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.ok).toBe(true);
    expect(json.mailto).toBeUndefined();
    expect(JSON.stringify(json)).not.toContain("re_should_not_leak");
  });

  it("drops honeypot submissions without mailing", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      new Request("http://localhost/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: "Bot",
          contact: "Bot",
          email: "bot@spam.test",
          message: "spam",
          website: "https://spam.test",
        }),
      }),
    );
    expect(await res.json()).toEqual({ ok: true });
    expect(sendSponsorApplication).not.toHaveBeenCalled();
    expect(writeStore).not.toHaveBeenCalled();
  });
});
