import { afterEach, describe, expect, it, vi } from "vitest";
import { LINKS } from "./links";
import { sendSponsorApplication, sponsorMailSubject } from "./mail";

const application = {
  company: "Acme",
  contact: "Pat",
  email: "pat@acme.test",
  campaignType: "Hardware",
  dates: "Q4",
  message: "Raid kit drop.",
};

function serialized(value: unknown) {
  return JSON.stringify(value);
}

describe("partner apply routing", () => {
  const original = {
    key: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM,
    to: process.env.SPONSOR_TO,
  };

  afterEach(() => {
    if (original.key === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = original.key;
    if (original.from === undefined) delete process.env.RESEND_FROM;
    else process.env.RESEND_FROM = original.from;
    if (original.to === undefined) delete process.env.SPONSOR_TO;
    else process.env.SPONSOR_TO = original.to;
    vi.unstubAllGlobals();
  });

  it("builds the Mythic Talent subject line", () => {
    expect(sponsorMailSubject(application)).toBe("[Sponsor] Acme — Hardware — Q4");
    expect(sponsorMailSubject({ ...application, dates: "" })).toBe("[Sponsor] Acme — Hardware — TBD");
  });

  it("returns a mailto fallback when Resend is unset and never includes a secret", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendSponsorApplication(application);
    expect(result.delivered).toBe(false);
    expect(result.mailto).toBe(
      `mailto:${LINKS.talentEmail}?subject=${encodeURIComponent("[Sponsor] Acme — Hardware — Q4")}`,
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(serialized(result)).not.toContain("RESEND_API_KEY");
    expect(serialized(result)).not.toMatch(/re_[A-Za-z0-9]/);
  });

  it("posts to Resend with Reply-To and does not return the API key", async () => {
    process.env.RESEND_API_KEY = "re_secret_test_key";
    process.env.RESEND_FROM = "hub@example.com";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendSponsorApplication(application);
    expect(result.delivered).toBe(true);
    expect(result.mailto).toMatch(/^mailto:Tigz@mythictalent.com/);
    expect(serialized(result)).not.toContain("re_secret_test_key");
    expect(serialized(result)).not.toContain("RESEND_API_KEY");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.resend.com/emails");
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).toEqual({
      Authorization: "Bearer re_secret_test_key",
      "Content-Type": "application/json",
    });
    const payload = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(payload).toMatchObject({
      from: "hub@example.com",
      to: LINKS.talentEmail,
      reply_to: "pat@acme.test",
      subject: "[Sponsor] Acme — Hardware — Q4",
    });
    expect(serialized(payload)).not.toContain("re_secret_test_key");
  });
});
