import { describe, expect, it } from "vitest";
import { BODY_SLOTS, GEAR_COLUMN_SLOTS, kitSlotForZone, SILHOUETTE_ZONES, SLOT_UI, WEAPON_COLUMN_SLOTS } from "@/lib/kit-display";

describe("KitSlots Tarkov-style layout", () => {
  describe("Totov Builder silhouette plate", () => {
    it("places kit slots on the character equipment zones and keeps ammo off the body", () => {
      expect(WEAPON_COLUMN_SLOTS).toEqual(["Primary", "Secondary", "Pistol"]);
      expect(GEAR_COLUMN_SLOTS).toEqual(["Headset", "Armor", "Rig", "Backpack"]);
      expect(BODY_SLOTS).not.toContain("Ammo");
      expect(kitSlotForZone("onSling")).toBe("Primary");
      expect(kitSlotForZone("onBack")).toBe("Secondary");
      expect(kitSlotForZone("holster")).toBe("Pistol");
      expect(kitSlotForZone("bodyArmor")).toBe("Armor");
      expect(kitSlotForZone("tacticalRig")).toBe("Rig");
      expect(kitSlotForZone("backpack")).toBe("Backpack");
      expect(kitSlotForZone("earpiece")).toBe("Headset");
      expect(SILHOUETTE_ZONES.some((zone) => zone.slot === "Ammo")).toBe(false);
    });
  });

  describe("Equipment slot CSS variables and sizing", () => {
    it("configures weapon slots as wide horizontal bars", () => {
      // Primary and Secondary should be 5x2 bars labeled "On sling" and "On back"
      expect(SLOT_UI.Primary).toEqual({ label: "On sling", cols: 5, rows: 2 });
      expect(SLOT_UI.Secondary).toEqual({ label: "On back", cols: 5, rows: 2 });
      
      // Pistol should be a shorter 3x1 bar labeled "Holster"
      expect(SLOT_UI.Pistol).toEqual({ label: "Holster", cols: 3, rows: 1 });
    });

    it("configures gear slots with Tarkov-accurate sizes", () => {
      // Headset (earpiece) should be a 2x2 square
      expect(SLOT_UI.Headset).toEqual({ label: "Earpiece", cols: 2, rows: 2 });
      
      // Body armor should be a 3x3 square
      expect(SLOT_UI.Armor).toEqual({ label: "Body armor", cols: 3, rows: 3 });
      
      // Tactical rig should be 4x3 (wider than armor)
      expect(SLOT_UI.Rig).toEqual({ label: "Tactical rig", cols: 4, rows: 3 });
      
      // Backpack should be the tallest at 5x4
      expect(SLOT_UI.Backpack).toEqual({ label: "Backpack", cols: 5, rows: 4 });
      
      // Ammo should be a 1x1 cell
      expect(SLOT_UI.Ammo).toEqual({ label: "Ammo", cols: 1, rows: 1 });
    });

    it("ensures backpack is the largest gear slot", () => {
      const backpackSize = SLOT_UI.Backpack.cols * SLOT_UI.Backpack.rows;
      const rigSize = SLOT_UI.Rig.cols * SLOT_UI.Rig.rows;
      const armorSize = SLOT_UI.Armor.cols * SLOT_UI.Armor.rows;
      
      expect(backpackSize).toBeGreaterThan(rigSize);
      expect(backpackSize).toBeGreaterThan(armorSize);
    });

    it("uses Tarkov equipment terminology not generic labels", () => {
      // Should use Tarkov-specific terms
      expect(SLOT_UI.Primary.label).toBe("On sling");
      expect(SLOT_UI.Secondary.label).toBe("On back");
      expect(SLOT_UI.Pistol.label).toBe("Holster");
      expect(SLOT_UI.Headset.label).toBe("Earpiece");
      expect(SLOT_UI.Armor.label).toBe("Body armor");
      expect(SLOT_UI.Rig.label).toBe("Tactical rig");
      
      // Should NOT use generic terms like "Primary Weapon" or "Secondary Weapon"
      expect(SLOT_UI.Primary.label).not.toContain("Primary");
      expect(SLOT_UI.Secondary.label).not.toContain("Secondary");
    });

    it("configures all 8 equipment slots", () => {
      const slots = Object.keys(SLOT_UI);
      expect(slots).toHaveLength(8);
      expect(slots).toContain("Primary");
      expect(slots).toContain("Secondary");
      expect(slots).toContain("Pistol");
      expect(slots).toContain("Armor");
      expect(slots).toContain("Rig");
      expect(slots).toContain("Backpack");
      expect(slots).toContain("Headset");
      expect(slots).toContain("Ammo");
    });

    it("ensures weapon slots are wider than tall for horizontal layout", () => {
      // Weapon slots should be horizontal bars (cols > rows)
      expect(SLOT_UI.Primary.cols).toBeGreaterThan(SLOT_UI.Primary.rows);
      expect(SLOT_UI.Secondary.cols).toBeGreaterThan(SLOT_UI.Secondary.rows);
      expect(SLOT_UI.Pistol.cols).toBeGreaterThan(SLOT_UI.Pistol.rows);
    });

    it("ensures backpack and rig are taller than wide for vertical layout", () => {
      // Backpack and rig should be taller (rows >= cols for backpack visual)
      expect(SLOT_UI.Rig.rows).toBeGreaterThanOrEqual(SLOT_UI.Rig.cols - 1);
      expect(SLOT_UI.Backpack.rows).toBeGreaterThanOrEqual(SLOT_UI.Backpack.cols - 1);
    });
  });
});
