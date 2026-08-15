import { isAdmin } from "@/lib/admin";
import { loadProgress } from "@/lib/tarkov";
import { ProgressEditForm } from "./ProgressEditForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit progress" };

export default async function AdminProgressPage() {
  if (!(await isAdmin())) {
    return (
      <div className="space-y-4">
        <p className="font-mono text-[11px] stencil text-olive-400">Mods</p>
        <h1 className="font-display text-4xl">Edit progress</h1>
        <p className="text-sand-300">set ADMIN_PASSWORD and log in at /admin</p>
      </div>
    );
  }

  const stats = await loadProgress();

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[11px] stencil text-olive-400">Mods</p>
        <h1 className="font-display text-4xl">Edit progress</h1>
        <p className="mt-2 max-w-2xl text-sand-300">
          These fields are typed in here. Quest completion can later overlay a TarkovTracker.org read-only token. Nothing
          is read from the game.
        </p>
      </header>
      <ProgressEditForm stats={stats} />
    </div>
  );
}
