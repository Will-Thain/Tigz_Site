import type { CSSProperties } from "react";
import type { Kit, KitItem, KitSlot } from "@/data/kits";
import {
  ammoCaption,
  BODY_SLOTS,
  cellBackground,
  componentOverview,
  GEAR_COLUMN_SLOTS,
  isUnpublishedSlot,
  kitSlotsInOrder,
  overviewWeapon,
  pickKitImage,
  resolveKitItemName,
  resolveKitShortName,
  slotCellSize,
  SLOT_UI,
  WEAPON_COLUMN_SLOTS,
  weaponStats,
} from "@/lib/kit-display";
import type { TarkovItemLite } from "@/lib/tarkov";
import { PmcFigure, SlotGlyph } from "./SlotGlyphs";

function shownItem(item: KitItem, catalog: Map<string, TarkovItemLite>) {
  const hydrated = item.itemId ? catalog.get(item.itemId) : undefined;
  const size = slotCellSize(item.slot, isUnpublishedSlot(item) ? undefined : hydrated);
  return {
    unpublished: isUnpublishedSlot(item),
    name: resolveKitItemName(item, hydrated),
    shortName: resolveKitShortName(item, hydrated),
    image: pickKitImage(item.slot, hydrated) ?? hydrated?.iconLink,
    tile: cellBackground(hydrated?.backgroundColor),
    cols: size.cols,
    rows: size.rows,
    hydrated,
  };
}

function StashSlot({
  item,
  catalog,
  ammo,
}: {
  item: KitItem;
  catalog: Map<string, TarkovItemLite>;
  ammo?: { unpublished: boolean; name: string; detail?: string };
}) {
  const shown = shownItem(item, catalog);
  const ui = SLOT_UI[item.slot];
  const style = {
    "--cols": shown.cols,
    "--rows": shown.rows,
    "--tile": shown.unpublished ? undefined : shown.tile,
  } as CSSProperties;

  return (
    <article
      className={`eft-slot${shown.unpublished ? " eft-slot-empty" : ""}`}
      data-slot={item.slot}
      style={style}
    >
      <p className="eft-slot-label">{ui.label}</p>
      <div className="eft-slot-body">
        {shown.image && !shown.unpublished ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown.image} alt="" className="eft-slot-item" />
        ) : (
          <SlotGlyph slot={item.slot} />
        )}
      </div>
      {shown.unpublished ? (
        <p className="eft-slot-tag">Unpublished</p>
      ) : (
        <div className="eft-slot-caption">
          <p>{shown.shortName ?? shown.name}</p>
          {item.detail ? <p className="eft-slot-detail">{item.detail}</p> : null}
          {item.slot === "Primary" && ammo ? (
            <p className="eft-slot-ammo">
              {ammo.unpublished ? "Ammo unpublished" : ammo.detail ? `${ammo.name} · ${ammo.detail}` : ammo.name}
            </p>
          ) : null}
        </div>
      )}
      {shown.unpublished && item.slot === "Primary" && ammo && !ammo.unpublished ? (
        <p className="eft-slot-ammo eft-slot-ammo-empty">{ammo.name}</p>
      ) : null}
    </article>
  );
}

function SlotColumn({
  slots,
  bySlot,
  catalog,
  ammo,
}: {
  slots: KitSlot[];
  bySlot: Map<KitSlot, KitItem>;
  catalog: Map<string, TarkovItemLite>;
  ammo?: { unpublished: boolean; name: string; detail?: string };
}) {
  return (
    <div className="eft-column">
      {slots.map((name) => (
        <StashSlot key={name} item={bySlot.get(name)!} catalog={catalog} ammo={name === "Primary" ? ammo : undefined} />
      ))}
    </div>
  );
}

function WeaponOverview({
  items,
  catalog,
}: {
  items: KitItem[];
  catalog: Map<string, TarkovItemLite>;
}) {
  const weapon = overviewWeapon(items, catalog);
  const stats = weaponStats(weapon);
  const parts = componentOverview(weapon, catalog);
  if (stats.length === 0 && parts.length === 0) return null;

  return (
    <div className="eft-overview">
      {stats.length > 0 ? (
        <div className="eft-stats" aria-label="Weapon stats">
          {stats.map((stat) => (
            <div key={stat.id} className="eft-stat">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      ) : null}
      {parts.length > 0 ? (
        <div className="eft-components" aria-label="Weapon components">
          {parts.map((part) => (
            <article key={part.id} className="eft-component">
              <div className="eft-component-icon">
                {part.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={part.image} alt="" />
                ) : (
                  <span />
                )}
              </div>
              <p className="eft-component-slot">{part.slotLabel}</p>
              <p className="eft-component-name">{part.shortName ?? part.name}</p>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function KitInspect({
  items,
  catalog,
  wipe,
  compact = false,
}: {
  items: KitItem[];
  catalog: Map<string, TarkovItemLite>;
  wipe?: string;
  compact?: boolean;
}) {
  const bySlot = new Map(kitSlotsInOrder(items).map((item) => [item.slot, item]));
  const unpublished = BODY_SLOTS.every((slot) => isUnpublishedSlot(bySlot.get(slot)));
  const ammo = ammoCaption(items, catalog);

  return (
    <section className={`eft-equipment${compact ? " eft-equipment-compact" : ""}`}>
      {compact ? null : (
        <div className="eft-equipment-bar">
          <span>Equipment</span>
          <span>{unpublished ? "Unpublished" : wipe ? `Wipe ${wipe}` : "Loadout"}</span>
        </div>
      )}

      <div className="eft-inspect">
        <SlotColumn slots={WEAPON_COLUMN_SLOTS} bySlot={bySlot} catalog={catalog} ammo={ammo} />
        <div className="eft-inspect-pmc">
          <PmcFigure />
        </div>
        <SlotColumn slots={GEAR_COLUMN_SLOTS} bySlot={bySlot} catalog={catalog} />
      </div>

      {compact ? null : <WeaponOverview items={items} catalog={catalog} />}
    </section>
  );
}

export function KitLoadoutStrip({
  items,
  catalog,
}: {
  items: KitItem[];
  catalog: Map<string, TarkovItemLite>;
}) {
  return <KitInspect items={items} catalog={catalog} compact />;
}

export function KitSlotGrid({
  items,
  catalog,
}: {
  items: KitItem[];
  catalog: Map<string, TarkovItemLite>;
}) {
  return <KitInspect items={items} catalog={catalog} compact />;
}

export function KitStamp({ kit }: { kit: Kit }) {
  return (
    <p className="font-mono text-[11px] stencil text-sand-500">
      Updated {new Date(kit.publishedAt).toUTCString()}
    </p>
  );
}
