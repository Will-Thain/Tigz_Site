import Link from "next/link";
import { mediaKit, loadSponsors } from "@/data/sponsors";
import { getAverageCcv, getFollowerTotal } from "@/lib/twitch";
import { getYoutubeSubscriberCount } from "@/lib/youtube";

export const dynamic = "force-dynamic";
export const metadata = { title: "Partners" };

export default async function PartnersPage() {
  const [followers, subs, avgCcv, sponsors] = await Promise.all([
    getFollowerTotal(),
    getYoutubeSubscriberCount(),
    getAverageCcv(),
    loadSponsors(),
  ]);
  const current = sponsors.filter((s) => s.status === "current");
  const past = sponsors.filter((s) => s.status === "past");

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <p className="font-mono text-[11px] stencil text-olive-400">Business</p>
        <h1 className="font-display text-4xl">Partners</h1>
        <p className="mt-3 text-sand-300">
          Brand work is managed by {mediaKit.managedBy}. Use the form for inbound campaigns, or email{" "}
          <a className="text-olive-400" href={`mailto:${mediaKit.contact}`}>
            {mediaKit.contact}
          </a>
          .
        </p>
      </header>

      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Twitch followers" value={followers ? followers.toLocaleString() : mediaKit.followersApprox} />
        <Stat label="YouTube subs" value={subs ? subs.toLocaleString() : "See channel"} />
        <Stat label="Avg CCV (sampled)" value={avgCcv != null ? avgCcv.toLocaleString() : "—"} />
        <Stat label="Cadence" value={mediaKit.cadence} />
      </dl>

      <section>
        <h2 className="mb-3 font-display text-2xl">Current</h2>
        {current.length === 0 ? (
          <p className="text-sm text-sand-500">No logos published yet. Incoming partners appear here after a deal is live.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {current.map((s) => (
              <li key={s.id} className="frame p-4">
                <a href={s.url} className="font-display text-xl">
                  {s.name}
                </a>
                <p className="mt-1 text-sm text-sand-300">{s.blurb}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 ? (
        <section>
          <h2 className="mb-3 font-display text-2xl">Past</h2>
          <ul className="flex flex-wrap gap-3 text-sand-500">
            {past.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link href="/partners/apply" className="inline-block bg-sand-100 px-4 py-2 font-mono text-[11px] stencil text-ink-950">
        Apply for a partnership
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="frame p-4">
      <dt className="font-mono text-[10px] stencil text-sand-500">{label}</dt>
      <dd className="mt-2 font-display text-2xl">{value}</dd>
    </div>
  );
}
