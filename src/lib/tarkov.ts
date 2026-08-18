/**
 * ZERO BAN-RISK
 * This module may fetch the public item/quest catalog from json.tarkov.dev only.
 * It must never call Battlestate backends, unofficial profile APIs, player.tarkov.dev,
 * or ingest players.tarkov.dev profile JSON.
 *
 * TarkovTracker.org is optional and read-only (GP token). Never a write token.
 */

import { characterProgress, type CharacterProgress } from "@/data/progress";
import { getDb } from "@/db";
import { questCache } from "@/db/schema";
import { readStore, writeStore } from "@/lib/store";

const CATALOG_BASE = "https://json.tarkov.dev";
const TRACKER_PROGRESS_URL = "https://api.tarkovtracker.org/progress";
const TRACKER_UA = "TigzHub/1.0 (+https://github.com/Tigz_Site)";

export type CatalogSlot = {
  nameId: string;
  name: string;
  allowedItemIds: string[];
};

export type TarkovItemLite = {
  id: string;
  name: string;
  shortName?: string;
  iconLink?: string;
  gridImageLink?: string;
  inspectImageLink?: string;
  image512pxLink?: string;
  backgroundColor?: string;
  weight?: number;
  types?: string[];
  caliber?: string;
  ergonomics?: number;
  recoilVertical?: number;
  recoilHorizontal?: number;
  fireRate?: number;
  velocity?: number;
  effectiveDistance?: number;
  fireModes?: string[];
  containsIds?: string[];
  slots?: CatalogSlot[];
  defaultWidth?: number;
  defaultHeight?: number;
};

export type CatalogTask = {
  id: string;
  name: string;
  trader?: string;
  minPlayerLevel?: number;
  requiresComplete: string[];
};

export type TrackerTaskState = {
  id: string;
  complete: boolean;
  failed?: boolean;
  invalid?: boolean;
};

export type TrackerSnapshot = {
  playerLevel?: number;
  tasks: TrackerTaskState[];
  fetchedAt?: string;
};

export type PersistedQuestCache = {
  etag: string;
  body: unknown;
  fetchedAt: string;
};

export type JoinedQuest = {
  id: string;
  name: string;
  trader?: string;
  status: "complete" | "in-progress";
};

export type QuestBoard = {
  completed: number;
  remaining: number;
  inProgress: JoinedQuest[];
  complete: JoinedQuest[];
};

type TrackerCache = { etag: string; body: unknown };
let trackerCache: TrackerCache | null = null;

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function rowsFromUnknown(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  const rec = asRecord(value);
  if (!rec) return null;
  const values = Object.values(rec);
  if (values.length === 0) return [];
  if (values.every((row) => row && typeof row === "object")) return values;
  return null;
}

