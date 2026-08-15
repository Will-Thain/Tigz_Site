import { beforeEach, describe, expect, it, vi } from "vitest";

const memory: Record<string, unknown> = {};

vi.mock("@/lib/store", () => ({
  readStore: async (key: string, fallback: unknown) => (key in memory ? memory[key] : fallback),
  writeStore: async (key: string, value: unknown) => {
    memory[key] = structuredClone(value);
  },
}));

import {
  CCV_MAX_SAMPLES,
  getAverageCcv,
  parseIcalDateTime,
  parseIcalSchedule,
  recordCcvSample,
} from "./twitch";

describe("CCV sampling", () => {
  beforeEach(() => {
    for (const key of Object.keys(memory)) delete memory[key];
  });

  it("averages stored samples and rounds", async () => {
    await recordCcvSample(100, Date.parse("2026-08-15T21:00:00.000Z"));
    await recordCcvSample(150, Date.parse("2026-08-15T21:20:00.000Z"));
    await expect(getAverageCcv()).resolves.toBe(125);
  });

  it("skips a sample within the 10 minute window", async () => {
    await recordCcvSample(100, Date.parse("2026-08-15T21:00:00.000Z"));
    await recordCcvSample(400, Date.parse("2026-08-15T21:05:00.000Z"));
    await expect(getAverageCcv()).resolves.toBe(100);
  });

  it("caps stored samples", async () => {
    const start = Date.parse("2026-08-01T00:00:00.000Z");
    for (let i = 0; i < CCV_MAX_SAMPLES + 5; i += 1) {
      await recordCcvSample(10 + i, start + i * 11 * 60 * 1000);
    }
    const samples = memory.ccvSamples as { viewers: number }[];
    expect(samples).toHaveLength(CCV_MAX_SAMPLES);
  });

  it("returns null when there are no samples", async () => {
    await expect(getAverageCcv()).resolves.toBeNull();
  });
});

describe("iCal schedule parse", () => {
  it("parses UTC compact timestamps", () => {
    expect(parseIcalDateTime("20260815T210000Z")).toBe("2026-08-15T21:00:00Z");
  });

  it("maps VEVENT fields and cancelled status", () => {
    const ical = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "DTSTART:20260815T180000Z",
      "DTEND:20260815T220000Z",
      "SUMMARY:Customs raid",
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "DTSTART:20260816T180000Z",
      "DTEND:20260816T220000Z",
      "SUMMARY:Off",
      "STATUS:CANCELLED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");
    const segments = parseIcalSchedule(ical);
    expect(segments[0]).toMatchObject({
      title: "Customs raid",
      startTime: "2026-08-15T18:00:00Z",
      canceled: false,
    });
    expect(segments[1]?.canceled).toBe(true);
  });
});
