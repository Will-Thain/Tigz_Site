import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { loadPolls } from "@/app/api/polls/store";
import { PollAdmin } from "./PollAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin polls" };

export default async function AdminPollsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const polls = await loadPolls();

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] stencil text-olive-400">Mods</p>
        <h1 className="font-display text-4xl">Polls</h1>
        <p className="mt-2 text-sand-300">
          <Link href="/admin" className="text-olive-400">
            Publish queue
          </Link>{" "}
          · first-party votes only
        </p>
      </header>
      <PollAdmin polls={polls} />
    </div>
  );
}
