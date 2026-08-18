import { describe, expect, it } from "vitest";
import {
  assembledGunStats,
  buildGunBoard,
  cellBadges,
  formatDb4Weight,
  slotFamily,
} from "./gun-grid";
import type { TarkovItemLite } from "./tarkov";

function item(partial: TarkovItemLite): TarkovItemLite {
  return partial;
}

const grip = item({
  id: "grip",
  name: "A2 pistol grip",
  shortName: "A2",
  ergonomics: 5,
  weight: 0.08,
});
const mag = item({
  id: "mag",
  name: "STANAG",
  shortName: "STANAG",
  weight: 0.2,
  capacity: 30,
});
const stock = item({
  id: "stock",
  name: "M4SS",
  shortName: "M4SS",
  ergonomics: 4,
  recoilModifier: -4,
  weight: 0.3,
});
const barrel = item({
  id: "barrel",
  name: "AR-15 14.5 inch barrel",
  shortName: "AR-15 14.5\"",
  recoilModifier: -8,
  weight: 0.5,
  slots: [{ nameId: "mod_muzzle", name: "Muzzle", allowedItemIds: ["muzzle"] }],
});
const muzzle = item({
  id: "muzzle",
  name: "USGIA2",
  shortName: "USGIA2",
  recoilModifier: -5,
  weight: 0.1,
});
const receiver = item({
  id: "receiver",
  name: "AR-15 upper",
  shortName: "AR-15",
  weight: 0.25,
  slots: [
    { nameId: "mod_barrel", name: "Barrel", allowedItemIds: ["barrel"] },
    { nameId: "mod_scope", name: "Scope", allowedItemIds: ["optic"] },
  ],
});
const charge = item({ id: "charge", name: "Charging handle", shortName: "C Handle", weight: 0.04 });
const m4 = item({
  id: "m4",
  name: "Colt M4A1",
  shortName: "M4A1",
  types: ["gun"],
  weight: 0.75,
  ergonomics: 48,
  recoilVertical: 119,
  recoilHorizontal: 342,
  fireRate: 800,
  centerOfImpact: 0.0182,
  containsIds: ["grip", "mag", "stock", "receiver", "barrel", "muzzle", "charge"],
  slots: [
    { nameId: "mod_pistol_grip", name: "Pistol Grip", allowedItemIds: ["grip"] },
    { nameId: "mod_magazine", name: "Magazine", allowedItemIds: ["mag"] },
    { nameId: "mod_stock", name: "Stock", allowedItemIds: ["stock"] },
    { nameId: "mod_reciever", name: "Receiver", allowedItemIds: ["receiver"] },
    { nameId: "mod_charge", name: "Charging handle", allowedItemIds: ["charge"] },
    { nameId: "mod_tactical", name: "Tactical", allowedItemIds: ["light"] },
  ],
});

const catalog = new Map<string, TarkovItemLite>([
  ["m4", m4],
  ["grip", grip],
  ["mag", mag],
  ["stock", stock],
  ["receiver", receiver],
  ["barrel", barrel],
  ["muzzle", muzzle],
  ["charge", charge],
]);

