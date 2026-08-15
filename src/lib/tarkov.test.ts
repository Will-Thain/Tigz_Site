import { describe, expect, it } from "vitest";
import { isTrackerReadToken, joinQuestBoard, parseTrackerSnapshot } from "./tarkov";

describe("parseTrackerSnapshot", () => {
  it("reads tasksProgress arrays from a Tracker payload", () => {
    const snapshot = parseTrackerSnapshot({
      data: {
        playerLevel: 42,
        tasksProgress: [
          { id: "debut", complete: true },
          { taskId: "checking", complete: false },
        ],
      },
    });
    expect(snapshot?.playerLevel).toBe(42);
    expect(snapshot?.tasks).toEqual([
      { id: "debut", complete: true, failed: false, invalid: false },
      { id: "checking", complete: false, failed: false, invalid: false },
    ]);
  });

  it("returns null for non-objects", () => {
    expect(parseTrackerSnapshot(null)).toBeNull();
    expect(parseTrackerSnapshot("nope")).toBeNull();
  });
});

describe("joinQuestBoard", () => {
  const catalog = [
    { id: "debut", name: "Debut", requiresComplete: [] },
    { id: "checking", name: "Checking", trader: "Prapor", requiresComplete: ["debut"] },
    { id: "locked", name: "Locked", requiresComplete: ["missing"] },
  ];

  it("counts complete vs remaining and lists unlocked in-progress tasks", () => {
    const board = joinQuestBoard(catalog, {
      tasks: [{ id: "debut", complete: true }],
    });
    expect(board.completed).toBe(1);
    expect(board.remaining).toBe(2);
    expect(board.inProgress.map((row) => row.id)).toEqual(["checking"]);
    expect(board.complete.map((row) => row.id)).toEqual(["debut"]);
  });

  it("falls back to tracker ids when the catalog is missing", () => {
    const board = joinQuestBoard(null, {
      tasks: [{ id: "solo", complete: false }],
    });
    expect(board.inProgress[0]?.name).toBe("solo");
  });
});

describe("Tracker read token", () => {
  it("accepts GP prefixes and rejects write-looking tokens", () => {
    expect(isTrackerReadToken("PVP_abc")).toBe(true);
    expect(isTrackerReadToken("PVE_abc")).toBe(true);
    expect(isTrackerReadToken("SZN_abc")).toBe(true);
    expect(isTrackerReadToken("PVP_write_abc")).toBe(false);
    expect(isTrackerReadToken("secret")).toBe(false);
  });
});
