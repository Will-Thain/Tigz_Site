import { describe, expect, it } from "vitest";
import { KIT_SLOTS } from "@/data/kits";
import {
  isPlaceholderCatalogName,
  isUnpublishedSlot,
  kitSlotsInOrder,
  pickKitImage,
  resolveKitItemName,
  resolveKitShortName,
} from "./kit-display";

describe("kit display", () => {
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
