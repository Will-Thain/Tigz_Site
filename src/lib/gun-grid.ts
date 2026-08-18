import {
  formatErgoModifier,
  humanSlotLabel,
  installedMods,
  pickItemIcon,
  treeWeight,
  type InstalledMod,
} from "@/lib/kit-display";
import type { CatalogSlot, TarkovItemLite } from "@/lib/tarkov";

/**
 * db4tarkov /gun layout (not-big): image width 500/9.89+1, header 12, gap 1.5.
 * Columns run muzzle (11) → stock (0). Negative y is above the bore, positive below.
 */
export const DB4_IMAGE_PX = 500 / 9.89 + 1;
export const DB4_HEADER_PX = 12;
export const DB4_GAP_PX = 1.5;
export const DB4_CELL_H_PX = DB4_HEADER_PX + DB4_IMAGE_PX;
export const DB4_GUN_W_PX = DB4_IMAGE_PX * 3 + DB4_GAP_PX * 4;
export const DB4_BADGE_W_PX = 20;
export const DB4_BADGE_H_PX = 12;

export type SlotFamily =
  | "muzzle"
  | "gas"
  | "barrel"
  | "handguard"
  | "receiver"
  | "charge"
  | "stock"
  | "grip"
  | "magazine"
  | "ammo"
  | "scope"
  | "rearSight"
  | "frontSight"
  | "foregrip"
  | "tactical"
  | "mount"
  | "mod";

export type GridCell = {
  key: string;
  x: number;
  y: number;
  family: SlotFamily;
  slotLabel: string;
  ghostLabel: string;
  empty: boolean;
  item?: TarkovItemLite;
  image?: string;
  ergo?: number;
  recoil?: number;
  caption?: string;
};

export type GunBoard = {
  cells: GridCell[];
  rails: GridCell[];
  xs: number[];
  ys: number[];
  gun: {
    x: number;
    y: number;
    colSpan: number;
    shortName: string;
    image?: string;
    dps?: number;
    weightCurrent: number;
    weightTotal: number;
  };
};

export type StatBar = {
  id: "ergo" | "accuracy" | "vrec" | "hrec" | "velocity";
  label: string;
  tone: "ergo" | "accuracy" | "recoil" | "velocity";
  value: number;
  display: string;
  base?: number;
  baseDisplay?: string;
  pct: number;
  basePct?: number;
};

export type AssembledGunStats = {
  ergo?: number;
  accuracy?: number;
  recoilVertical?: number;
  recoilHorizontal?: number;
  recoilVerticalBase?: number;
  recoilHorizontalBase?: number;
  velocity?: number;
  dps?: number;
  weightCurrent: number;
  weightTotal: number;
  bars: StatBar[];
};

const GHOST_FAMILIES = new Set<SlotFamily>(["scope", "mount", "tactical", "charge"]);

const GHOST_LABEL: Record<SlotFamily, string> = {
  muzzle: "MUZZLE",
  gas: "GAS BLOCK",
  barrel: "BARREL",
  handguard: "HANDGUARD",
  receiver: "RECEIVER",
  charge: "CH. HANDLE",
  stock: "STOCK",
  grip: "GRIP",
  magazine: "MAG",
  ammo: "AMMO",
  scope: "SCOPE",
  rearSight: "REAR SIGHT",
  frontSight: "FRONT SIGHT",
  foregrip: "FOREGRIP",
  tactical: "TACTICAL",
  mount: "MOUNT",
  mod: "MOD",
};

const HOME: Record<SlotFamily, { x: number; y: number; dx: number; dy: number }> = {
  muzzle: { x: 11, y: 0, dx: 0, dy: 1 },
  gas: { x: 10, y: 0, dx: 0, dy: -1 },
  barrel: { x: 9, y: 0, dx: 1, dy: 0 },
  handguard: { x: 8, y: 0, dx: 1, dy: 0 },
  receiver: { x: 6, y: 0, dx: 0, dy: -1 },
  charge: { x: 0, y: -1, dx: 0, dy: -1 },
  stock: { x: 0, y: 0, dx: 0, dy: 1 },
  grip: { x: 1, y: 1, dx: 0, dy: 1 },
  magazine: { x: 2, y: 1, dx: 0, dy: 1 },
  ammo: { x: 2, y: 2, dx: 0, dy: 1 },
  scope: { x: 2, y: -1, dx: 0, dy: -1 },
  rearSight: { x: 3, y: -1, dx: 1, dy: 0 },
  frontSight: { x: 10, y: -1, dx: 0, dy: -1 },
  foregrip: { x: 8, y: 1, dx: 0, dy: 1 },
  tactical: { x: 9, y: 1, dx: -1, dy: 0 },
  mount: { x: 3, y: -2, dx: 0, dy: -1 },
  mod: { x: 7, y: 0, dx: 1, dy: 0 },
};

