import type { Kit, KitItem } from "@/data/kits";
import type { TarkovItemLite } from "@/lib/tarkov";

function displayItem(item: KitItem, catalog: Map<string, TarkovItemLite>) {
  const hydrated = item.itemId ? catalog.get(item.itemId) : undefined;
  return {
    name: hydrated?.name ?? item.label,
    icon: hydrated?.iconLink,
    shortName: hydrated?.shortName,
  };
}

export function KitSlotGrid({
  items,
  catalog,
}: {
  items: KitItem[];
  catalog: Map<string, TarkovItemLite>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const shown = displayItem(item, catalog);
        return (
          <article key={item.slot} className="frame p-4">
            <p className="font-mono text-[10px] stencil text-sand-500">{item.slot}</p>
            <div className="mt-2 flex items-start gap-3">
              {shown.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shown.icon} alt="" className="h-12 w-12 shrink-0 object-contain" />
              ) : null}
              <div>
                <h2 className="font-display text-xl text-sand-100">{shown.name}</h2>
                {shown.shortName && shown.shortName !== shown.name ? (
                  <p className="font-mono text-[11px] text-sand-500">{shown.shortName}</p>
                ) : null}
              </div>
            </div>
            {item.detail ? <p className="mt-2 text-sm text-sand-300">{item.detail}</p> : null}
          </article>
        );
      })}
    </div>
  );
}

export function KitStamp({ kit }: { kit: Kit }) {
  return (
    <p className="mt-5 font-display text-3xl leading-none text-sand-100 sm:text-5xl">
      Updated {new Date(kit.publishedAt).toUTCString()}
    </p>
  );
}
