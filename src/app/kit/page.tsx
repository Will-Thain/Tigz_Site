import Link from "next/link";
import { KitInspect, KitStamp } from "@/app/kit/KitSlots";
import { getCurrentKit } from "@/lib/kit-store";
import { hydrateItemsById } from "@/lib/tarkov";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kit" };

export default async function KitPage() {
  const kit = await getCurrentKit();
  const catalog = await hydrateItemsById(kit.items.map((item) => item.itemId));

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] stencil text-olive-400">Character inspect</p>
          <h1 className="font-display text-4xl">{kit.title}</h1>
          <p className="mt-2 max-w-2xl text-sand-300">{kit.notes}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[11px] stencil text-sand-500">Wipe {kit.wipe}</p>
          <div className="mt-2">
            <KitStamp kit={kit} />
          </div>
          <p className="mt-1 font-mono text-[11px] text-sand-500">
            {kit.publishedBy} · published here, not live from the game
          </p>
        </div>
      </header>

      <KitInspect items={kit.items} catalog={catalog} />

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
