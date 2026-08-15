import { isAdmin } from "@/lib/admin";
import { getCurrentKit } from "@/lib/kit-store";
import { KitPublishForm } from "./KitPublishForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Publish kit" };

export default async function AdminKitPage() {
  if (!(await isAdmin())) {
    return (
      <div className="space-y-4">
        <p className="font-mono text-[11px] stencil text-olive-400">Mods</p>
        <h1 className="font-display text-4xl">Publish kit</h1>
        <p className="text-sand-300">set ADMIN_PASSWORD and log in at /admin</p>
      </div>
    );
  }

  const kit = await getCurrentKit();

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[11px] stencil text-olive-400">Mods</p>
        <h1 className="font-display text-4xl">Publish kit</h1>
        <p className="mt-2 max-w-2xl text-sand-300">
          Publishing replaces the public /kit card and keeps the previous current kit in history. This is not a live
          pull from the game.
        </p>
      </header>

      <section className="frame p-5">
        <h2 className="font-display text-2xl">On the site now</h2>
        <p className="mt-2 text-sand-300">{kit.title}</p>
        <p className="mt-1 font-mono text-[11px] text-sand-500">
          Wipe {kit.wipe} · {new Date(kit.publishedAt).toUTCString()}
        </p>
      </section>

      <KitPublishForm />
    </div>
  );
}
