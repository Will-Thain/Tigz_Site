import { KIT_SLOTS, type KitItem, type KitSlot } from "@/data/kits";
import type { TarkovItemLite } from "@/lib/tarkov";

const WEAPON_SLOTS = new Set<KitSlot>(["Primary", "Secondary", "Pistol"]);

/** Weapons sit left of the PMC, matching Totov Builder /build. */
export const WEAPON_COLUMN_SLOTS: KitSlot[] = ["Primary", "Secondary", "Pistol"];

/** Gear sits right of the PMC. Ammo is a caption, not a body slot. */
export const GEAR_COLUMN_SLOTS: KitSlot[] = ["Headset", "Armor", "Rig", "Backpack"];

export const BODY_SLOTS: KitSlot[] = [...WEAPON_COLUMN_SLOTS, ...GEAR_COLUMN_SLOTS];

/**
 * Totov /build plate: html is 14px, container is 28.5rem with * { box-sizing: border-box }.
 * Outer frame is 399px including a 1px border; the webp is stretched to 397×802.
 */
export const SILHOUETTE_ASPECT = "400 / 808";
export const SILHOUETTE_FRAME_PX = 399;
export const SILHOUETTE_FRAME_EM = 28.5;
/** Overlay unit matching Totov html rem (14px). Caption type is 0.75 of this, never the layout unit. */
export const SILHOUETTE_EM_PX = 14;
export const SILHOUETTE_CAPTION_EM = 0.75;
export const SILHOUETTE_ART = "/kit/inventory-slots-selection.webp";

export type SilhouetteGlyph =
  | KitSlot
  | "Headwear"
  | "FaceCover"
  | "Armband"
  | "Eyewear"
  | "Sheath"
  | "Pouch"
  | "Pockets"
  | "Special";

export type SilhouetteZone = {
  id: string;
  label: string;
  glyph: SilhouetteGlyph;
  slot?: KitSlot;
  left: number;
  top: number;
  width: number;
  height: number;
  labelTop: number;
  labelWidth: number;
  labelHeight: number;
  showLabel: boolean;
};

const COL = { 1: 2.25, 2: 11.1, 3: 20 } as const;
const SMALL_COL = { 1: 2.25, 2: 8.49, 3: 14.6, 4: 20.7 } as const;
const ITEM_TOP = { 1: 2.4, 2: 10.4, 3: 18.45, 4: 26.65, 5: 34.85, 6: 42.8, 7: 50 } as const;
const TEXT_TOP = { 1: 1.35, 2: 9.3, 3: 17.4, 4: 25.6, 5: 33.75, 6: 41.65, 7: 48.95 } as const;
const ITEM = 6.1;
const ITEM_WIDE = 15;
const SMALL = 5.35;
const TEXT_H = 0.85;

function zone(
  id: string,
  label: string,
  glyph: SilhouetteGlyph,
  row: keyof typeof ITEM_TOP,
  col: 1 | 2 | 3,
  options: {
    slot?: KitSlot;
    wide?: boolean;
    small?: boolean;
    smallCol?: 1 | 2 | 3 | 4;
    showLabel?: boolean;
    labelWidth?: number;
  } = {},
): SilhouetteZone {
  const small = options.small === true;
  const left = small ? SMALL_COL[options.smallCol ?? 1] : COL[col];
  const width = small ? SMALL : options.wide ? ITEM_WIDE : ITEM;
  const height = small ? SMALL : ITEM;
  return {
    id,
    label,
    glyph,
    slot: options.slot,
    left,
    top: ITEM_TOP[row],
    width,
    height,
    labelTop: TEXT_TOP[row],
    labelWidth: options.labelWidth ?? width,
    labelHeight: TEXT_H,
    showLabel: options.showLabel ?? true,
  };
}

/** Character-equipment zones matching Totov Builder /build. Ghost cells are visual-only. */
export const SILHOUETTE_ZONES: SilhouetteZone[] = [
  zone("earpiece", "Earpiece", "Headset", 1, 1, { slot: "Headset" }),
  zone("headwear", "Headwear", "Headwear", 1, 2),
  zone("faceCover", "Face cover", "FaceCover", 1, 3),
  zone("armband", "Armband", "Armband", 2, 1),
  zone("bodyArmor", "Body armor", "Armor", 2, 2, { slot: "Armor" }),
  zone("eyewear", "Eyewear", "Eyewear", 2, 3),
  zone("onSling", "On sling", "Primary", 3, 1, { slot: "Primary", wide: true }),
  zone("holster", "Holster", "Pistol", 3, 3, { slot: "Pistol" }),
  zone("onBack", "On back", "Secondary", 4, 1, { slot: "Secondary", wide: true }),
  zone("scabbard", "Sheath", "Sheath", 4, 3),
  zone("tacticalRig", "Tactical rig", "Rig", 5, 1, { slot: "Rig" }),
  zone("backpack", "Backpack", "Backpack", 5, 2, { slot: "Backpack" }),
  zone("pouch", "Pouch", "Pouch", 5, 3),
  zone("pockets", "Pockets", "Pockets", 6, 1, { small: true, smallCol: 1, labelWidth: ITEM }),
  zone("pockets2", "", "Pockets", 6, 1, { small: true, smallCol: 2, showLabel: false }),
  zone("pockets3", "", "Pockets", 6, 1, { small: true, smallCol: 3, showLabel: false }),
  zone("pockets4", "", "Pockets", 6, 1, { small: true, smallCol: 4, showLabel: false }),
  zone("special", "Special", "Special", 7, 1, { small: true, smallCol: 1, labelWidth: ITEM }),
  zone("special2", "", "Special", 7, 1, { small: true, smallCol: 2, showLabel: false }),
  zone("special3", "", "Special", 7, 1, { small: true, smallCol: 3, showLabel: false }),
];

