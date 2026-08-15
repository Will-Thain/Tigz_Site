import { LINKS, twitchEmbedSrc } from "@/lib/links";
import { getClips, getSchedule, getStreamStatus, getVideos } from "@/lib/twitch";
import { getYoutubeUploads } from "@/lib/youtube";
import { WatchCta } from "@/components/WatchCta";

export const dynamic = "force-dynamic";

export const metadata = { title: "Watch" };

export default async function WatchPage() {
  const [stream, videos, clips, schedule, youtube] = await Promise.all([
    getStreamStatus(),
    getVideos("archive", 6),
    getClips(6),
    getSchedule(),
    getYoutubeUploads(),
  ]);

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] stencil text-olive-400">Broadcasts</p>
          <h1 className="font-display text-4xl">Watch Tigz</h1>
        </div>
        <WatchCta href={LINKS.twitch} />
      </header>

      {stream.live ? (
        <div className="frame overflow-hidden">
          <iframe
            title="Tigz live on Twitch"
            src={twitchEmbedSrc()}
            className="aspect-video w-full min-h-[300px]"
            allowFullScreen
          />
          {stream.title || stream.gameName ? (
            <p className="border-t border-sand-500/20 px-4 py-3 text-sm text-sand-300">
              <span className="text-live">LIVE</span>
              {stream.gameName ? ` · ${stream.gameName}` : ""}
              {stream.title ? ` — ${stream.title}` : ""}
              {stream.viewerCount != null ? ` · ${stream.viewerCount}` : ""}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="frame p-6">
          <p className="text-sand-300">He is offline. Use the Twitch button for VODs, or scan the schedule below.</p>
        </div>
      )}

      <section>
        <h2 className="mb-3 font-display text-2xl">Schedule</h2>
        {schedule.length === 0 ? (
          <p className="text-sm text-sand-500">
            No Helix schedule yet. Add Twitch API keys in `.env.local`, or follow{" "}
            <a className="text-olive-400" href={LINKS.twitch}>
              twitch.tv/tigz
            </a>
            .
          </p>
        ) : (
          <ul className="space-y-2">
            {schedule.map((seg) => (
              <li key={seg.id} className="frame flex justify-between gap-4 px-4 py-3 text-sm">
                <span>{seg.title}</span>
                <span className="font-mono text-sand-500">
                  {new Date(seg.startTime).toUTCString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {videos.length > 0 ? (
        <MediaRow title="Recent VODs" items={videos.map((v) => ({ id: v.id, title: v.title, url: v.url, image: v.thumbnailUrl }))} />
      ) : null}
      {clips.length > 0 ? (
        <MediaRow title="Clips" items={clips.map((c) => ({ id: c.id, title: c.title, url: c.url, image: c.thumbnailUrl }))} />
      ) : null}
      {youtube.length > 0 ? (
        <MediaRow title="YouTube" items={youtube.map((v) => ({ id: v.id, title: v.title, url: v.url, image: v.thumbnailUrl }))} />
      ) : null}
    </div>
  );
}

function MediaRow({
  title,
  items,
}: {
  title: string;
  items: { id: string; title: string; url: string; image: string }[];
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-2xl">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.slice(0, 6).map((item) => (
          <a key={item.id} href={item.url} className="frame overflow-hidden">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt="" className="aspect-video w-full object-cover" />
            ) : null}
            <p className="p-3 text-sm">{item.title}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