/** Gun image sits under the optic columns (x=3,2,1) at y=0. */
const GUN_XS = [3, 2, 1] as const;
const GUN_Y = 0;

function keyOf(x: number, y: number): string {
  return `${x}_${y}`;
}

export function slotFamily(nameId?: string, slotLabel?: string): SlotFamily {
  const id = (nameId ?? "").toLowerCase();
  const stem = id.replace(/_?\d+$/, "");
  const label = (slotLabel ?? "").toLowerCase();
  const text = `${stem} ${label}`;
  if (/muzzle/.test(text)) return "muzzle";
  if (/gas/.test(text)) return "gas";
  if (/barrel/.test(text)) return "barrel";
  if (/handguard|mod_catch/.test(text)) return "handguard";
  if (/reciev|receiv/.test(text)) return "receiver";
  if (/charge|hammer/.test(text)) return "charge";
  if (/stock/.test(text)) return "stock";
  if (/pistol|grip/.test(text) && !/fore/.test(text)) return "grip";
  if (/magazine| mag\b/.test(text)) return "magazine";
  if (/ammo/.test(text)) return "ammo";
  if (/scope/.test(text)) return "scope";
  if (/sight_rear|rear sight/.test(text)) return "rearSight";
  if (/sight_front|front sight/.test(text)) return "frontSight";
  if (/foregrip|bipod|launcher/.test(text)) return "foregrip";
  if (/tactical|flashlight|laser/.test(text)) return "tactical";
  if (/mount/.test(text)) return "mount";
  return "mod";
}

function isRailSlot(nameId: string | undefined, parentFamily: SlotFamily): boolean {
  if (!nameId) return false;
  if (parentFamily !== "handguard" && parentFamily !== "barrel" && parentFamily !== "gas") return false;
  return /^mod_mount(_\d+)?$/.test(nameId) || /^mod_tactical\d*$/.test(nameId);
}

function occupiedByGun(x: number, y: number): boolean {
  return y === GUN_Y && (GUN_XS as readonly number[]).includes(x);
}

function nextCell(
  family: SlotFamily,
  used: Set<string>,
  from?: { x: number; y: number; family: SlotFamily },
): { x: number; y: number } {
  const home = HOME[family];
  let x = from && childOffset(from.family, family) ? from.x + childOffset(from.family, family)!.dx : home.x;
  let y = from && childOffset(from.family, family) ? from.y + childOffset(from.family, family)!.dy : home.y;
  if (!from || !childOffset(from.family, family)) {
    x = home.x;
    y = home.y;
  }
  const dx = home.dx;
  const dy = home.dy;
  for (let i = 0; i < 24; i++) {
    const key = keyOf(x, y);
    if (!used.has(key) && !occupiedByGun(x, y)) return { x, y };
    x += dx;
    y += dy;
  }
  return { x: home.x + dx * 8, y: home.y + dy * 8 };
}

function childOffset(parent: SlotFamily, child: SlotFamily): { dx: number; dy: number } | null {
  if ((child === "scope" || child === "mount") && (parent === "scope" || parent === "mount")) {
    return { dx: 0, dy: -1 };
  }
  if (child === "muzzle" && parent === "muzzle") return { dx: 0, dy: 1 };
  if ((child === "foregrip" || child === "tactical") && (parent === "handguard" || parent === "barrel" || parent === "gas")) {
    return { dx: 0, dy: 1 };
  }
  if (child === "frontSight" && (parent === "gas" || parent === "barrel" || parent === "muzzle")) {
    return { dx: 0, dy: -1 };
  }
  if (parent === "handguard" && (child === "handguard" || child === "mod")) {
    return { dx: 1, dy: 0 };
  }
  if (parent === "magazine" && child === "ammo") return { dx: 0, dy: 1 };
  return null;
}

function claimedNameIds(mods: InstalledMod[]): Set<string> {
  const ids = new Set<string>();
  const walk = (rows: InstalledMod[]) => {
    for (const row of rows) {
      if (row.nameId) ids.add(row.nameId);
      walk(row.children);
    }
  };
  walk(mods);
  return ids;
}

function emptySlots(item: TarkovItemLite, claimed: Set<string>): CatalogSlot[] {
  return (item.slots ?? []).filter((slot) => !claimed.has(slot.nameId));
}

function walkItems(item: TarkovItemLite, mods: InstalledMod[], visit: (host: TarkovItemLite, open: CatalogSlot[]) => void) {
  visit(item, emptySlots(item, claimedNameIds(mods)));
  for (const mod of mods) walkItems(mod.item, mod.children, visit);
}

