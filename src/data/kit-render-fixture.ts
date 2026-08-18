import type { Kit } from "@/data/kits";

/**
 * Catalog IDs for plate-asset QA only. Not a Tigz loadout and not the unpublished seed.
 * Icons hydrate from json.tarkov.dev.
 */
export const KIT_RENDER_FIXTURE: Kit = {
  id: "render-fixture",
  wipe: "1.0",
  title: "Layout fixture",
  notes: "Catalog icons on the Totov plate so we can test asset rendering. Not a Tigz loadout.",
  isCurrent: false,
  publishedAt: "2026-08-18T00:00:00.000Z",
  publishedBy: "hub",
  items: [
    { slot: "Primary", itemId: "5447a9cd4bdc2dbd208b4567", label: "M4A1" },
    { slot: "Secondary", itemId: "5644bd2b4bdc2d3b4c8b4572", label: "AK-74N" },
    { slot: "Pistol", itemId: "56d59856d2720bd8418b456a", label: "P226R" },
    { slot: "Armor", itemId: "5648a7494bdc2d9d488b4583", label: "PACA" },
    { slot: "Rig", itemId: "5648a69d4bdc2ded0b8b457b", label: "BlackRock" },
    { slot: "Backpack", itemId: "544a5cde4bdc2d39388b456b", label: "MBSS" },
    { slot: "Headset", itemId: "5645bcc04bdc2d363b8b4572", label: "ComTac II" },
    { slot: "Ammo", itemId: "54527ac44bdc2d36668b4567", label: "M855A1" },
  ],
};
