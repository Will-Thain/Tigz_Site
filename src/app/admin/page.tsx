import Link from "next/link";
import { redirect } from "next/navigation";
import { EventSubSetup } from "@/app/admin/EventSubSetup";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

const sections = [
  { href: "/admin/kit", label: "Kit", hint: "Publish the current loadout" },
  { href: "/admin/progress", label: "Progress", hint: "PMC, scav, hideout notes" },
  { href: "/admin/polls", label: "Polls", hint: "Create and close community votes" },
  { href: "/admin/sponsors", label: "Sponsors", hint: "Current and past partners" },
  { href: "/admin/faqs", label: "FAQs", hint: "Answers on /faq" },
];

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] stencil text-olive-400">Mods</p>
        <h1 className="font-display text-4xl">Publish queue</h1>
        <p className="mt-2 max-w-2xl text-sand-300">
          Kit and progress are owned by the Tarkov tools. Polls, sponsors, and FAQs are edited here.
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2">
        {sections.map((section) => (
          <li key={section.href}>
            <Link href={section.href} className="frame block p-5 hover:border-olive-500/40">
              <h2 className="font-display text-2xl">{section.label}</h2>
              <p className="mt-1 text-sm text-sand-300">{section.hint}</p>
            </Link>
          </li>
        ))}
      </ul>
      <EventSubSetup
        callback={
          process.env.NEXT_PUBLIC_SITE_URL
            ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/api/twitch/eventsub`
            : null
        }
      />
    </div>
  );
}
