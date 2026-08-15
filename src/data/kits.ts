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

export const kits: Kit[] = [
  {
    id: "placeholder-current",
    wipe: "1.0",
    title: "Waiting on first publish",
    notes:
      "This is not a live pull from Escape from Tarkov. When Tigz or a mod publishes a kit in /admin, it will replace this card. Until then the slots below are a layout demo only.",
    isCurrent: true,
    publishedAt: "2026-08-15T00:00:00.000Z",
    publishedBy: "hub",
    items: [
      { slot: "Primary", itemId: "", label: "Unpublished", detail: "Rifle + optic TBD" },
      { slot: "Secondary", itemId: "", label: "Unpublished", detail: "SMG / shotgun TBD" },
      { slot: "Pistol", itemId: "", label: "Unpublished" },
      { slot: "Armor", itemId: "", label: "Unpublished", detail: "Class TBD" },
      { slot: "Rig", itemId: "", label: "Unpublished" },
      { slot: "Backpack", itemId: "", label: "Unpublished" },
      { slot: "Headset", itemId: "", label: "Unpublished" },
      { slot: "Ammo", itemId: "", label: "Unpublished", detail: "Caliber TBD" },
    ],
  },
];

export function currentKit() {
  return kits.find((kit) => kit.isCurrent) ?? kits[0];
}

export function kitHistory() {
  return [...kits].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
