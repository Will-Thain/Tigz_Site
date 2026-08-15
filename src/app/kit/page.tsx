import Link from "next/link";
import { KitSlotGrid, KitStamp } from "@/app/kit/KitSlots";
import { getCurrentKit } from "@/lib/kit-store";
import { hydrateItemsById } from "@/lib/tarkov";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kit" };

export default async function KitPage() {
  const kit = await getCurrentKit();
  const catalog = await hydrateItemsById(kit.items.map((item) => item.itemId));

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[11px] stencil text-olive-400">Loadout</p>
        <h1 className="font-display text-4xl">{kit.title}</h1>
        <p className="mt-2 max-w-2xl text-sand-300">{kit.notes}</p>
        <KitStamp kit={kit} />
        <p className="mt-2 font-mono text-[11px] text-sand-500">
          Wipe {kit.wipe} · {kit.publishedBy} · published on this site, not live from the game
        </p>
      </header>

      <KitSlotGrid items={kit.items} catalog={catalog} />

      {kit.vodUrl ? (
        <a href={kit.vodUrl} className="inline-block font-mono text-[11px] stencil text-olive-400">
          VOD
        </a>
      ) : null}

      <p className="text-sm text-sand-500">
        This page is never synced from the game client.{" "}
        <Link href="/kit/history" className="text-olive-400">
          Kit history
        </Link>
      </p>
    </div>
  );
}
