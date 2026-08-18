import { KitInspect } from "@/app/kit/KitSlots";
import { KIT_RENDER_FIXTURE } from "@/data/kit-render-fixture";
import { hydrateItemsById } from "@/lib/tarkov";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Kit asset render",
  robots: { index: false, follow: false },
};

export default async function KitRenderPage() {
  const kit = KIT_RENDER_FIXTURE;
  const catalog = await hydrateItemsById(kit.items.map((item) => item.itemId));

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[11px] stencil text-olive-400">Plate asset fixture</p>
        <h1 className="font-display text-4xl">{kit.title}</h1>
        <p className="mt-2 max-w-2xl text-sand-300">{kit.notes}</p>
      </header>
      <KitInspect items={kit.items} catalog={catalog} wipe={kit.wipe} />
    </div>
  );
}
