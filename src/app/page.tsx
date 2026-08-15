import Link from "next/link";
import { loadFaqs } from "@/data/faqs";
import { LINKS } from "@/lib/links";
import { getCurrentKit } from "@/lib/kit-store";
import { getStreamStatus } from "@/lib/twitch";
import { getYoutubeUploads } from "@/lib/youtube";
import { WatchCta } from "@/components/WatchCta";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [stream, youtube, kit, faqs] = await Promise.all([
    getStreamStatus(),
    getYoutubeUploads(),
    getCurrentKit(),
    loadFaqs(),
  ]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="space-y-6">
        <p className="font-mono text-[11px] stencil text-olive-400">Escape from Tarkov · extraction shooters</p>
        <h1 className="font-display text-5xl font-semibold leading-none text-sand-100 sm:text-6xl">
          The raid is on Twitch.
        </h1>
        <p className="max-w-xl text-lg text-sand-300">
          Kit cards, quest notes, schedule, and FAQs live here so chat can stop repeating itself. The stream is still the
          point.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <WatchCta href={LINKS.twitch} label={stream.live ? "Join the live raid" : "Open Twitch"} />
          <a href={LINKS.youtube} className="border border-sand-500/30 px-3 py-1.5 font-mono text-[11px] stencil text-sand-100">
            YouTube
          </a>
          <a href={LINKS.discord} className="border border-sand-500/30 px-3 py-1.5 font-mono text-[11px] stencil text-sand-100">
            Discord
          </a>
        </div>
        {stream.live ? (
          <p className="text-sm text-sand-300">
            <span className="text-live">LIVE</span>
            {stream.gameName ? ` · ${stream.gameName}` : ""}
            {stream.title ? ` — ${stream.title}` : ""}
          </p>
        ) : (
          <p className="text-sm text-sand-500">Offline. VODs and the next scheduled raid are on /watch.</p>
        )}
      </section>

      <aside className="frame p-5">
        <p className="font-mono text-[11px] stencil text-sand-500">Current kit</p>
        <h2 className="mt-2 font-display text-2xl text-sand-100">{kit.title}</h2>
        <p className="mt-2 text-sm text-sand-300">{kit.notes}</p>
        <p className="mt-4 font-mono text-[11px] text-sand-500">
          Updated {new Date(kit.publishedAt).toUTCString()}
        </p>
        <Link href="/kit" className="mt-4 inline-block font-mono text-[11px] stencil text-olive-400">
          Open loadout →
        </Link>
      </aside>

      <section className="lg:col-span-2">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl">FAQ</h2>
          <Link href="/faq" className="font-mono text-[11px] stencil text-olive-400">
            Search all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {faqs.slice(0, 4).map((faq) => (
            <article key={faq.id} className="frame p-4">
              <p className="font-mono text-[10px] stencil text-sand-500">{faq.category}</p>
              <h3 className="mt-1 font-semibold text-sand-100">{faq.question}</h3>
              <p className="mt-2 text-sm text-sand-300">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      {youtube.length > 0 ? (
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl">Latest YouTube</h2>
            <a href={LINKS.youtube} className="font-mono text-[11px] stencil text-olive-400">
              Channel
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {youtube.slice(0, 3).map((video) => (
              <a key={video.id} href={video.url} className="frame overflow-hidden hover:border-sand-300/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={video.thumbnailUrl} alt="" className="aspect-video w-full object-cover" />
                <p className="p-3 text-sm text-sand-100">{video.title}</p>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
