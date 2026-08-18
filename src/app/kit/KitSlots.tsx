import type { CSSProperties } from "react";
import type { Kit, KitItem } from "@/data/kits";
import {
  assembledGunStats,
  buildGunBoard,
  cellBadges,
  type GridCell,
  type StatBar,
} from "@/lib/gun-grid";
import {
  ammoCaption,
  BODY_SLOTS,
  isUnpublishedSlot,
  itemForSlot,
  kitSlotsInOrder,
  overviewWeapon,
  pickKitImage,
  resolveKitItemName,
  resolveKitShortName,
  SILHOUETTE_ART,
  SILHOUETTE_ZONES,
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

function GhostGlyph({ family }: { family: GridCell["family"] }) {
  return (
    <svg className="db4-ghost-icon" viewBox="0 0 48 48" aria-hidden="true">
      {family === "scope" ? (
        <circle cx="24" cy="24" r="10" fill="none" stroke="currentColor" strokeWidth="1.4" />
      ) : family === "mount" ? (
        <rect x="10" y="20" width="28" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      ) : family === "tactical" ? (
        <path d="M12 30h24M18 18h12v12H18z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      ) : family === "charge" ? (
        <path d="M10 24h20l6-8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      ) : (
        <rect x="12" y="12" width="24" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      )}
    </svg>
  );
}

function StatBarRow({ bar }: { bar: StatBar }) {
  const start = Math.min(bar.pct, bar.basePct ?? bar.pct);
  const span = Math.abs((bar.basePct ?? bar.pct) - bar.pct);
  return (
    <div className={`db4-bar-row db4-bar-${bar.tone}`} data-stat={bar.id}>
      <span className="db4-bar-label">{bar.label}</span>
      <div className="db4-bar-track">
        {bar.tone === "recoil" ? (
          <span className="db4-bar-range" style={{ left: `${start}%`, width: `${Math.max(span, 3)}%` }} />
        ) : bar.tone === "accuracy" ? null : (
          <span className="db4-bar-fill" style={{ width: `${bar.pct}%` }} />
        )}
        <span className="db4-bar-mark" style={{ left: `${bar.pct}%` }} />
      </div>
      <span className="db4-bar-value">
        {bar.baseDisplay != null ? <span className="db4-bar-base">({bar.baseDisplay})</span> : null}
        {bar.display}
      </span>
    </div>
  );
}

function AttachmentCell({ cell }: { cell: GridCell }) {
  const badges = cellBadges(cell);
  const title = (cell.item?.shortName || cell.ghostLabel).toUpperCase();
  return (
    <article
      className={`db4-cell${cell.empty ? " db4-cell-empty" : ""}`}
      data-family={cell.family}
      data-col={cell.x}
      data-row={cell.y}
    >
      <header className="db4-cell-head">{title}</header>
      <div className="db4-cell-body">
        {badges.recoil ? <span className="db4-badge db4-badge-recoil">{badges.recoil}</span> : null}
        {badges.ergo ? (
          <span className={`db4-badge db4-badge-ergo${(cell.ergo ?? 0) < 0 ? " db4-badge-penalty" : ""}`}>
            {badges.ergo}
          </span>
        ) : null}
        {cell.empty ? (
          <GhostGlyph family={cell.family} />
        ) : cell.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cell.image} alt="" className="db4-cell-img" />
        ) : null}
        {cell.caption ? <p className="db4-cell-caption">{cell.caption}</p> : null}
      </div>
    </article>
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
  const ammoItem = itemForSlot(items, "Ammo");
  const ammo = ammoItem?.itemId ? catalog.get(ammoItem.itemId) : undefined;
  const board = buildGunBoard(weapon, catalog, ammo && !isUnpublishedSlot(ammoItem) ? ammo : undefined);
  const stats = assembledGunStats(weapon, catalog, ammo && !isUnpublishedSlot(ammoItem) ? ammo : undefined);
  const colLine = board.xs.map(String).join(" ");
  const rowLine = board.ys.map(String).join(" ");
  const gunCol = board.xs.indexOf(board.gun.x) + 1;
  const gunRow = board.ys.indexOf(board.gun.y) + 1;
  const weightFill =
    stats.weightTotal > 0 ? Math.max(0, Math.min(1, stats.weightCurrent / stats.weightTotal)) : 0;

  return (
    <section className="db4-gun">
      {stats.bars.length > 0 ? (
        <div className="db4-stats">
          {stats.bars.map((bar) => (
            <StatBarRow key={bar.id} bar={bar} />
          ))}
        </div>
      ) : null}

      <div
        className="db4-board"
        style={
          {
            "--db4-cols": board.xs.length,
            "--db4-rows": board.ys.length,
            gridTemplateColumns: `repeat(${board.xs.length}, var(--db4-img))`,
            gridTemplateRows: `repeat(${board.ys.length}, var(--db4-cell-h))`,
          } as CSSProperties
        }
        data-cols={colLine}
        data-rows={rowLine}
      >
        {board.cells.map((cell) => {
          const col = board.xs.indexOf(cell.x) + 1;
          const row = board.ys.indexOf(cell.y) + 1;
          return (
            <div
              key={cell.key}
              className="db4-cell-slot"
              style={{ gridColumn: col, gridRow: row } as CSSProperties}
            >
              <AttachmentCell cell={cell} />
            </div>
          );
        })}
        <article
          className="db4-cell db4-cell-gun"
          style={{ gridColumn: `${gunCol} / span ${board.gun.colSpan}`, gridRow: gunRow } as CSSProperties}
        >
          <header className="db4-cell-head">{board.gun.shortName.toUpperCase()}</header>
          <div className="db4-cell-body">
            {board.gun.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={board.gun.image} alt="" className="db4-cell-img db4-cell-img-gun" />
            ) : null}
            {board.gun.dps != null ? <p className="db4-dps">dps {board.gun.dps}</p> : null}
            <div className="db4-weight">
              <p className="db4-weight-text">
                <span className="db4-weight-current">
                  {stats.weightCurrent.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {" / "}
                {stats.weightTotal.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {"  kg"}
              </p>
              <span className="db4-weight-track">
                <span className="db4-weight-fill" style={{ width: `${weightFill * 100}%` }} />
              </span>
            </div>
          </div>
        </article>
      </div>

      <div className="db4-rails">
        <p className="db4-rails-label">rail attachments</p>
        {board.rails.length > 0 ? (
          <div className="db4-rails-row">
            {board.rails.map((cell) => (
              <AttachmentCell key={cell.key} cell={cell} />
            ))}
          </div>
        ) : null}
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
