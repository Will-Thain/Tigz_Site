export const KIT_SLOTS = [
  "Primary",
  "Secondary",
  "Pistol",
  "Armor",
  "Rig",
  "Backpack",
  "Headset",
  "Ammo",
] as const;

export type KitSlot = (typeof KIT_SLOTS)[number];

export function isKitSlot(value: string): value is KitSlot {
  return (KIT_SLOTS as readonly string[]).includes(value);
}

export type KitItem = {
  slot: KitSlot;
  itemId: string;
  label: string;
  detail?: string;
};

export type Kit = {
  id: string;
  wipe: string;
  title: string;
  notes: string;
  vodUrl?: string;
  isCurrent: boolean;
  publishedAt: string;
  publishedBy: string;
  items: KitItem[];
};

/** Catalog IDs for the public example plate. Not a Tigz loadout. */
export const EXAMPLE_KIT_ITEMS: KitItem[] = [
  { slot: "Primary", itemId: "5447a9cd4bdc2dbd208b4567", label: "M4A1" },
  { slot: "Secondary", itemId: "5644bd2b4bdc2d3b4c8b4572", label: "AK-74N" },
  { slot: "Pistol", itemId: "56d59856d2720bd8418b456a", label: "P226R" },
  { slot: "Armor", itemId: "5648a7494bdc2d9d488b4583", label: "PACA" },
  { slot: "Rig", itemId: "5648a69d4bdc2ded0b8b457b", label: "BlackRock" },
  { slot: "Backpack", itemId: "544a5cde4bdc2d39388b456b", label: "MBSS" },
  { slot: "Headset", itemId: "5645bcc04bdc2d363b8b4572", label: "ComTac II" },
  { slot: "Ammo", itemId: "54527ac44bdc2d36668b4567", label: "M855A1" },
];

export const kits: Kit[] = [
  {
    id: "example-kit",
    wipe: "1.0",
    title: "Example kit",
    notes:
      "Catalog demo for the character plate. Not a Tigz loadout. Publish from /admin/kit to replace it.",
    isCurrent: true,
    publishedAt: "2026-08-18T00:00:00.000Z",
    publishedBy: "hub",
    items: EXAMPLE_KIT_ITEMS,
  },
];

export function currentKit() {
  return kits.find((kit) => kit.isCurrent) ?? kits[0];
}

export function kitHistory() {
  return [...kits].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