export function kitSlotForZone(id: string): KitSlot | undefined {
  return SILHOUETTE_ZONES.find((row) => row.id === id)?.slot;
}

const TILE_COLORS: Record<string, string> = {
  black: "#161612",
  blue: "#152433",
  yellow: "#2f2a14",
  orange: "#2f2212",
  violet: "#24162f",
  purple: "#24162f",
  green: "#162414",
  red: "#2c1414",
  default: "#1a1a14",
  grey: "#1e1e18",
  gray: "#1e1e18",
};

const SLOT_LABEL_ALIASES: Record<string, string> = {
  "pistol grip": "Pistol grip",
  reciever: "Receiver",
  receiver: "Receiver",
  magazine: "Magazine",
  stock: "Stock",
  charge: "Charging handle",
  muzzle: "Muzzle",
  scope: "Scope",
  tactical: "Tactical",
  foregrip: "Foregrip",
  barrel: "Barrel",
  handguard: "Handguard",
  "gas block": "Gas block",
  mount: "Mount",
  "sight rear": "Rear sight",
  "sight front": "Front sight",
  "bipod": "Bipod",
};

export type WeaponStat = {
  id: string;
  label: string;
  value: string;
};

export type ComponentNode = {
  id: string;
  slotLabel: string;
  name: string;
  shortName?: string;
  image?: string;
};

export function isUnpublishedSlot(item: KitItem | undefined): boolean {
  if (!item) return true;
  if (item.itemId) return false;
  return !item.label || item.label === "Unpublished";
}

export function isPlaceholderCatalogName(id: string, name: string): boolean {
  return name === `${id} Name` || name.startsWith(`${id} `);
}

export function resolveKitItemName(item: KitItem, catalog?: TarkovItemLite): string {
  if (catalog?.name && !isPlaceholderCatalogName(catalog.id, catalog.name)) {
    return catalog.name;
  }
  return item.label;
}

export function resolveKitShortName(item: KitItem, catalog?: TarkovItemLite): string | undefined {
  const short = catalog?.shortName;
  if (!short || !catalog) return undefined;
  if (short === `${catalog.id} ShortName` || isPlaceholderCatalogName(catalog.id, short)) return undefined;
  const name = resolveKitItemName(item, catalog);
  if (short === name) return undefined;
  return short;
}

export function pickKitImage(slot: KitSlot, catalog?: TarkovItemLite): string | undefined {
  if (!catalog) return undefined;
  const ranged = WEAPON_SLOTS.has(slot) || catalog.types?.includes("gun");
  if (ranged || !catalog.iconLink) {
    return catalog.inspectImageLink || catalog.image512pxLink || catalog.gridImageLink || catalog.iconLink;
  }
  return catalog.iconLink || catalog.gridImageLink || catalog.image512pxLink || catalog.inspectImageLink;
}

export function itemForSlot(items: KitItem[], slot: KitSlot): KitItem | undefined {
  return items.find((row) => row.slot === slot);
}

export function kitSlotsInOrder(items: KitItem[]): KitItem[] {
  return KIT_SLOTS.map((slot) => itemForSlot(items, slot) ?? { slot, itemId: "", label: "Unpublished" });
}

export function bodySlotsInOrder(items: KitItem[]): KitItem[] {
  return BODY_SLOTS.map((slot) => itemForSlot(items, slot) ?? { slot, itemId: "", label: "Unpublished" });
}

/** Stash-cell size and in-game equipment label. Not a live loadout. */
export const SLOT_UI: Record<KitSlot, { label: string; cols: number; rows: number }> = {
  Primary: { label: "On sling", cols: 5, rows: 2 },
  Secondary: { label: "On back", cols: 5, rows: 2 },
  Pistol: { label: "Holster", cols: 3, rows: 1 },
  Armor: { label: "Body armor", cols: 3, rows: 3 },
  Rig: { label: "Tactical rig", cols: 4, rows: 3 },
  Backpack: { label: "Backpack", cols: 5, rows: 4 },
  Headset: { label: "Earpiece", cols: 2, rows: 2 },
  Ammo: { label: "Ammo", cols: 1, rows: 1 },
};

