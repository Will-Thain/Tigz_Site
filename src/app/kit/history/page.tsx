import Link from "next/link";
import { KitSlotGrid } from "@/app/kit/KitSlots";
import { getKitHistory } from "@/lib/kit-store";
import { hydrateItemsById } from "@/lib/tarkov";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kit history" };

export default async function KitHistoryPage() {
  const history = await getKitHistory();
  const catalog = await hydrateItemsById(history.flatMap((kit) => kit.items.map((item) => item.itemId)));

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] stencil text-olive-400">Archives</p>
        <h1 className="font-display text-4xl">Historic kits</h1>
        <p className="mt-2 text-sand-300">
          Snapshots of kits published on this site. There is no third-party kit history API.
        </p>
      </header>
      <ul className="space-y-3">
        {history.map((kit) => (
          <li key={kit.id} className="frame p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl">{kit.title}</h2>
              <span className="font-mono text-[11px] text-sand-500">
                {kit.isCurrent ? "Current · " : ""}
                {new Date(kit.publishedAt).toUTCString()}
              </span>
            </div>
            <p className="mt-2 text-sm text-sand-300">{kit.notes}</p>
            <p className="mt-1 font-mono text-[11px] text-sand-500">Wipe {kit.wipe}</p>
            {kit.vodUrl ? (
              <a href={kit.vodUrl} className="mt-2 inline-block text-sm text-olive-400">
                VOD
              </a>
            ) : null}
            <div className="mt-4">
              <KitSlotGrid items={kit.items} catalog={catalog} />
            </div>
          </li>
        ))}
      </ul>
      <Link href="/kit" className="font-mono text-[11px] stencil text-olive-400">
        ← Current kit
      </Link>
    </div>
  );
}
