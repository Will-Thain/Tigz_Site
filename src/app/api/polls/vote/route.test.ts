import { beforeEach, describe, expect, it, vi } from "vitest";

const { votePoll, getAuthSession, verifyTurnstileToken } = vi.hoisted(() => ({
  votePoll: vi.fn(),
  getAuthSession: vi.fn(async (): Promise<{ twitchId?: string } | null> => null),
  verifyTurnstileToken: vi.fn(async () => true),
}));

vi.mock("@/app/api/polls/store", () => ({
  hashVoterKey: (cookie: string, ip?: string) => `hash:${cookie}:${ip ?? ""}`,
  votePoll,
}));

vi.mock("@/lib/auth", () => ({ getAuthSession }));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstileToken }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
}));

describe("poll vote API", () => {
  beforeEach(() => {
    votePoll.mockReset();
    getAuthSession.mockReset();
    getAuthSession.mockResolvedValue(null);
    verifyTurnstileToken.mockReset();
    verifyTurnstileToken.mockResolvedValue(true);
  });

  it("votes with twitch:id when a Twitch session is present", async () => {
    getAuthSession.mockResolvedValue({ twitchId: "4242" });
    votePoll.mockImplementation(async (_poll: string, _option: string, voterKey: string) => {
      if (voterKey === "twitch:4242" && votePoll.mock.calls.filter((call) => call[2] === "twitch:4242").length > 1) {
        return { ok: false, error: "Already voted.", polls: [] };
      }
      return { ok: true, polls: [] };
    });

    const { POST } = await import("./route");
    const first = await POST(
      new Request("http://localhost/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: "kit-meta", optionId: "budget" }),
      }),
    );
    expect(first.status).toBe(200);
    expect(votePoll.mock.calls[0]).toEqual(["kit-meta", "budget", "twitch:4242"]);
    expect(votePoll.mock.calls[1]?.[2]).toMatch(/^hash:/);

    const replay = await POST(
      new Request("http://localhost/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: "kit-meta", optionId: "mid" }),
      }),
    );
    expect(replay.status).toBe(409);
    expect(votePoll).toHaveBeenCalledWith("kit-meta", "mid", "twitch:4242");
  });
});
