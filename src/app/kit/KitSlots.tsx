import type { CSSProperties } from "react";
import type { Kit, KitItem, KitSlot } from "@/data/kits";
import {
  isUnpublishedSlot,
  kitSlotsInOrder,
  pickKitImage,
  resolveKitItemName,
  resolveKitShortName,
  SLOT_UI,
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
  };
}

function StashSlot({
  item,
  catalog,
}: {
  item: KitItem;
  catalog: Map<string, TarkovItemLite>;
}) {
  const shown = shownItem(item, catalog);
  const ui = SLOT_UI[item.slot];
  const style = { "--cols": ui.cols, "--rows": ui.rows } as CSSProperties;

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
        </div>
      )}
    </article>
  );
}

export function KitInspect({
  items,
  catalog,
  wipe,
}: {
  items: KitItem[];
  catalog: Map<string, TarkovItemLite>;
  wipe?: string;
}) {
  const bySlot = new Map(kitSlotsInOrder(items).map((item) => [item.slot, item]));
  const slot = (name: KitSlot) => bySlot.get(name)!;
  const unpublished = kitSlotsInOrder(items).every((item) => isUnpublishedSlot(item));

  return (
    <section className="eft-equipment">
      <div className="eft-equipment-bar">
        <span>Equipment</span>
        <span>{unpublished ? "Unpublished" : wipe ? `Wipe ${wipe}` : "Loadout"}</span>
      </div>

      <div className="eft-equipment-stage">
        <div className="eft-doll">
          <div className="eft-doll-ear">
            <StashSlot item={slot("Headset")} catalog={catalog} />
          </div>
          <div className="eft-doll-body">
            <PmcFigure />
          </div>
          <div className="eft-doll-gear">
            <StashSlot item={slot("Armor")} catalog={catalog} />
            <StashSlot item={slot("Rig")} catalog={catalog} />
            <StashSlot item={slot("Backpack")} catalog={catalog} />
          </div>
        </div>

        <div className="eft-weapon-rack">
          <StashSlot item={slot("Primary")} catalog={catalog} />
          <StashSlot item={slot("Secondary")} catalog={catalog} />
          <div className="eft-weapon-side">
            <StashSlot item={slot("Pistol")} catalog={catalog} />
            <StashSlot item={slot("Ammo")} catalog={catalog} />
          </div>
        </div>
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
  const bySlot = new Map(kitSlotsInOrder(items).map((item) => [item.slot, item]));
  const slot = (name: KitSlot) => bySlot.get(name)!;

  return (
    <div className="eft-equipment eft-equipment-compact">
      <div className="eft-weapon-rack">
        <StashSlot item={slot("Primary")} catalog={catalog} />
        <StashSlot item={slot("Secondary")} catalog={catalog} />
      </div>
      <div className="eft-compact-gear">
        <StashSlot item={slot("Pistol")} catalog={catalog} />
        <StashSlot item={slot("Headset")} catalog={catalog} />
        <StashSlot item={slot("Ammo")} catalog={catalog} />
        <StashSlot item={slot("Armor")} catalog={catalog} />
        <StashSlot item={slot("Rig")} catalog={catalog} />
        <StashSlot item={slot("Backpack")} catalog={catalog} />
      </div>
    </div>
  );
}

export function KitSlotGrid({
  items,
  catalog,
}: {
  items: KitItem[];
  catalog: Map<string, TarkovItemLite>;
}) {
  return (
    <div className="eft-equipment eft-equipment-compact eft-history-grid">
      {kitSlotsInOrder(items).map((item) => (
        <StashSlot key={item.slot} item={item} catalog={catalog} />
      ))}
    </div>
  );
}

export function KitStamp({ kit }: { kit: Kit }) {
  return (
    <p className="font-mono text-[11px] stencil text-sand-500">
      Updated {new Date(kit.publishedAt).toUTCString()}
    </p>
  );
}
