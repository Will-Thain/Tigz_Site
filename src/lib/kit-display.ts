import { KIT_SLOTS, type KitItem, type KitSlot } from "@/data/kits";
import type { TarkovItemLite } from "@/lib/tarkov";

const WEAPON_SLOTS = new Set<KitSlot>(["Primary", "Secondary", "Pistol"]);

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
  if (WEAPON_SLOTS.has(slot)) {
    return catalog.inspectImageLink || catalog.image512pxLink || catalog.gridImageLink || catalog.iconLink;
  }
  return catalog.gridImageLink || catalog.iconLink || catalog.image512pxLink || catalog.inspectImageLink;
}

export function itemForSlot(items: KitItem[], slot: KitSlot): KitItem | undefined {
  return items.find((row) => row.slot === slot);
}

export function kitSlotsInOrder(items: KitItem[]): KitItem[] {
  return KIT_SLOTS.map((slot) => itemForSlot(items, slot) ?? { slot, itemId: "", label: "Unpublished" });
}
