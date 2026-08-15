import { beforeEach, describe, expect, it, vi } from "vitest";

const { isAdmin, subscribeToStreamEvents } = vi.hoisted(() => ({
  isAdmin: vi.fn(async () => false),
  subscribeToStreamEvents: vi.fn(async () => ({ ok: true, callback: "https://example.test/api/twitch/eventsub", results: [] })),
}));

vi.mock("@/lib/admin", () => ({ isAdmin }));
vi.mock("@/lib/twitch-eventsub", () => ({ subscribeToStreamEvents }));

describe("admin EventSub subscribe", () => {
  beforeEach(() => {
    isAdmin.mockReset();
    subscribeToStreamEvents.mockReset();
    isAdmin.mockResolvedValue(false);
    subscribeToStreamEvents.mockResolvedValue({
      ok: true,
      callback: "https://example.test/api/twitch/eventsub",
      results: [],
    });
  });

  it("rejects anonymous setup", async () => {
    const { POST } = await import("./route");
    const res = await POST();
    expect(res.status).toBe(401);
    expect(subscribeToStreamEvents).not.toHaveBeenCalled();
  });

  it("subscribes when the caller is admin", async () => {
    isAdmin.mockResolvedValue(true);
    const { POST } = await import("./route");
    const res = await POST();
    expect(res.status).toBe(200);
    expect(subscribeToStreamEvents).toHaveBeenCalledTimes(1);
    await expect(res.json()).resolves.toMatchObject({ ok: true });
  });
});
