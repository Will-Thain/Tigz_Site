import type { CSSProperties } from "react";
import type { Kit, KitItem } from "@/data/kits";
import {
  ammoCaption,
  BODY_SLOTS,
  componentOverview,
  isUnpublishedSlot,
  kitSlotsInOrder,
  overviewWeapon,
  pickKitImage,
  resolveKitItemName,
  resolveKitShortName,
  SILHOUETTE_ART,
  SILHOUETTE_ZONES,
  type SilhouetteZone,
  weaponStats,
} from "@/lib/kit-display";
import type { TarkovItemLite } from "@/lib/tarkov";

function shownItem(item: KitItem, catalog: Map<string, TarkovItemLite>) {
  const hydrated = item.itemId ? catalog.get(item.itemId) : undefined;
  return {
    unpublished: isUnpublishedSlot(item),
    name: resolveKitItemName(item, hydrated),
    shortName: resolveKitShortName(item, hydrated),
    image: pickKitImage(item.slot, hydrated) ?? hydrated?.iconLink,
  };
}

/** Totov positions labels in rem (html 14px), not in the 0.75 caption em. */
function plate(value: number): string {
  return `calc(${value} * var(--eft-em))`;
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
  const itemStyle = {
    left: plate(zone.left),
    top: plate(zone.top),
    width: plate(zone.width),
    height: plate(zone.height),
  } as CSSProperties;
  const labelStyle = {
    left: plate(zone.left),
    top: plate(zone.labelTop),
    width: plate(zone.labelWidth),
    height: plate(zone.labelHeight),
    paddingLeft: plate(0.1),
    paddingRight: plate(0.1),
  } as CSSProperties;

  return (
    <>
      {zone.showLabel ? (
        <p className="eft-zone-label" style={labelStyle}>
          <span>{zone.label}</span>
        </p>
      ) : null}
      <article
        className={`eft-zone${filled ? " eft-zone-filled" : ""}`}
        data-slot={zone.slot ?? zone.id}
        data-zone={zone.id}
        style={itemStyle}
      >
        {filled ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shown!.image} alt="" className="eft-zone-item" />
            {shown!.shortName ? <p className="eft-zone-short">{shown!.shortName}</p> : null}
          </>
        ) : null}
        {filled && zone.slot === "Primary" && ammo && !ammo.unpublished ? (
          <p className="eft-zone-ammo">{ammo.detail ? `${ammo.name} · ${ammo.detail}` : ammo.name}</p>
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
  const weapon = overviewWeapon(items, catalog);
  const hasOverview =
    !compact && (weaponStats(weapon).length > 0 || componentOverview(weapon, catalog).length > 0);

  return (
    <section className={`eft-equipment${compact ? " eft-equipment-compact" : ""}`}>
      {compact ? null : (
        <p className="eft-equipment-status">
          {unpublished ? "Unpublished" : wipe ? `Wipe ${wipe}` : "Loadout"}
        </p>
      )}

      <div className={`eft-build${hasOverview ? "" : " eft-build-solo"}`}>
        <div className="eft-silhouette">
          <div className="eft-silhouette-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="eft-silhouette-art" src={SILHOUETTE_ART} alt="" />
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
        </div>
        {hasOverview ? <WeaponOverview items={items} catalog={catalog} /> : null}
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
