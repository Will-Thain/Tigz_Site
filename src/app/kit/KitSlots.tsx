import type { CSSProperties } from "react";
import type { Kit, KitItem } from "@/data/kits";
import {
  ammoCaption,
  BODY_SLOTS,
  cellBackground,
  componentOverview,
  isUnpublishedSlot,
  kitSlotsInOrder,
  overviewWeapon,
  pickKitImage,
  resolveKitItemName,
  resolveKitShortName,
  SILHOUETTE_ASPECT,
  SILHOUETTE_ZONES,
  type SilhouetteZone,
  weaponStats,
} from "@/lib/kit-display";
import type { TarkovItemLite } from "@/lib/tarkov";
import { PmcFigure, SlotGlyph } from "./SlotGlyphs";

function shownItem(item: KitItem, catalog: Map<string, TarkovItemLite>) {
  const hydrated = item.itemId ? catalog.get(item.itemId) : undefined;
  return {
    unpublished: isUnpublishedSlot(item),
    name: resolveKitItemName(item, hydrated),
    shortName: resolveKitShortName(item, hydrated),
    image: pickKitImage(item.slot, hydrated) ?? hydrated?.iconLink,
    tile: cellBackground(hydrated?.backgroundColor),
    hydrated,
  };
}

function SilhouetteSlot({
  zone,
  item,
  catalog,
  ammo,
}: {
  zone: SilhouetteZone;
  item?: KitItem;
  catalog: Map<string, TarkovItemLite>;
  ammo?: { unpublished: boolean; name: string; detail?: string };
}) {
  const shown = item ? shownItem(item, catalog) : undefined;
  const filled = Boolean(shown && !shown.unpublished && shown.image);
  const style = {
    left: `${zone.left}%`,
    top: `${zone.top}%`,
    width: `${zone.width}%`,
    height: `${zone.height}%`,
    "--tile": filled ? shown?.tile : undefined,
  } as CSSProperties;
  const labelStyle = {
    left: `${zone.left}%`,
    top: `${zone.labelTop}%`,
    width: `${zone.labelWidth}%`,
  } as CSSProperties;

  return (
    <>
      {zone.showLabel ? (
        <p className="eft-zone-label" style={labelStyle}>
          {zone.label}
        </p>
      ) : null}
      <article
        className={`eft-slot${filled ? "" : " eft-slot-empty"}${zone.slot ? "" : " eft-slot-ghost"}`}
        data-slot={zone.slot ?? zone.id}
        data-zone={zone.id}
        style={style}
      >
        <span className="eft-slot-header" />
        <div className="eft-slot-body">
          {filled ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown!.image} alt="" className="eft-slot-item" />
          ) : (
            <SlotGlyph slot={zone.glyph} />
          )}
        </div>
        {filled ? (
          <div className="eft-slot-caption">
            <p>{shown!.shortName ?? shown!.name}</p>
            {item?.detail ? <p className="eft-slot-detail">{item.detail}</p> : null}
            {zone.slot === "Primary" && ammo ? (
              <p className="eft-slot-ammo">
                {ammo.unpublished ? "Ammo unpublished" : ammo.detail ? `${ammo.name} · ${ammo.detail}` : ammo.name}
              </p>
            ) : null}
          </div>
        ) : null}
      </article>
    </>
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
  if (stats.length === 0 && parts.length === 0) {
    return (
      <div className="eft-overview eft-overview-empty">
        <p>Select a published weapon to see stats and components.</p>
      </div>
    );
  }

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

      <div className="eft-build">
        <div className="eft-silhouette" style={{ aspectRatio: SILHOUETTE_ASPECT }}>
          <PmcFigure />
          {SILHOUETTE_ZONES.map((zone) => (
            <SilhouetteSlot
              key={zone.id}
              zone={zone}
              item={zone.slot ? bySlot.get(zone.slot) : undefined}
              catalog={catalog}
              ammo={zone.slot === "Primary" ? ammo : undefined}
            />
          ))}
        </div>
        {compact ? null : <WeaponOverview items={items} catalog={catalog} />}
      </div>
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