function unwrapCatalogArray(data: unknown, keys: string[]): unknown[] | null {
  if (Array.isArray(data)) return data;
  const obj = asRecord(data);
  if (!obj) return null;
  for (const key of keys) {
    const rows = rowsFromUnknown(obj[key]);
    if (rows) return rows;
  }
  if ("data" in obj) return unwrapCatalogArray(obj.data, keys);
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

async function fetchCatalogJson(path: string): Promise<unknown | null> {
  try {
    const res = await fetch(`${CATALOG_BASE}${path}`, {
      next: { revalidate: 60 * 60 * 12 },
      headers: { Accept: "application/json", "User-Agent": TRACKER_UA },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value.filter((row): row is string => typeof row === "string" && row.trim().length > 0);
  return out.length > 0 ? out : undefined;
}

function idList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const ids: string[] = [];
  for (const row of value) {
    if (typeof row === "string" && row.trim()) {
      ids.push(row);
      continue;
    }
    const rec = asRecord(row);
    const id = optionalString(rec?.id);
    if (id) ids.push(id);
  }
  return ids.length > 0 ? ids : undefined;
}

function mapContainsIds(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const ids: string[] = [];
  for (const row of value) {
    if (typeof row === "string" && row.trim()) {
      ids.push(row);
      continue;
    }
    const rec = asRecord(row);
    if (!rec) continue;
    if (typeof rec.item === "string" && rec.item.trim()) {
      ids.push(rec.item);
      continue;
    }
    const nested = asRecord(rec.item);
    const nestedId = optionalString(nested?.id) ?? optionalString(rec.id);
    if (nestedId) ids.push(nestedId);
  }
  return ids.length > 0 ? ids : undefined;
}

function mapCatalogSlots(value: unknown): CatalogSlot[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const slots: CatalogSlot[] = [];
  for (const row of value) {
    const rec = asRecord(row);
    if (!rec) continue;
    const nameId = optionalString(rec.nameId) ?? optionalString(rec.name);
    if (!nameId) continue;
    const filters = asRecord(rec.filters);
    const allowed = idList(filters?.allowedItems) ?? idList(rec.allowedItems) ?? [];
    slots.push({
      nameId,
      name: optionalString(rec.name) ?? nameId,
      allowedItemIds: allowed,
    });
  }
  return slots.length > 0 ? slots : undefined;
}

function mapItems(data: unknown[]): TarkovItemLite[] {
  const items: TarkovItemLite[] = [];
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    const id = typeof item.id === "string" ? item.id : null;
    const name = typeof item.name === "string" ? item.name : null;
    if (!id || !name) continue;
    const props = asRecord(item.properties);
    items.push({
      id,
      name,
      shortName: optionalString(item.shortName),
      iconLink: optionalString(item.iconLink),
      gridImageLink: optionalString(item.gridImageLink),
      inspectImageLink: optionalString(item.inspectImageLink),
      image512pxLink: optionalString(item.image512pxLink),
      backgroundColor: optionalString(item.backgroundColor),
      weight: optionalNumber(item.weight),
      types: stringList(item.types),
      caliber: optionalString(props?.caliber),
      ergonomics: optionalNumber(props?.ergonomics) ?? optionalNumber(item.ergonomicsModifier),
      recoilVertical: optionalNumber(props?.recoilVertical),
      recoilHorizontal: optionalNumber(props?.recoilHorizontal),
      fireRate: optionalNumber(props?.fireRate),
      velocity: optionalNumber(props?.velocity) ?? optionalNumber(item.velocity),
      effectiveDistance: optionalNumber(props?.effectiveDistance),
      fireModes: stringList(props?.fireModes),
      containsIds: mapContainsIds(item.containsItems) ?? mapContainsIds(props?.containsItems),
      slots: mapCatalogSlots(props?.slots) ?? mapCatalogSlots(item.slots),
      defaultWidth: optionalNumber(props?.defaultWidth),
      defaultHeight: optionalNumber(props?.defaultHeight),
    });
  }
  return items;
}

function isCatalogPlaceholder(id: string, value: string): boolean {
  return value === `${id} Name` || value === `${id} ShortName` || value.startsWith(`${id} `);
}

export function localeMapFromPayload(data: unknown): Record<string, string> {
  const rec = asRecord(data);
  const inner = rec ? (asRecord(rec.data) ?? rec) : null;
  if (!inner) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(inner)) {
    if (typeof value === "string" && value.trim()) out[key] = value;
  }
  return out;
}

export function applyItemLocale(item: TarkovItemLite, locale: Record<string, string>): TarkovItemLite {
  const name = locale[`${item.id} Name`];
  const shortName = locale[`${item.id} ShortName`];
  return {
    ...item,
    name: name && !isCatalogPlaceholder(item.id, name) ? name : item.name,
    shortName:
      shortName && !isCatalogPlaceholder(item.id, shortName) ? shortName : item.shortName,
  };
}

export function itemsFromCatalogPayload(data: unknown, localeData?: unknown): TarkovItemLite[] | null {
  const rows = unwrapCatalogArray(data, ["items"]);
  if (!rows) return null;
  const items = mapItems(rows);
  if (localeData == null) return items;
  const locale = localeMapFromPayload(localeData);
  if (Object.keys(locale).length === 0) return items;
  return items.map((item) => applyItemLocale(item, locale));
}

export async function fetchCatalogItemIndex(): Promise<TarkovItemLite[] | null> {
  const [data, locale] = await Promise.all([
    fetchCatalogJson("/regular/items"),
    fetchCatalogJson("/regular/items_en"),
  ]);
  if (data == null) return null;
  return itemsFromCatalogPayload(data, locale);
}

export async function hydrateItemsById(ids: string[]): Promise<Map<string, TarkovItemLite>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const map = new Map<string, TarkovItemLite>();
  if (unique.length === 0) return map;

  const items = await fetchCatalogItemIndex();
  if (!items) return map;
  const index = new Map(items.map((item) => [item.id, item]));

  const add = (id: string) => {
    const item = index.get(id);
    if (!item || map.has(id)) return;
    map.set(id, item);
    for (const contained of item.containsIds ?? []) add(contained);
  };
  for (const id of unique) add(id);
  return map;
}

function traderName(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  const rec = asRecord(value);
  if (typeof rec?.name === "string" && rec.name.trim()) return rec.name;
  return undefined;
}

function requirementIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids: string[] = [];
  for (const row of value) {
    const rec = asRecord(row);
    if (!rec) continue;
    const status = rec.status;
    const needsComplete =
      !Array.isArray(status) || status.length === 0 || status.includes("complete");
    if (!needsComplete) continue;
    const task = asRecord(rec.task);
    const id =
      (typeof task?.id === "string" && task.id) ||
      (typeof rec.taskId === "string" && rec.taskId) ||
      (typeof rec.id === "string" && rec.id) ||
      "";
    if (id) ids.push(id);
  }
  return ids;
}

function mapTasks(data: unknown[]): CatalogTask[] {
  const tasks: CatalogTask[] = [];
  for (const row of data) {
    const rec = asRecord(row);
    if (!rec) continue;
    const id = typeof rec.id === "string" ? rec.id : null;
    const name = typeof rec.name === "string" ? rec.name : null;
    if (!id || !name) continue;
    tasks.push({
      id,
      name,
      trader: traderName(rec.trader),
      minPlayerLevel: typeof rec.minPlayerLevel === "number" ? rec.minPlayerLevel : undefined,
      requiresComplete: requirementIds(rec.taskRequirements ?? rec.requirements),
    });
  }
  return tasks;
}

export async function fetchCatalogTasks(): Promise<CatalogTask[] | null> {
  const data = await fetchCatalogJson("/regular/tasks");
  if (data == null) return null;
  const rows = unwrapCatalogArray(data, ["tasks"]);
  if (!rows) return null;
  return mapTasks(rows);
}

function parseTrackerTask(id: string, value: unknown): TrackerTaskState | null {
  if (typeof value === "boolean") {
    return { id, complete: value };
  }
  const rec = asRecord(value);
  if (!rec) return null;
  const complete = rec.complete === true || rec.status === "completed" || rec.state === "completed";
  const failed = rec.failed === true || rec.status === "failed" || rec.state === "failed";
  const invalid = rec.invalid === true;
  return { id, complete, failed, invalid };
}

function tasksFromProgress(payload: Record<string, unknown>): TrackerTaskState[] {
  const fromArray: unknown =
    payload.tasksProgress ?? payload.taskProgress ?? payload.tasks;
  if (Array.isArray(fromArray)) {
    const tasks: TrackerTaskState[] = [];
    for (const row of fromArray) {
      const rec = asRecord(row);
      if (!rec) continue;
      const id = typeof rec.id === "string" ? rec.id : typeof rec.taskId === "string" ? rec.taskId : "";
      if (!id) continue;
      const parsed = parseTrackerTask(id, rec);
      if (parsed) tasks.push(parsed);
    }
    if (tasks.length > 0) return tasks;
  }

  const fromMap =
    asRecord(payload.taskCompletions) ??
    asRecord(payload.tasksProgress) ??
    asRecord(payload.tasks);
  if (!fromMap) return [];
  const tasks: TrackerTaskState[] = [];
  for (const [id, value] of Object.entries(fromMap)) {
    const parsed = parseTrackerTask(id, value);
    if (parsed) tasks.push(parsed);
  }
  return tasks;
}

export function parseTrackerSnapshot(raw: unknown): TrackerSnapshot | null {
  const root = asRecord(raw);
  if (!root) return null;
  const payload = asRecord(root.data) ?? root;
  const tasks = tasksFromProgress(payload);
  const playerLevel =
    typeof payload.playerLevel === "number"
      ? payload.playerLevel
      : typeof payload.level === "number"
        ? payload.level
        : undefined;
  if (tasks.length === 0 && playerLevel == null) return { tasks: [], playerLevel };
  return { tasks, playerLevel };
}

export function isTrackerReadToken(token: string) {
  if (/write/i.test(token)) return false;
  return /^(PVP_|PVE_|SZN_)/.test(token);
}

async function persistQuestCache(entry: PersistedQuestCache) {
  trackerCache = { etag: entry.etag, body: entry.body };
  await writeStore("questCache", entry);
  const db = getDb();
  if (!db) return;
  try {
    await db
      .insert(questCache)
      .values({
        id: "tracker",
        etag: entry.etag,
        payload: entry.body,
        fetchedAt: new Date(entry.fetchedAt),
      })
      .onConflictDoUpdate({
        target: questCache.id,
        set: {
          etag: entry.etag,
          payload: entry.body,
          fetchedAt: new Date(entry.fetchedAt),
        },
      });
  } catch {
    // File store is enough without Postgres.
  }
}

