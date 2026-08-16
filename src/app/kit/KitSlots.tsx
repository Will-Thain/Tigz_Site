import type { Kit, KitItem, KitSlot } from "@/data/kits";
import {
  isUnpublishedSlot,
  kitSlotsInOrder,
  pickKitImage,
  resolveKitItemName,
  resolveKitShortName,
} from "@/lib/kit-display";
import type { TarkovItemLite } from "@/lib/tarkov";

function shownItem(item: KitItem, catalog: Map<string, TarkovItemLite>) {
  const hydrated = item.itemId ? catalog.get(item.itemId) : undefined;
  return {
    unpublished: isUnpublishedSlot(item),
    name: resolveKitItemName(item, hydrated),
    shortName: resolveKitShortName(item, hydrated),
    image: pickKitImage(item.slot, hydrated),
    icon: hydrated?.iconLink,
  };
}

function PmcSilhouette() {
  return (
    <svg viewBox="0 0 80 160" className="mx-auto h-[210px] w-auto text-olive-500/40" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
        <circle cx="40" cy="18" r="12" />
        <path d="M28 34h24c10 6 16 18 16 32v10H12V66c0-14 6-26 16-32z" />
        <path d="M16 76v54c0 6 4 10 10 10h8V90h12v50h8c6 0 10-4 10-10V76" />
      </g>
    </svg>
  );
}

function KitCell({
  item,
  catalog,
  size,
}: {
  item: KitItem;
  catalog: Map<string, TarkovItemLite>;
  size: "weapon" | "pistol" | "gear" | "pack" | "headset" | "ammo" | "strip";
}) {
  const shown = shownItem(item, catalog);
  const image = shown.image ?? shown.icon;
  const sizeClass = {
    weapon: "min-h-[132px] sm:min-h-[156px]",
    pistol: "min-h-[88px]",
    gear: "min-h-[132px]",
    pack: "min-h-[168px]",
    headset: "min-h-[92px]",
    ammo: "min-h-[92px]",
    strip: "min-h-[76px]",
  }[size];
  const imageClass = {
    weapon: "max-h-[108px] w-auto max-w-[92%] object-contain sm:max-h-[128px]",
    pistol: "max-h-[56px] w-auto max-w-[88%] object-contain",
    gear: "max-h-[88px] w-auto max-w-[80%] object-contain",
    pack: "max-h-[120px] w-auto max-w-[80%] object-contain",
    headset: "max-h-[56px] w-auto max-w-[70%] object-contain",
    ammo: "max-h-[52px] w-auto max-w-[70%] object-contain",
    strip: "max-h-[40px] w-auto max-w-[70%] object-contain",
  }[size];

  return (
    <article className={`eft-cell ${shown.unpublished ? "eft-cell-empty" : ""} ${sizeClass}`}>
      <p className="eft-cell-slot">{item.slot}</p>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-2 pb-8 pt-6">
        {image && !shown.unpublished ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className={imageClass} />
        ) : (
          <p className="font-mono text-[10px] stencil text-sand-500/80">Unpublished</p>
        )}
      </div>
      {shown.unpublished ? null : (
        <div className="pointer-events-none absolute inset-x-2 bottom-2">
          <p className="truncate font-display text-sm leading-tight text-sand-100 sm:text-base">{shown.name}</p>
          {shown.shortName ? <p className="truncate font-mono text-[10px] text-sand-500">{shown.shortName}</p> : null}
          {item.detail ? <p className="truncate text-[11px] text-sand-300">{item.detail}</p> : null}
        </div>
      )}
    </article>
  );
}

export function KitInspect({
  items,
  catalog,
}: {
  items: KitItem[];
  catalog: Map<string, TarkovItemLite>;
}) {
  const bySlot = new Map(kitSlotsInOrder(items).map((item) => [item.slot, item]));
  const slot = (name: KitSlot) => bySlot.get(name)!;

  return (
    <div className="kit-inspect">
      <div className="space-y-3">
        <KitCell item={slot("Primary")} catalog={catalog} size="weapon" />
        <KitCell item={slot("Secondary")} catalog={catalog} size="weapon" />
        <KitCell item={slot("Pistol")} catalog={catalog} size="pistol" />
      </div>

      <div className="flex flex-col gap-3">
        <KitCell item={slot("Headset")} catalog={catalog} size="headset" />
        <div className="eft-cell eft-cell-empty flex min-h-[220px] flex-1 flex-col items-center justify-center px-4 py-6">
          <p className="eft-cell-slot">PMC</p>
          <PmcSilhouette />
          <p className="mt-2 font-mono text-[10px] stencil text-sand-500">Inspect</p>
        </div>
        <KitCell item={slot("Ammo")} catalog={catalog} size="ammo" />
      </div>

      <div className="space-y-3">
        <KitCell item={slot("Armor")} catalog={catalog} size="gear" />
        <KitCell item={slot("Rig")} catalog={catalog} size="gear" />
        <KitCell item={slot("Backpack")} catalog={catalog} size="pack" />
      </div>
    </div>
  );
}

export function KitLoadoutStrip({
  items,
  catalog,
}: {
  items: KitItem[];
  catalog: Map<string, TarkovItemLite>;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {kitSlotsInOrder(items).map((item) => (
        <KitCell key={item.slot} item={item} catalog={catalog} size="strip" />
      ))}
    </div>
  );
}

/** Compact archive grid — still stash cells, not the full paper-doll. */
export function KitSlotGrid({
  items,
  catalog,
}: {
  items: KitItem[];
  catalog: Map<string, TarkovItemLite>;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {kitSlotsInOrder(items).map((item) => (
        <KitCell key={item.slot} item={item} catalog={catalog} size="gear" />
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
