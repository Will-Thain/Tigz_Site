import { describe, expect, it } from "vitest";
import { KIT_SLOTS } from "@/data/kits";
import {
  ammoCaption,
  BODY_SLOTS,
  cellBackground,
  componentOverview,
  formatCaliber,
  GEAR_COLUMN_SLOTS,
  humanSlotLabel,
  isPlaceholderCatalogName,
  isUnpublishedSlot,
  kitSlotsInOrder,
  overviewWeapon,
  pickKitImage,
  resolveKitItemName,
  resolveKitShortName,
  slotCellSize,
  SLOT_UI,
  WEAPON_COLUMN_SLOTS,
  weaponStats,
} from "./kit-display";
import type { TarkovItemLite } from "./tarkov";

const m4: TarkovItemLite = {
  id: "m4",
  name: "Colt M4A1",
  shortName: "M4A1",
  weight: 2.9,
  caliber: "Caliber556x45NATO",
  ergonomics: 48,
  recoilVertical: 119,
  recoilHorizontal: 342,
  fireRate: 800,
  effectiveDistance: 500,
  defaultWidth: 5,
  defaultHeight: 2,
  backgroundColor: "black",
  containsIds: ["grip", "mag", "receiver"],
  slots: [
    { nameId: "mod_pistol_grip", name: "Pistol Grip", allowedItemIds: ["grip"] },
    { nameId: "mod_magazine", name: "Magazine", allowedItemIds: ["mag"] },
    { nameId: "mod_reciever", name: "Receiver", allowedItemIds: ["receiver"] },
  ],
};

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

  it("keeps ammo off the PMC body and groups Totov columns", () => {
    expect(BODY_SLOTS).not.toContain("Ammo");
    expect(BODY_SLOTS).toHaveLength(7);
    expect(WEAPON_COLUMN_SLOTS).toEqual(["Primary", "Secondary", "Pistol"]);
    expect(GEAR_COLUMN_SLOTS).toEqual(["Headset", "Armor", "Rig", "Backpack"]);
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

  it("formats Tarkov caliber ids for the stat strip", () => {
    expect(formatCaliber("Caliber556x45NATO")).toBe("5.56x45 NATO");
    expect(formatCaliber("Caliber762x39")).toBe("7.62x39");
    expect(formatCaliber("Caliber9x19PARA")).toBe("9x19 PARA");
    expect(formatCaliber("Caliber46x30")).toBe("4.6x30");
    expect(formatCaliber(undefined)).toBeUndefined();
  });

  it("maps catalog background colors onto stash tiles", () => {
    expect(cellBackground("black")).toBe("#161612");
    expect(cellBackground("blue")).toBe("#152433");
    expect(cellBackground("unknown")).toBe("#1a1a14");
    expect(cellBackground()).toBe("#1a1a14");
  });

  it("uses published defaultWidth/Height when the catalog has stash size", () => {
    expect(slotCellSize("Primary", m4)).toEqual({ cols: 5, rows: 2 });
    expect(slotCellSize("Armor", { id: "armor", name: "Trooper", defaultWidth: 4, defaultHeight: 3 })).toEqual({
      cols: 4,
      rows: 3,
    });
    expect(slotCellSize("Headset")).toEqual({ cols: 2, rows: 2 });
  });

  it("builds a gun stat overview from catalog properties", () => {
    expect(weaponStats(m4)).toEqual([
      { id: "ergo", label: "Ergo", value: "48" },
      { id: "vrec", label: "V recoil", value: "119" },
      { id: "hrec", label: "H recoil", value: "342" },
      { id: "rof", label: "ROF", value: "800" },
      { id: "kg", label: "Weight", value: "2.90 kg" },
      { id: "cal", label: "Caliber", value: "5.56x45 NATO" },
      { id: "range", label: "Range", value: "500 m" },
    ]);
    expect(weaponStats(undefined)).toEqual([]);
  });

  it("labels contained parts from weapon slot filters", () => {
    const catalog = new Map<string, TarkovItemLite>([
      ["grip", { id: "grip", name: "MIAD pistol grip", shortName: "MIAD", iconLink: "grip.webp" }],
      ["mag", { id: "mag", name: "Stanag", shortName: "STANAG" }],
      ["receiver", { id: "receiver", name: "Upper receiver" }],
    ]);
    expect(humanSlotLabel("mod_reciever", "Receiver")).toBe("Receiver");
    expect(humanSlotLabel("mod_charge")).toBe("Charging handle");
    expect(componentOverview(m4, catalog)).toEqual([
      { id: "grip", slotLabel: "Pistol Grip", name: "MIAD pistol grip", shortName: "MIAD", image: "grip.webp" },
      { id: "mag", slotLabel: "Magazine", name: "Stanag", shortName: "STANAG", image: undefined },
      { id: "receiver", slotLabel: "Receiver", name: "Upper receiver", shortName: undefined, image: undefined },
    ]);
  });

  it("uses the first published weapon for stats and shows ammo as a caption", () => {
    const catalog = new Map<string, TarkovItemLite>([["m4", m4]]);
    const items = [
      { slot: "Primary" as const, itemId: "m4", label: "M4A1" },
      { slot: "Ammo" as const, itemId: "m855", label: "M855A1" },
    ];
    expect(overviewWeapon(items, catalog)?.id).toBe("m4");
    expect(ammoCaption(items, catalog)).toEqual({ unpublished: false, name: "M855A1", detail: undefined });
    expect(ammoCaption([], catalog).unpublished).toBe(true);
  });
});
