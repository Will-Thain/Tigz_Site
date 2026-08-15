import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Poll } from "@/data/polls";

const memory: Record<string, unknown> = {};

vi.mock("@/db", () => ({
  getDb: () => null,
}));

vi.mock("@/lib/store", () => ({
  readStore: async (key: string, fallback: unknown) => (key in memory ? memory[key] : fallback),
  writeStore: async (key: string, value: unknown) => {
    memory[key] = structuredClone(value);
  },
}));

import { hashVoterKey, votePoll } from "./store";

function openPoll(): Poll {
  return {
    id: "kit-meta",
    question: "What kit?",
    closesAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    active: true,
    options: [
      { id: "budget", label: "Budget", votes: 0 },
      { id: "mid", label: "Mid", votes: 0 },
    ],
  };
}

describe("poll vote uniqueness", () => {
  beforeEach(() => {
    for (const key of Object.keys(memory)) delete memory[key];
    memory.polls = [openPoll()];
    memory.pollVotes = [];
  });

  it("hashes the voter cookie the same way for the same cookie and IP", () => {
    expect(hashVoterKey("cookie-a", "1.1.1.1")).toBe(hashVoterKey("cookie-a", "1.1.1.1"));
    expect(hashVoterKey("cookie-a", "1.1.1.1")).not.toBe(hashVoterKey("cookie-b", "1.1.1.1"));
  });

  it("records one vote per poll per voter hash on the file store", async () => {
    const voter = hashVoterKey("cookie-a", "9.9.9.9");
    const first = await votePoll("kit-meta", "budget", voter);
    expect(first.ok).toBe(true);
    expect(first.polls[0]?.options.find((opt) => opt.id === "budget")?.votes).toBe(1);

    const replay = await votePoll("kit-meta", "mid", voter);
    expect(replay.ok).toBe(false);
    expect(replay.error).toBe("Already voted.");
    expect(replay.polls[0]?.options.find((opt) => opt.id === "budget")?.votes).toBe(1);
    expect(replay.polls[0]?.options.find((opt) => opt.id === "mid")?.votes).toBe(0);
  });

  it("allows a different voter hash on the same poll", async () => {
    await votePoll("kit-meta", "budget", hashVoterKey("cookie-a"));
    const second = await votePoll("kit-meta", "mid", hashVoterKey("cookie-b"));
    expect(second.ok).toBe(true);
    const poll = second.polls[0];
    expect(poll?.options.find((opt) => opt.id === "budget")?.votes).toBe(1);
    expect(poll?.options.find((opt) => opt.id === "mid")?.votes).toBe(1);
  });

  it("rejects votes after the poll is closed", async () => {
    memory.polls = [{ ...openPoll(), active: false }];
    const result = await votePoll("kit-meta", "budget", hashVoterKey("cookie-a"));
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Poll is closed.");
  });
});
