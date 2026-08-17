import { describe, expect, it } from "vitest";
import { KIT_SLOTS } from "@/data/kits";
import {
  isPlaceholderCatalogName,
  isUnpublishedSlot,
  kitSlotsInOrder,
  pickKitImage,
  resolveKitItemName,
  resolveKitShortName,
  SLOT_UI,
} from "./kit-display";

describe("kit display", () => {
  it("uses Tarkov stash cell sizes and equipment labels", () => {
    expect(SLOT_UI.Primary).toEqual({ label: "On sling", cols: 5, rows: 2 });
    expect(SLOT_UI.Secondary).toEqual({ label: "On back", cols: 5, rows: 2 });
    expect(SLOT_UI.Pistol).toEqual({ label: "Holster", cols: 3, rows: 1 });
    expect(SLOT_UI.Armor).toEqual({ label: "Body armor", cols: 3, rows: 3 });
    expect(SLOT_UI.Rig).toEqual({ label: "Tactical rig", cols: 4, rows: 3 });
    expect(SLOT_UI.Backpack).toEqual({ label: "Backpack", cols: 5, rows: 4 });
    expect(SLOT_UI.Headset).toEqual({ label: "Earpiece", cols: 2, rows: 2 });
    expect(SLOT_UI.Ammo).toEqual({ label: "Ammo", cols: 1, rows: 1 });
    expect(SLOT_UI.Backpack.rows).toBeGreaterThan(SLOT_UI.Headset.rows);
  });

  it("treats empty slots and Unpublished labels as unpublished", () => {
    expect(isUnpublishedSlot(undefined)).toBe(true);
    expect(isUnpublishedSlot({ slot: "Primary", itemId: "", label: "Unpublished" })).toBe(true);
    expect(isUnpublishedSlot({ slot: "Primary", itemId: "", label: "M4A1" })).toBe(false);
    expect(isUnpublishedSlot({ slot: "Primary", itemId: "m4", label: "Unpublished" })).toBe(false);
  });

  it("ignores json.tarkov.dev placeholder names", () => {
    const id = "5447a9cd4bdc2dbd208b4567";
    expect(isPlaceholderCatalogName(id, `${id} Name`)).toBe(true);
    expect(resolveKitItemName({ slot: "Primary", itemId: id, label: "M4A1" }, { id, name: `${id} Name` })).toBe("M4A1");
    expect(resolveKitItemName({ slot: "Primary", itemId: id, label: "M4A1" }, { id, name: "Colt M4A1" })).toBe("Colt M4A1");
    expect(resolveKitShortName({ slot: "Primary", itemId: id, label: "M4A1" }, { id, name: "Colt M4A1", shortName: `${id} ShortName` })).toBeUndefined();
    expect(resolveKitShortName({ slot: "Primary", itemId: id, label: "M4A1" }, { id, name: "Colt M4A1", shortName: "M4A1" })).toBe("M4A1");
  });

  it("prefers inspect images for weapons and grid icons for gear", () => {
    const item = {
      id: "m4",
      name: "M4A1",
      inspectImageLink: "inspect.webp",
      image512pxLink: "512.webp",
      gridImageLink: "grid.webp",
      iconLink: "icon.webp",
    };
    expect(pickKitImage("Primary", item)).toBe("inspect.webp");
    expect(pickKitImage("Armor", item)).toBe("grid.webp");
    expect(pickKitImage("Headset", { id: "hs", name: "ComTac", iconLink: "icon.webp" })).toBe("icon.webp");
  });

  it("fills every kit slot in inspect order", () => {
    const ordered = kitSlotsInOrder([{ slot: "Ammo", itemId: "m855", label: "M855" }]);
    expect(ordered.map((row) => row.slot)).toEqual([...KIT_SLOTS]);
    expect(ordered[0]?.label).toBe("Unpublished");
    expect(ordered.find((row) => row.slot === "Ammo")?.itemId).toBe("m855");
  });
});
