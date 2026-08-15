/**
 * ZERO BAN-RISK
 * Kits are admin-published snapshots stored in our DB or local runtime store.
 * This module never reads the game client or Battlestate backends.
 */

import { eq } from "drizzle-orm";
import { kits as seedKits, isKitSlot, KIT_SLOTS, type Kit, type KitItem, type KitSlot } from "@/data/kits";
import { getDb } from "@/db";
import { kitItems, kits } from "@/db/schema";
import { readStore, writeStore } from "@/lib/store";

export type PublishKitInput = {
  wipe: string;
  title: string;
  notes: string;
  vodUrl?: string;
  publishedBy?: string;
  items: Array<{
    slot: string;
    itemId?: string;
    label: string;
    detail?: string;
  }>;
};

function sortItems(items: KitItem[]): KitItem[] {
  const order = new Map(KIT_SLOTS.map((slot, index) => [slot, index]));
  return [...items].sort((a, b) => (order.get(a.slot) ?? 99) - (order.get(b.slot) ?? 99));
}

function normalizeItems(items: PublishKitInput["items"]): KitItem[] {
  const bySlot = new Map<KitSlot, KitItem>();
  for (const row of items) {
    if (!isKitSlot(row.slot)) continue;
    const label = row.label.trim() || "Unpublished";
    const detail = row.detail?.trim();
    bySlot.set(row.slot, {
      slot: row.slot,
      itemId: row.itemId?.trim() ?? "",
      label,
      detail: detail || undefined,
    });
  }
  return KIT_SLOTS.map(
    (slot) => bySlot.get(slot) ?? { slot, itemId: "", label: "Unpublished" },
  );
}

function toIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

async function loadKitsFromDb(): Promise<Kit[] | null> {
  const db = getDb();
  if (!db) return null;
  const [kitRows, itemRows] = await Promise.all([
    db.select().from(kits),
    db.select().from(kitItems),
  ]);
  if (kitRows.length === 0) return null;

  const itemsByKit = new Map<string, KitItem[]>();
  for (const row of itemRows) {
    if (!isKitSlot(row.slot)) continue;
    const list = itemsByKit.get(row.kitId) ?? [];
    list.push({
      slot: row.slot,
      itemId: row.itemId,
      label: row.label,
      detail: row.detail ? row.detail : undefined,
    });
    itemsByKit.set(row.kitId, list);
  }

  return kitRows.map((row) => ({
    id: row.id,
    wipe: row.wipe,
    title: row.title,
    notes: row.notes,
    vodUrl: row.vodUrl ?? undefined,
    isCurrent: row.isCurrent,
    publishedAt: toIso(row.publishedAt),
    publishedBy: row.publishedBy,
    items: sortItems(itemsByKit.get(row.id) ?? []),
  }));
}

export async function loadKits(): Promise<Kit[]> {
  try {
    const fromDb = await loadKitsFromDb();
    if (fromDb && fromDb.length > 0) return fromDb;
  } catch {
    // Seed / file store still works if Postgres is down.
  }
  return readStore("kits", seedKits);
}

export async function getCurrentKit(): Promise<Kit> {
  const all = await loadKits();
  return all.find((kit) => kit.isCurrent) ?? all[0] ?? seedKits[0];
}

export async function getKitHistory(): Promise<Kit[]> {
  const all = await loadKits();
  return [...all].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

async function insertKitIntoDb(kit: Kit): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  await db.update(kits).set({ isCurrent: false }).where(eq(kits.isCurrent, true));
  await db.insert(kits).values({
    id: kit.id,
    wipe: kit.wipe,
    title: kit.title,
    notes: kit.notes,
    vodUrl: kit.vodUrl || null,
    isCurrent: true,
    publishedAt: new Date(kit.publishedAt),
    publishedBy: kit.publishedBy,
  });
  if (kit.items.length > 0) {
    await db.insert(kitItems).values(
      kit.items.map((item) => ({
        id: `${kit.id}-${item.slot}`,
        kitId: kit.id,
        slot: item.slot,
        itemId: item.itemId,
        label: item.label,
        detail: item.detail ?? "",
      })),
    );
  }
  return true;
}

export async function publishKit(input: PublishKitInput): Promise<Kit> {
  const title = input.title.trim();
  const wipe = input.wipe.trim();
  if (!title) throw new Error("Title is required.");
  if (!wipe) throw new Error("Wipe is required.");

  const kit: Kit = {
    id: crypto.randomUUID(),
    wipe,
    title,
    notes: input.notes.trim(),
    vodUrl: input.vodUrl?.trim() || undefined,
    isCurrent: true,
    publishedAt: new Date().toISOString(),
    publishedBy: input.publishedBy?.trim() || "admin",
    items: normalizeItems(input.items),
  };

  const previous = await loadKits();
  const snapshot = previous.map((row) => (row.isCurrent ? { ...row, isCurrent: false } : row));
  const next = [kit, ...snapshot];

  try {
    if (await insertKitIntoDb(kit)) return kit;
  } catch {
    // Fall through to the file store so publishing still works without Postgres.
  }

  await writeStore("kits", next);
  return kit;
}
