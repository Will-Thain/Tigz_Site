import type { CSSProperties, ReactNode } from "react";
import type { Kit, KitItem, KitSlot } from "@/data/kits";
import {
  ammoCaption,
  BODY_SLOTS,
  formatCaliber,
  formatErgoModifier,
  formatFireRate,
  formatWeightKg,
  installedMods,
  isUnpublishedSlot,
  itemForSlot,
  kitSlotsInOrder,
  overviewWeapon,
  pickItemIcon,
  pickKitImage,
  resolveKitItemName,
  resolveKitShortName,
  SILHOUETTE_ART,
  SILHOUETTE_ZONES,
  SLOT_UI,
  WEAPON_COLUMN_SLOTS,
  type InstalledMod,
  type SilhouetteZone,
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
          <div className="eft-zone-icon">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shown!.image} alt="" className="eft-zone-item" />
            {shown!.shortName ? <p className="eft-zone-short">{shown!.shortName}</p> : null}
            {zone.slot === "Primary" && ammo && !ammo.unpublished ? (
              <p className="eft-zone-ammo">{ammo.detail ? `${ammo.name} · ${ammo.detail}` : ammo.name}</p>
            ) : null}
          </div>
        ) : null}
      </article>
    </>
  );
}

function StatIcon({ children }: { children: ReactNode }) {
  return (
    <svg className="eft-stat-icon" viewBox="0 0 16 16" aria-hidden="true">
      {children}
    </svg>
  );
}