export function slotCellSize(slot: KitSlot, catalog?: TarkovItemLite): { cols: number; rows: number } {
  const fallback = SLOT_UI[slot];
  const cols = catalog?.defaultWidth;
  const rows = catalog?.defaultHeight;
  if (cols && rows && cols > 0 && rows > 0) return { cols, rows };
  return { cols: fallback.cols, rows: fallback.rows };
}

export function cellBackground(color?: string): string {
  if (!color) return TILE_COLORS.default;
  return TILE_COLORS[color.toLowerCase()] ?? TILE_COLORS.default;
}

export function formatCaliber(caliber?: string): string | undefined {
  if (!caliber) return undefined;
  let text = caliber.replace(/^Caliber/i, "").trim();
  if (!text) return undefined;
  text = text.replace(/([0-9])([A-Za-z]{2,})/g, "$1 $2");
  text = text.replace(/^(\d)(\d{2})x/, "$1.$2x");
  text = text.replace(/^([456])(\d)x/, "$1.$2x");
  return text.replace(/\s+/g, " ").trim();
}

export function weaponStats(item?: TarkovItemLite): WeaponStat[] {
  if (!item) return [];
  const rows: WeaponStat[] = [];
  if (item.ergonomics != null) rows.push({ id: "ergo", label: "Ergo", value: String(item.ergonomics) });
  if (item.recoilVertical != null) {
    rows.push({ id: "vrec", label: "V recoil", value: String(item.recoilVertical) });
  }
  if (item.recoilHorizontal != null) {
    rows.push({ id: "hrec", label: "H recoil", value: String(item.recoilHorizontal) });
  }
  if (item.fireRate != null) rows.push({ id: "rof", label: "ROF", value: `${item.fireRate}` });
  if (item.weight != null) rows.push({ id: "kg", label: "Weight", value: `${item.weight.toFixed(2)} kg` });
  const caliber = formatCaliber(item.caliber);
  if (caliber) rows.push({ id: "cal", label: "Caliber", value: caliber });
  if (item.effectiveDistance != null) {
    rows.push({ id: "range", label: "Range", value: `${item.effectiveDistance} m` });
  }
  return rows;
}

function catalogDisplayName(item?: TarkovItemLite, fallback = "Unknown"): string {
  if (!item) return fallback;
  if (item.name && !isPlaceholderCatalogName(item.id, item.name)) return item.name;
  return fallback;
}

function catalogShortName(item?: TarkovItemLite): string | undefined {
  if (!item?.shortName) return undefined;
  if (item.shortName === `${item.id} ShortName` || isPlaceholderCatalogName(item.id, item.shortName)) {
    return undefined;
  }
  return item.shortName;
}

function titleCaseSlot(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function humanSlotLabel(nameId?: string, name?: string): string {
  const readableName = name?.trim();
  if (readableName && !/^mod_/i.test(readableName) && readableName !== nameId) {
    return readableName;
  }
  const raw = (nameId ?? name ?? "Attachment").replace(/^mod_/i, "").replace(/_/g, " ").trim();
  return SLOT_LABEL_ALIASES[raw.toLowerCase()] ?? titleCaseSlot(raw);
}

export function componentOverview(
  weapon?: TarkovItemLite,
  catalog?: Map<string, TarkovItemLite>,
): ComponentNode[] {
  if (!weapon?.containsIds?.length) return [];
  return weapon.containsIds.map((id) => {
    const part = catalog?.get(id);
    const slot = weapon.slots?.find((row) => row.allowedItemIds.includes(id));
    return {
      id,
      slotLabel: humanSlotLabel(slot?.nameId, slot?.name),
      name: catalogDisplayName(part, id),
      shortName: catalogShortName(part),
      image: part?.iconLink || part?.gridImageLink || part?.inspectImageLink,
    };
  });
}

export function overviewWeapon(
  items: KitItem[],
  catalog: Map<string, TarkovItemLite>,
): TarkovItemLite | undefined {
  for (const slot of WEAPON_COLUMN_SLOTS) {
    const item = itemForSlot(items, slot);
    if (!item?.itemId) continue;
    const hydrated = catalog.get(item.itemId);
    if (!hydrated) continue;
    if (weaponStats(hydrated).length > 0 || (hydrated.containsIds?.length ?? 0) > 0) return hydrated;
  }
  return undefined;
}

export function ammoCaption(
  items: KitItem[],
  catalog: Map<string, TarkovItemLite>,
): { unpublished: boolean; name: string; detail?: string } {
  const ammo = itemForSlot(items, "Ammo") ?? { slot: "Ammo" as const, itemId: "", label: "Unpublished" };
  const hydrated = ammo.itemId ? catalog.get(ammo.itemId) : undefined;
  return {
    unpublished: isUnpublishedSlot(ammo),
    name: resolveKitItemName(ammo, hydrated),
    detail: ammo.detail,
  };
}
