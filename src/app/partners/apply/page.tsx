import { LINKS } from "@/lib/links";
import { ApplyForm } from "@/components/ApplyForm";

export const metadata = { title: "Partnership application" };

export default function ApplyPage() {
  return (
    <div className="space-y-6">
      <header className="max-w-xl">
        <p className="font-mono text-[11px] stencil text-olive-400">Inbound</p>
        <h1 className="font-display text-4xl">Partnership application</h1>
        <p className="mt-2 text-sand-300">
          Routed to {LINKS.talentEmail}. Do not pitch in Twitch chat.
        </p>
      </header>
      <ApplyForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null} />
    </div>
  );
}