function cellFromPart(
  family: SlotFamily,
  slotLabel: string,
  item: TarkovItemLite | undefined,
  at: { x: number; y: number },
  extra?: { caption?: string },
): GridCell {
  return {
    key: keyOf(at.x, at.y),
    x: at.x,
    y: at.y,
    family,
    slotLabel,
    ghostLabel: GHOST_LABEL[family],
    empty: !item,
    item,
    image: item ? pickItemIcon(item) : undefined,
    ergo: item && !item.types?.includes("gun") ? item.ergonomics : undefined,
    recoil: item?.recoilModifier,
    caption: extra?.caption,
  };
}

function placeMod(
  mod: InstalledMod,
  used: Set<string>,
  cells: GridCell[],
  rails: GridCell[],
  parent?: { x: number; y: number; family: SlotFamily },
) {
  const family = slotFamily(mod.nameId, mod.slotLabel);
  if (isRailSlot(mod.nameId, parent?.family ?? "mod")) {
    const at = { x: rails.length, y: 0 };
    const cell = cellFromPart(family, mod.slotLabel, mod.item, at);
    cell.key = `rail-${mod.id}`;
    rails.push(cell);
    for (const child of mod.children) placeMod(child, used, cells, rails, { ...at, family });
    return;
  }
  const at = nextCell(family, used, parent);
  used.add(keyOf(at.x, at.y));
  cells.push(cellFromPart(family, mod.slotLabel, mod.item, at));
  for (const child of mod.children) {
    placeMod(child, used, cells, rails, { x: at.x, y: at.y, family });
  }
}

function placeGhost(family: SlotFamily, slotLabel: string, used: Set<string>, cells: GridCell[]) {
  if (!GHOST_FAMILIES.has(family)) return;
  if (cells.some((cell) => cell.family === family && cell.empty)) return;
  const at = nextCell(family, used);
  const key = keyOf(at.x, at.y);
  if (used.has(key)) return;
  used.add(key);
  cells.push(cellFromPart(family, slotLabel, undefined, at));
}

function uniqueSorted(values: number[], dir: "asc" | "desc"): number[] {
  const unique = [...new Set(values)];
  unique.sort((a, b) => (dir === "asc" ? a - b : b - a));
  return unique;
}