async function loadPersistedCache(): Promise<PersistedQuestCache | null> {
  const stored = await readStore<PersistedQuestCache | null>("questCache", null);
  if (stored?.body) {
    trackerCache = { etag: stored.etag ?? "", body: stored.body };
    return stored;
  }
  return null;
}

export async function fetchTrackerProgress(): Promise<TrackerSnapshot | null> {
  const token = process.env.TARKOVTRACKER_TOKEN;
  if (!token || !isTrackerReadToken(token)) return null;

  const persisted = await loadPersistedCache();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "User-Agent": TRACKER_UA,
    Accept: "application/json",
  };
  if (trackerCache?.etag) headers["If-None-Match"] = trackerCache.etag;

  try {
    const res = await fetch(TRACKER_PROGRESS_URL, {
      headers,
      next: { revalidate: 300 },
    });
    if (res.status === 304 && trackerCache) {
      const snapshot = parseTrackerSnapshot(trackerCache.body);
      return snapshot
        ? { ...snapshot, fetchedAt: persisted?.fetchedAt ?? new Date().toISOString() }
        : null;
    }
    if (!res.ok) {
      const snapshot = trackerCache ? parseTrackerSnapshot(trackerCache.body) : null;
      return snapshot ? { ...snapshot, fetchedAt: persisted?.fetchedAt } : null;
    }
    const body: unknown = await res.json();
    const etag = res.headers.get("etag") ?? trackerCache?.etag ?? "";
    const fetchedAt = new Date().toISOString();
    await persistQuestCache({ etag, body, fetchedAt });
    const snapshot = parseTrackerSnapshot(body);
    return snapshot ? { ...snapshot, fetchedAt } : null;
  } catch {
    const snapshot = trackerCache ? parseTrackerSnapshot(trackerCache.body) : null;
    return snapshot ? { ...snapshot, fetchedAt: persisted?.fetchedAt } : null;
  }
}

export function joinQuestBoard(catalog: CatalogTask[] | null, tracker: TrackerSnapshot): QuestBoard {
  const catalogTasks: CatalogTask[] =
    catalog && catalog.length > 0
      ? catalog
      : tracker.tasks.map((task) => ({
          id: task.id,
          name: task.id,
          requiresComplete: [],
        }));

  const completeIds = new Set(
    tracker.tasks.filter((task) => task.complete && !task.failed && !task.invalid).map((task) => task.id),
  );
  const failedIds = new Set(tracker.tasks.filter((task) => task.failed || task.invalid).map((task) => task.id));

  const complete: JoinedQuest[] = [];
  const inProgressRows: CatalogTask[] = [];

  for (const task of catalogTasks) {
    if (failedIds.has(task.id)) continue;
    if (completeIds.has(task.id)) {
      complete.push({ id: task.id, name: task.name, trader: task.trader, status: "complete" });
      continue;
    }
    const unlocked = task.requiresComplete.every((id) => completeIds.has(id));
    const levelOk =
      task.minPlayerLevel == null || tracker.playerLevel == null || tracker.playerLevel >= task.minPlayerLevel;
    if (unlocked && levelOk) inProgressRows.push(task);
  }

  complete.sort((a, b) => a.name.localeCompare(b.name));
  inProgressRows.sort(
    (a, b) => (a.minPlayerLevel ?? 0) - (b.minPlayerLevel ?? 0) || a.name.localeCompare(b.name),
  );

  return {
    completed: complete.length,
    remaining: catalogTasks.filter((task) => !completeIds.has(task.id) && !failedIds.has(task.id)).length,
    inProgress: inProgressRows.slice(0, 16).map((task) => ({
      id: task.id,
      name: task.name,
      trader: task.trader,
      status: "in-progress" as const,
    })),
    complete: complete.slice(0, 16),
  };
}

export async function loadProgress(): Promise<CharacterProgress> {
  return readStore("progress", characterProgress);
}

export async function saveProgress(input: Partial<CharacterProgress>): Promise<CharacterProgress> {
  const current = await loadProgress();
  const next: CharacterProgress = {
    ...current,
    pmcLevel: String(input.pmcLevel ?? current.pmcLevel).trim() || "—",
    pmcKd: String(input.pmcKd ?? current.pmcKd).trim() || "—",
    scavKd: String(input.scavKd ?? current.scavKd).trim() || "—",
    survival: String(input.survival ?? current.survival).trim() || "—",
    hideoutNotes: String(input.hideoutNotes ?? current.hideoutNotes),
    questNotes: String(input.questNotes ?? current.questNotes),
    updatedAt: new Date().toISOString(),
    source: "admin",
  };
  await writeStore("progress", next);
  return next;
}
