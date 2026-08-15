import { YOUTUBE_CHANNEL_ID } from "./links";

export type YoutubeVideo = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  url: string;
};

export async function getYoutubeUploads(): Promise<YoutubeVideo[]> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID ?? YOUTUBE_CHANNEL_ID;
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { next: { revalidate: 900 } },
    );
    if (!res.ok) return [];
    const xml = await res.text();
    return parseAtom(xml);
  } catch {
    return [];
  }
}

function parseAtom(xml: string): YoutubeVideo[] {
  const entries = xml.split("<entry>").slice(1);
  return entries.slice(0, 9).map((entry) => {
    const id = match(entry, /<yt:videoId>([^<]+)<\/yt:videoId>/) ?? "";
    const title = decode(match(entry, /<title>([^<]+)<\/title>/) ?? "Video");
    const publishedAt = match(entry, /<published>([^<]+)<\/published>/) ?? "";
    return {
      id,
      title,
      publishedAt,
      thumbnailUrl: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "",
      url: id ? `https://www.youtube.com/watch?v=${id}` : "https://www.youtube.com/@tigztwitch",
    };
  });
}

function match(haystack: string, re: RegExp) {
  return haystack.match(re)?.[1];
}

function decode(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

export async function getYoutubeSubscriberCount(): Promise<number | null> {
  const key = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID ?? YOUTUBE_CHANNEL_ID;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${key}`,
      { next: { revalidate: 60 * 60 * 6 } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      items?: Array<{ statistics?: { subscriberCount?: string } }>;
    };
    const raw = json.items?.[0]?.statistics?.subscriberCount;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