function roundStat(value: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function barPct(value: number, max: number): number {
  if (!Number.isFinite(value) || max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

function walkParts(item: TarkovItemLite, catalog: Map<string, TarkovItemLite>, seen: Set<string> = new Set()): TarkovItemLite[] {
  if (seen.has(item.id)) return [];
  seen.add(item.id);
  const out: TarkovItemLite[] = [item];
  for (const id of item.containsIds ?? []) {
    const part = catalog.get(id);
    if (part) out.push(...walkParts(part, catalog, seen));
  }
  return out;
}

export function assembledGunStats(
  weapon: TarkovItemLite,
  catalog: Map<string, TarkovItemLite>,
  ammo?: TarkovItemLite,
): AssembledGunStats {
  const parts = walkParts(weapon, catalog);
  const mods = parts.filter((part) => part.id !== weapon.id);
  const ergoBase = weapon.ergonomics ?? 0;
  const ergo = roundStat(
    ergoBase + mods.reduce((sum, part) => sum + (part.ergonomics ?? 0), 0),
    1,
  );
  const recoilMod = mods.reduce((sum, part) => sum + (part.recoilModifier ?? 0), 0);
  const recoilVerticalBase = weapon.recoilVertical;
  const recoilHorizontalBase = weapon.recoilHorizontal;
  const recoilVertical =
    recoilVerticalBase == null ? undefined : Math.round(recoilVerticalBase * (1 + recoilMod / 100));
  const recoilHorizontal =
    recoilHorizontalBase == null ? undefined : Math.round(recoilHorizontalBase * (1 + recoilMod / 100));
  const accMod = mods.reduce((sum, part) => sum + (part.accuracyModifier ?? 0), 0);
  const accuracy =
    weapon.centerOfImpact == null
      ? undefined
      : roundStat(weapon.centerOfImpact * 100 * (1 + accMod / 100), 2);
  const velocity = ammo?.initialSpeed ?? ammo?.velocity ?? weapon.velocity;
  const damage = ammo?.damage;
  const dps =
    damage != null && weapon.fireRate != null ? Math.round((damage * weapon.fireRate) / 60) : undefined;
  const weightCurrent = treeWeight(weapon, catalog);
  const weightTotal = weightCurrent + (ammo?.weight ?? 0);

  const bars: StatBar[] = [];
  if (weapon.ergonomics != null || mods.some((part) => part.ergonomics != null)) {
    bars.push({
      id: "ergo",
      label: "Ergonomics",
      tone: "ergo",
      value: ergo,
      display: ergo.toLocaleString("en-GB", { maximumFractionDigits: 1 }),
      pct: barPct(ergo, 80),
    });
  }
  if (accuracy != null) {
    bars.push({
      id: "accuracy",
      label: "Accuracy",
      tone: "accuracy",
      value: accuracy,
      display: accuracy.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      pct: barPct(accuracy, 4),
    });
  }
  if (recoilVertical != null && recoilVerticalBase != null) {
    bars.push({
      id: "vrec",
      label: "Ver Recoil",
      tone: "recoil",
      value: recoilVertical,
      display: String(recoilVertical),
      base: recoilVerticalBase,
      baseDisplay: recoilVerticalBase.toLocaleString("en-GB", { maximumFractionDigits: 1 }),
      pct: barPct(recoilVertical, 150),
      basePct: barPct(recoilVerticalBase, 150),
    });
  }
  if (recoilHorizontal != null && recoilHorizontalBase != null) {
    bars.push({
      id: "hrec",
      label: "Hor Recoil",
      tone: "recoil",
      value: recoilHorizontal,
      display: String(recoilHorizontal),
      base: recoilHorizontalBase,
      baseDisplay: recoilHorizontalBase.toLocaleString("en-GB", { maximumFractionDigits: 1 }),
      pct: barPct(recoilHorizontal, 350),
      basePct: barPct(recoilHorizontalBase, 350),
    });
  }
  if (velocity != null && velocity > 0) {
    bars.push({
      id: "velocity",
      label: "Velocity",
      tone: "velocity",
      value: velocity,
      display: String(Math.round(velocity)),
      pct: barPct(velocity, 1100),
    });
  }

  return {
    ergo,
    accuracy,
    recoilVertical,
    recoilHorizontal,
    recoilVerticalBase,
    recoilHorizontalBase,
    velocity,
    dps,
    weightCurrent,
    weightTotal,
    bars,
  };
}

export function buildGunBoard(
  weapon: TarkovItemLite,
  catalog: Map<string, TarkovItemLite>,
  ammo?: TarkovItemLite,
): GunBoard {
  const mods = installedMods(weapon, catalog);
  const used = new Set<string>();
  const cells: GridCell[] = [];
  const rails: GridCell[] = [];

  for (const x of GUN_XS) used.add(keyOf(x, GUN_Y));

  for (const mod of mods) placeMod(mod, used, cells, rails);

  if (ammo) {
    const mag = cells.find((cell) => cell.family === "magazine" && !cell.empty);
    const at = mag ? nextCell("ammo", used, { x: mag.x, y: mag.y, family: "magazine" }) : nextCell("ammo", used);
    used.add(keyOf(at.x, at.y));
    const magCap = mag?.item?.capacity;
    cells.push(
      cellFromPart("ammo", "Ammo", ammo, at, {
        caption: magCap != null ? `${magCap}` : undefined,
      }),
    );
  }

  walkItems(weapon, mods, (_host, open) => {
    for (const slot of open) {
      const family = slotFamily(slot.nameId, slot.name);
      if (isRailSlot(slot.nameId, slotFamily(undefined, _host.types?.includes("gun") ? "receiver" : undefined))) {
        continue;
      }
      placeGhost(family, humanSlotLabel(slot.nameId, slot.name), used, cells);
    }
  });

  const xs = uniqueSorted(
    [...cells.map((cell) => cell.x), ...GUN_XS],
    "desc",
  );
  const ys = uniqueSorted(
    [...cells.map((cell) => cell.y), GUN_Y],
    "asc",
  );
  const stats = assembledGunStats(weapon, catalog, ammo);
  const short =
    weapon.shortName && weapon.shortName !== `${weapon.id} ShortName` ? weapon.shortName : weapon.name;

  return {
    cells,
    rails,
    xs,
    ys,
    gun: {
      x: GUN_XS[0],
      y: GUN_Y,
      colSpan: GUN_XS.length,
      shortName: short,
      image: pickItemIcon(weapon),
      dps: stats.dps,
      weightCurrent: stats.weightCurrent,
      weightTotal: stats.weightTotal,
    },
  };
}

export function cellBadges(cell: GridCell): { ergo?: string; recoil?: string } {
  const ergo =
    cell.ergo != null && cell.ergo !== 0 ? formatErgoModifier(cell.ergo) : undefined;
  const recoil =
    cell.recoil != null && cell.recoil !== 0
      ? formatErgoModifier(cell.recoil)
      : undefined;
  return { ergo, recoil };
}

export function formatDb4Weight(current: number, total: number): string {
  const a = current.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const b = total.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${a} / ${b}  kg`;
}
