import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookies, getAuthSession } = vi.hoisted(() => ({
  cookies: vi.fn(async () => ({ get: (_name?: string) => undefined as { value: string } | undefined })),
  getAuthSession: vi.fn(async () => null),
}));

vi.mock("next/headers", () => ({ cookies }));
vi.mock("@/lib/auth", () => ({ getAuthSession }));

import { isAdmin } from "./admin";

describe("admin lock", () => {
  const original = {
    password: process.env.ADMIN_PASSWORD,
    ids: process.env.ADMIN_TWITCH_IDS,
  };

  beforeEach(() => {
    cookies.mockReset();
    cookies.mockResolvedValue({ get: () => undefined });
    getAuthSession.mockReset();
    getAuthSession.mockResolvedValue(null);
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_TWITCH_IDS;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    if (original.password === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = original.password;
    if (original.ids === undefined) delete process.env.ADMIN_TWITCH_IDS;
    else process.env.ADMIN_TWITCH_IDS = original.ids;
  });

  it("locks production when no password and no allowlist are set", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(isAdmin()).resolves.toBe(false);
    expect(getAuthSession).not.toHaveBeenCalled();
  });

  it("allows a matching admin password cookie", async () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.ADMIN_PASSWORD = "raid-key";
    cookies.mockResolvedValue({
      get: (name?: string) => (name === "tigz_admin" ? { value: "raid-key" } : undefined),
    });
    await expect(isAdmin()).resolves.toBe(true);
  });
});