function ItemInspect({
  item,
  catalog,
  main = false,
  ancestors = [],
}: {
  item: TarkovItemLite;
  catalog: Map<string, TarkovItemLite>;
  main?: boolean;
  ancestors?: string[];
}) {
  if (ancestors.includes(item.id)) return null;
  const name = resolveKitItemName({ slot: "Primary", itemId: item.id, label: item.shortName || item.id }, item);
  const image = pickItemIcon(item);
  const gun = item.types?.includes("gun") === true;
  const mods = installedMods(item, catalog);
  const caliber = formatCaliber(item.caliber);
  const ergoMod = !gun && item.ergonomics != null && item.ergonomics !== 0;

  return (
    <div className={`eft-item${main ? " eft-item-main" : ""}`}>
      <div className="eft-item-header-container">
        <div>
          <div className="eft-item-header">
            <div>
              {image ? (
                <div className="eft-item-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="" />
                </div>
              ) : null}
              <div className="eft-item-title">{name}</div>
            </div>
          </div>
          <div className="eft-item-stats">
            {item.weight != null && item.weight > 0 ? (
              <div className="eft-item-weight">
                <span className="eft-card-value">
                  <StatIcon>
                    <path
                      fill="currentColor"
                      d="M8 1.5A2.5 2.5 0 0 0 5.5 4h-.75A1.75 1.75 0 0 0 3 5.75v.5h10v-.5A1.75 1.75 0 0 0 11.25 4H10.5A2.5 2.5 0 0 0 8 1.5Zm0 1A1.5 1.5 0 0 1 9.5 4h-3A1.5 1.5 0 0 1 8 2.5ZM3.75 7.5A.75.75 0 0 0 3 8.25V13a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 13 13V8.25a.75.75 0 0 0-.75-.75Z"
                    />
                  </StatIcon>
                  {formatWeightKg(item.weight)}
                </span>
              </div>
            ) : (
              <div />
            )}
            <div className="eft-item-specialized">
              {gun ? (
                <>
                  <div className="eft-card-line eft-card-line4">
                    {item.recoilVertical != null ? (
                      <span className="eft-card-value eft-card-with-mods">
                        <StatIcon>
                          <path fill="currentColor" d="M8 1 4.5 6h2.25v4H4.5L8 15l3.5-5H9.25V6H11.5Z" />
                        </StatIcon>
                        {item.recoilVertical}
                      </span>
                    ) : null}
                    {item.recoilHorizontal != null ? (
                      <span className="eft-card-value eft-card-with-mods">
                        <StatIcon>
                          <path fill="currentColor" d="M1 8 6 4.5v2.25h4V4.5L15 8l-5 3.5V9.25H6v2.25Z" />
                        </StatIcon>
                        {item.recoilHorizontal}
                      </span>
                    ) : null}
                    {item.ergonomics != null ? (
                      <span className="eft-card-value eft-card-with-mods">
                        <StatIcon>
                          <path
                            fill="currentColor"
                            d="M7.2 2.2c.9-.9 2.4-.9 3.3 0l.3.3c.4.4.5 1 .3 1.5L10 7.2 13 10v3H9.5l-2-2H6.2L4 13.2 2.6 11.8 5.8 8.6 5 6.2c-.3-.8 0-1.7.7-2.2Z"
                          />
                        </StatIcon>
                        {item.ergonomics}
                      </span>
                    ) : null}
                  </div>
                  <div className="eft-card-line eft-card-line4">
                    {item.fireRate != null ? (
                      <span className="eft-card-value eft-card-with-mods">
                        <StatIcon>
                          <path fill="currentColor" d="M8.8 1 4 8.2h3.1L6.4 15 12 7.4H8.7Z" />
                        </StatIcon>
                        {formatFireRate(item.fireRate)}
                      </span>
                    ) : null}
                    {caliber ? (
                      <span className="eft-card-value eft-card-with-mods eft-card-caliber">
                        <StatIcon>
                          <circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
                          <circle cx="8" cy="8" r="1.4" fill="currentColor" />
                        </StatIcon>
                        {caliber}
                      </span>
                    ) : null}
                  </div>
                </>
              ) : ergoMod ? (
                <div className="eft-card-line eft-card-line4">
                  <span className="eft-card-value">
                    <StatIcon>
                      <path
                        fill="currentColor"
                        d="M7.2 2.2c.9-.9 2.4-.9 3.3 0l.3.3c.4.4.5 1 .3 1.5L10 7.2 13 10v3H9.5l-2-2H6.2L4 13.2 2.6 11.8 5.8 8.6 5 6.2c-.3-.8 0-1.7.7-2.2Z"
                      />
                    </StatIcon>
                    {formatErgoModifier(item.ergonomics!)}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {mods.length > 0 ? (
        <div className="eft-item-mods">
          <div className="eft-mods-tab">
            <span className="eft-mods-button">
              <StatIcon>
                <path
                  fill="currentColor"
                  d="M6.2 1.6 8 3.4l1.8-1.8 1.6 1.6L9.6 5l1.2 1.2 2.6-1.6 1.6 1.6-1.6 2.6 2.2.6v2.2l-2.2.6 1.6 2.6-1.6 1.6-2.6-1.6-.6 2.2H8.2L7.6 14l-2.6 1.6-1.6-1.6 1.6-2.6L2.8 11 2.2 8.8l2.2-.6L2.8 5.6 4.4 4l2.6 1.6L8.2 4 6.2 1.6Z"
                />
              </StatIcon>
              Mods ({mods.length})
            </span>
          </div>
          {mods.map((mod, index) => (
            <ModRow
              key={mod.id}
              mod={mod}
              catalog={catalog}
              first={index === 0}
              last={index === mods.length - 1}
              ancestors={[...ancestors, item.id]}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ModRow({
  mod,
  catalog,
  first,
  last,
  ancestors,
}: {
  mod: InstalledMod;
  catalog: Map<string, TarkovItemLite>;
  first: boolean;
  last: boolean;
  ancestors: string[];
}) {
  return (
    <div className="eft-mod-row">
      <div className={`eft-hierarchy${first ? " eft-hierarchy-first" : ""}`} aria-hidden="true">
        <div className="eft-hierarchy-upper" />
        <div className="eft-hierarchy-middle" />
        {last ? null : <div className="eft-hierarchy-bottom" />}
      </div>
      <div className="eft-mod-slot">
        <div className="eft-mod-caption">{mod.slotLabel}</div>
        <ItemInspect item={mod.item} catalog={catalog} ancestors={ancestors} />
      </div>
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
  if (!weapon) return null;
  const slot =
    WEAPON_COLUMN_SLOTS.find((row) => itemForSlot(items, row)?.itemId === weapon.id) ?? ("Primary" as KitSlot);

  return (
    <section className="eft-slot-panel">
      <header className="eft-slot-header">
        <span className="eft-slot-chevron" aria-hidden="true">
          <StatIcon>
            <path fill="currentColor" d="M10.2 3.2 5.4 8l4.8 4.8 1.1-1.1L7.6 8l3.7-3.7Z" />
          </StatIcon>
        </span>
        <div className="eft-slot-title">
          <svg className="eft-slot-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M2 8.2h7.2l1.3-1.6h2.8l.9 1.2H15v1.4h-1.1L13 10.6H9.8L8.4 12H5.6L4.2 10.4H2Z"
            />
          </svg>
          <span>{SLOT_UI[slot].label}</span>
        </div>
        <span className="eft-slot-chevron" aria-hidden="true">
          <StatIcon>
            <path fill="currentColor" d="M5.8 3.2 4.7 4.3 8.4 8l-3.7 3.7 1.1 1.1L10.6 8Z" />
          </StatIcon>
        </span>
      </header>
      <div className="eft-slot-items">
        <ItemInspect item={weapon} catalog={catalog} main />
      </div>
    </section>
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
  const hasOverview = !compact && Boolean(weapon);

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
