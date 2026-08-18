import { describe, expect, it } from "vitest";
import { isTrackerReadToken, itemsFromCatalogPayload, joinQuestBoard, parseTrackerSnapshot } from "./tarkov";

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

describe("itemsFromCatalogPayload", () => {
  it("reads object-map dumps from json.tarkov.dev", () => {
    const items = itemsFromCatalogPayload({
      data: {
        items: {
          m4: {
            id: "m4",
            name: "Colt M4A1",
            shortName: "M4A1",
            iconLink: "https://assets.tarkov.dev/m4-icon.webp",
            inspectImageLink: "https://assets.tarkov.dev/m4-image.webp",
            gridImageLink: "https://assets.tarkov.dev/m4-grid-image.webp",
            image512pxLink: "https://assets.tarkov.dev/m4-512.webp",
          },
        },
      },
    });
    expect(items?.[0]).toMatchObject({
      id: "m4",
      name: "Colt M4A1",
      shortName: "M4A1",
      iconLink: "https://assets.tarkov.dev/m4-icon.webp",
      gridImageLink: "https://assets.tarkov.dev/m4-grid-image.webp",
      inspectImageLink: "https://assets.tarkov.dev/m4-image.webp",
      image512pxLink: "https://assets.tarkov.dev/m4-512.webp",
    });
  });

  it("replaces json.tarkov.dev placeholder names from the items_en locale dump", () => {
    const items = itemsFromCatalogPayload(
      {
        data: {
          items: {
            m4: {
              id: "5447a9cd4bdc2dbd208b4567",
              name: "5447a9cd4bdc2dbd208b4567 Name",
              shortName: "5447a9cd4bdc2dbd208b4567 ShortName",
              iconLink: "https://assets.tarkov.dev/m4-icon.webp",
            },
          },
        },
      },
      {
        data: {
          "5447a9cd4bdc2dbd208b4567 Name": "Colt M4A1 5.56x45 assault rifle",
          "5447a9cd4bdc2dbd208b4567 ShortName": "M4A1",
        },
      },
    );
    expect(items?.[0]).toMatchObject({
      id: "5447a9cd4bdc2dbd208b4567",
      name: "Colt M4A1 5.56x45 assault rifle",
      shortName: "M4A1",
    });
  });

  it("reads weapon properties, slots, and contained parts", () => {
    const items = itemsFromCatalogPayload({
      items: [
        {
          id: "m4",
          name: "Colt M4A1",
          weight: 2.9,
          types: ["gun"],
          containsItems: [{ item: "grip", count: 1 }, { item: { id: "mag" }, count: 1 }],
          properties: {
            caliber: "Caliber556x45NATO",
            ergonomics: 48,
            recoilVertical: 119,
            recoilHorizontal: 342,
            fireRate: 800,
            effectiveDistance: 500,
            recoilModifier: -4,
            accuracyModifier: -2,
            centerOfImpact: 0.0182,
            initialSpeed: 922,
            damage: 54,
            capacity: 30,
            fireModes: ["single", "fullauto"],
            defaultWidth: 5,
            defaultHeight: 2,
            slots: [
              {
                nameId: "mod_pistol_grip",
                name: "Pistol Grip",
                filters: { allowedItems: ["grip", { id: "other" }] },
              },
            ],
          },
        },
      ],
    });
    expect(items?.[0]).toMatchObject({
      id: "m4",
      weight: 2.9,
      types: ["gun"],
      caliber: "Caliber556x45NATO",
      ergonomics: 48,
      recoilVertical: 119,
      recoilHorizontal: 342,
      fireRate: 800,
      effectiveDistance: 500,
      recoilModifier: -4,
      accuracyModifier: -2,
      centerOfImpact: 0.0182,
      initialSpeed: 922,
      damage: 54,
      capacity: 30,
      fireModes: ["single", "fullauto"],
      containsIds: ["grip", "mag"],
      defaultWidth: 5,
      defaultHeight: 2,
      slots: [{ nameId: "mod_pistol_grip", name: "Pistol Grip", allowedItemIds: ["grip", "other"] }],
    });
  });

  it("still accepts item arrays", () => {
    const items = itemsFromCatalogPayload({ items: [{ id: "ak", name: "AK-74N" }] });
    expect(items?.[0]).toMatchObject({ id: "ak", name: "AK-74N" });
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
