import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { loadSponsors } from "@/data/sponsors";
import { SponsorAdmin } from "./SponsorAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin sponsors" };

export default async function AdminSponsorsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const sponsors = await loadSponsors();

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] stencil text-olive-400">Mods</p>
        <h1 className="font-display text-4xl">Sponsors</h1>
        <p className="mt-2 text-sand-300">
          <Link href="/admin" className="text-olive-400">
            Publish queue
          </Link>{" "}
          · current logos only on /partners
        </p>
      </header>
      <SponsorAdmin sponsors={sponsors} />
    </div>
  );
}
