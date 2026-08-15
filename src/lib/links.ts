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
  return process.env.NEXT_PUBLIC_SITE_HOST ?? "localhost";
}

export function twitchEmbedSrc(channel = TWITCH_LOGIN) {
  const parent = siteHost();
  const parents = new Set([parent, "localhost"]);
  const qs = [...parents].map((p) => `parent=${encodeURIComponent(p)}`).join("&");
  return `https://player.twitch.tv/?channel=${channel}&${qs}&muted=true`;
}
