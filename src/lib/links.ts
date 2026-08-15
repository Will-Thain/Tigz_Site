export const LINKS = {
  twitch: "https://www.twitch.tv/tigz",
  twitchVideos: "https://www.twitch.tv/tigz/videos",
  youtube: "https://www.youtube.com/@tigztwitch",
  discord: "https://discord.gg/tigz",
  twitter: "https://twitter.com/RealTigz",
  tips: "https://streamelements.com/Tigz/tip",
  talentEmail: "Tigz@mythictalent.com",
} as const;

export const TWITCH_LOGIN = "tigz";
export const TWITCH_USER_ID = "438062587";
export const YOUTUBE_CHANNEL_ID = "UCKvHlvMpX7HMZ70w5Nyyz_w";

export function siteHost() {
  const raw = process.env.NEXT_PUBLIC_SITE_HOST ?? "localhost";
  return raw.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim() || "localhost";
}

export function twitchEmbedParents(host = siteHost()): string[] {
  const parents = new Set<string>([host, "localhost"]);
  if (host !== "localhost") {
    if (host.startsWith("www.")) parents.add(host.slice(4));
    else parents.add(`www.${host}`);
  }
  return [...parents];
}

export function twitchEmbedSrc(channel = TWITCH_LOGIN) {
  const qs = twitchEmbedParents().map((p) => `parent=${encodeURIComponent(p)}`).join("&");
  return `https://player.twitch.tv/?channel=${channel}&${qs}&muted=true`;
}