describe("gun grid", () => {
  it("maps Tarkov slot nameIds onto db4 families", () => {
    expect(slotFamily("mod_muzzle")).toBe("muzzle");
    expect(slotFamily("mod_muzzle_000")).toBe("muzzle");
    expect(slotFamily("mod_gas_block")).toBe("gas");
    expect(slotFamily("mod_reciever")).toBe("receiver");
    expect(slotFamily("mod_charge")).toBe("charge");
    expect(slotFamily("mod_pistol_grip")).toBe("grip");
    expect(slotFamily("mod_sight_rear")).toBe("rearSight");
    expect(slotFamily("mod_scope_000")).toBe("scope");
    expect(slotFamily("mod_mount_001", "Mount")).toBe("mount");
    expect(slotFamily("mod_tactical_2")).toBe("tactical");
    expect(slotFamily("mod_foregrip")).toBe("foregrip");
  });

  it("places muzzle left, stock/charge right, mag and grip below, and keeps the gun span clear", () => {
    const board = buildGunBoard(m4, catalog);
    const byFamily = Object.fromEntries(board.cells.filter((cell) => !cell.empty).map((cell) => [cell.family, cell]));
    expect(byFamily.muzzle?.x).toBeGreaterThan(byFamily.barrel?.x ?? 0);
    expect(byFamily.barrel?.x).toBeGreaterThan(board.gun.x);
    expect(byFamily.stock?.x).toBeLessThan(board.gun.x);
    expect(byFamily.charge?.y).toBeLessThan(0);
    expect(byFamily.magazine?.y).toBeGreaterThan(0);
    expect(byFamily.grip?.y).toBeGreaterThan(0);
    expect(board.cells.some((cell) => cell.y === 0 && [3, 2, 1].includes(cell.x))).toBe(false);
    expect(board.xs[0]).toBeGreaterThan(board.xs[board.xs.length - 1]);
  });

  it("nests leftover barrel/muzzle under the receiver and still parks them on the bore line", () => {
    const board = buildGunBoard(m4, catalog);
    const barrelCell = board.cells.find((cell) => cell.item?.id === "barrel");
    const muzzleCell = board.cells.find((cell) => cell.item?.id === "muzzle");
    expect(barrelCell).toMatchObject({ family: "barrel", y: 0, empty: false });
    expect(muzzleCell).toMatchObject({ family: "muzzle", empty: false });
    expect(muzzleCell?.x).toBeGreaterThan(barrelCell?.x ?? 0);
  });

  it("grows a TRAX-style handguard chain to the left of the bore", () => {
    const bridge = item({
      id: "bridge",
      name: "TRAX Bridge",
      shortName: "TRAX Bridge",
      slots: [{ nameId: "mod_handguard", name: "Handguard", allowedItemIds: ["trax1"] }],
    });
    const trax1 = item({
      id: "trax1",
      name: "TRAX 1",
      shortName: "TRAX 1",
      slots: [{ nameId: "mod_handguard", name: "Handguard", allowedItemIds: ["trax2"] }],
    });
    const trax2 = item({ id: "trax2", name: "TRAX 2", shortName: "TRAX 2" });
    const ak = item({
      id: "ak",
      name: "AKS-74",
      shortName: "AKS-74",
      types: ["gun"],
      containsIds: ["bridge", "trax1", "trax2"],
      slots: [{ nameId: "mod_handguard", name: "Handguard", allowedItemIds: ["bridge"] }],
    });
    const board = buildGunBoard(
      ak,
      new Map([
        ["ak", ak],
        ["bridge", bridge],
        ["trax1", trax1],
        ["trax2", trax2],
      ]),
    );
    const xs = board.cells.filter((cell) => cell.item?.id.startsWith("trax") || cell.item?.id === "bridge").map((cell) => cell.x);
    expect(xs.length).toBe(3);
    expect(Math.max(...xs) - Math.min(...xs)).toBe(2);
  });

  it("keeps empty scope/charge/tactical ghosts and hides unused bore slots", () => {
    const board = buildGunBoard(m4, catalog);
    const ghosts = board.cells.filter((cell) => cell.empty);
    expect(ghosts.map((cell) => cell.ghostLabel).sort()).toEqual(["SCOPE", "TACTICAL"]);
    expect(ghosts.some((cell) => cell.ghostLabel === "BARREL")).toBe(false);
  });

  it("parks handguard rail mounts on the rail row, not the optic stack", () => {
    const rail = item({ id: "rail", name: "TRAX rail", shortName: "Rail" });
    const hg = item({
      id: "hg",
      name: "TRAX 1",
      shortName: "TRAX 1",
      containsIds: ["rail"],
      slots: [{ nameId: "mod_mount_000", name: "Mount", allowedItemIds: ["rail"] }],
    });
    const gun = item({
      id: "ak",
      name: "AK",
      shortName: "AK",
      types: ["gun"],
      containsIds: ["hg", "rail"],
      slots: [{ nameId: "mod_handguard", name: "Handguard", allowedItemIds: ["hg"] }],
    });
    const board = buildGunBoard(
      gun,
      new Map([
        ["ak", gun],
        ["hg", hg],
        ["rail", rail],
      ]),
    );
    expect(board.rails.map((cell) => cell.item?.id)).toEqual(["rail"]);
    expect(board.cells.some((cell) => cell.item?.id === "rail")).toBe(false);
  });

  it("drops empty columns so a short pistol does not keep an AK-length board", () => {
    const pistol = item({
      id: "p226",
      name: "P226R",
      shortName: "P226R",
      types: ["gun"],
      containsIds: ["grip"],
      slots: [{ nameId: "mod_pistol_grip", name: "Pistol Grip", allowedItemIds: ["grip"] }],
    });
    const board = buildGunBoard(pistol, new Map([["p226", pistol], ["grip", grip]]));
    expect(board.xs).not.toContain(11);
    expect(board.xs).not.toContain(9);
    expect(board.cells.some((cell) => cell.family === "grip")).toBe(true);
  });

  it("sits kit ammo under the magazine and sums catalog stats without inventing overswing", () => {
    const ammo = item({
      id: "m855",
      name: "M855",
      shortName: "M855",
      weight: 0.36,
      initialSpeed: 922,
      damage: 54,
    });
    const board = buildGunBoard(m4, catalog, ammo);
    const ammoCell = board.cells.find((cell) => cell.family === "ammo");
    const magCell = board.cells.find((cell) => cell.family === "magazine");
    expect(ammoCell?.x).toBe(magCell?.x);
    expect(ammoCell?.y).toBeGreaterThan(magCell?.y ?? 0);
    expect(ammoCell?.caption).toBe("30");

    const stats = assembledGunStats(m4, catalog, ammo);
    expect(stats.ergo).toBe(57);
    expect(stats.recoilVertical).toBe(Math.round(119 * (1 - 17 / 100)));
    expect(stats.velocity).toBe(922);
    expect(stats.dps).toBe(Math.round((54 * 800) / 60));
    expect(stats.accuracy).toBeCloseTo(1.82);
    expect(stats.bars.map((bar) => bar.id)).toEqual(["ergo", "accuracy", "vrec", "hrec", "velocity"]);
    expect(stats.weightTotal).toBeCloseTo(stats.weightCurrent + 0.36);
  });

  it("formats corner badges and the gun weight footer like db4", () => {
    expect(
      cellBadges({
        key: "0_0",
        x: 0,
        y: 0,
        family: "stock",
        slotLabel: "Stock",
        ghostLabel: "STOCK",
        empty: false,
        ergo: 5,
        recoil: -8,
      }),
    ).toEqual({ ergo: "+5", recoil: "-8" });
    expect(formatDb4Weight(2.85, 3.21)).toBe("2.85 / 3.21  kg");
  });
});
