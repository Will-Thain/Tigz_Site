import { TWITCH_LOGIN, TWITCH_USER_ID } from "./links";
import { readStore, writeStore } from "./store";

export type TwitchStream = {
  live: boolean;
  title?: string;
  gameName?: string;
  viewerCount?: number;
  startedAt?: string;
  thumbnailUrl?: string;
};

export type TwitchVideo = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
};

export type TwitchClip = {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  viewCount: number;
};

export type ScheduleSegment = {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  canceled: boolean;
};

export type LiveFlag = {
  live: boolean;
  at: string;
  title?: string;
};

const STORE_LIVE_MAX_MS = 2 * 60 * 1000;
export const CCV_SAMPLE_KEY = "ccvSamples";
export const CCV_MAX_SAMPLES = 48;
export const CCV_DEDUPE_MS = 10 * 60 * 1000;

export type CcvSample = { at: string; viewers: number };

type TokenCache = { token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

export async function appAccessToken(): Promise<string | null> {
  const id = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  if (!id || !secret) return null;

  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  try {
    const res = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: id,
        client_secret: secret,
        grant_type: "client_credentials",
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!json.access_token) return null;
    tokenCache = {
      token: json.access_token,
      expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
    };
    return json.access_token;
  } catch {
    return null;
  }
}

async function helix(path: string, revalidate = 30) {
  const token = await appAccessToken();
  const clientId = process.env.TWITCH_CLIENT_ID;
  if (!token || !clientId) return null;
  try {
    const res = await fetch(`https://api.twitch.tv/helix/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": clientId,
      },
      ...(revalidate <= 0 ? { cache: "no-store" as const } : { next: { revalidate } }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function storedAtMs(at: unknown): number | null {
  if (typeof at === "number" && Number.isFinite(at)) return at;
  if (typeof at === "string") {
    const n = Date.parse(at);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export async function getStreamStatus(): Promise<TwitchStream> {
  if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
    return { live: false };
  }

  const userId = process.env.TWITCH_BROADCASTER_ID ?? TWITCH_USER_ID;
  const json = (await helix(`streams?user_id=${userId}`, 0)) as
    | { data?: Array<Record<string, unknown>> }
    | null;
  const row = json?.data?.[0];
  if (row) {
    const viewerCount = typeof row.viewer_count === "number" ? row.viewer_count : undefined;
    if (typeof viewerCount === "number") await recordCcvSample(viewerCount);
    return {
      live: true,
      title: typeof row.title === "string" ? row.title : undefined,
      gameName: typeof row.game_name === "string" ? row.game_name : undefined,
      viewerCount,
      startedAt: typeof row.started_at === "string" ? row.started_at : undefined,
      thumbnailUrl: typeof row.thumbnail_url === "string" ? row.thumbnail_url : undefined,
    };
  }

  const stored = await readStore<LiveFlag | null>("live", null);
  if (stored?.live) {
    const at = storedAtMs(stored.at);
    if (at != null) {
      const age = Date.now() - at;
      if (age >= 0 && age < STORE_LIVE_MAX_MS) {
        return { live: true, title: stored.title };
      }
    }
  }

  return { live: false };
}

export async function getVideos(type: "archive" | "highlight" = "archive", first = 8): Promise<TwitchVideo[]> {
  const userId = process.env.TWITCH_BROADCASTER_ID ?? TWITCH_USER_ID;
  const json = (await helix(`videos?user_id=${userId}&type=${type}&sort=time&first=${first}`)) as
    | { data?: Array<Record<string, unknown>> }
    | null;
  return (json?.data ?? []).map((row) => ({
    id: String(row.id ?? ""),
    title: String(row.title ?? "Untitled"),
    url: String(row.url ?? `https://www.twitch.tv/videos/${row.id}`),
    thumbnailUrl: String(row.thumbnail_url ?? "").replace("%{width}", "320").replace("%{height}", "180"),
    publishedAt: String(row.published_at ?? ""),
    duration: String(row.duration ?? ""),
  }));
}

export async function getClips(first = 8): Promise<TwitchClip[]> {
  const userId = process.env.TWITCH_BROADCASTER_ID ?? TWITCH_USER_ID;
  const ended = new Date();
  const started = new Date(ended.getTime() - 14 * 24 * 60 * 60 * 1000);
  const json = (await helix(
    `clips?broadcaster_id=${userId}&first=${first}&started_at=${started.toISOString()}&ended_at=${ended.toISOString()}`,
  )) as { data?: Array<Record<string, unknown>> } | null;
  return (json?.data ?? []).map((row) => ({
    id: String(row.id ?? ""),
    title: String(row.title ?? "Clip"),
    url: String(row.url ?? ""),
    embedUrl: String(row.embed_url ?? ""),
    thumbnailUrl: String(row.thumbnail_url ?? ""),
    createdAt: String(row.created_at ?? ""),
    viewCount: typeof row.view_count === "number" ? row.view_count : 0,
  }));
}

export async function getSchedule(): Promise<ScheduleSegment[]> {
  const userId = process.env.TWITCH_BROADCASTER_ID ?? TWITCH_USER_ID;
  const json = (await helix(`schedule?broadcaster_id=${userId}`)) as
    | { data?: { segments?: Array<Record<string, unknown>> } }
    | null;
  const segments = json?.data?.segments ?? [];
  if (segments.length > 0) {
    return segments.slice(0, 12).map((row) => ({
      id: String(row.id ?? ""),
      startTime: String(row.start_time ?? ""),
      endTime: String(row.end_time ?? ""),
      title: String(row.title ?? TWITCH_LOGIN),
      canceled: Boolean(row.canceled_until),
    }));
  }
  return fetchIcalSchedule(userId);
}

export async function getFollowerTotal(): Promise<number | null> {
  const userId = process.env.TWITCH_BROADCASTER_ID ?? TWITCH_USER_ID;
  const json = (await helix(`channels/followers?broadcaster_id=${userId}&first=1`)) as
    | { total?: number }
    | null;
  return typeof json?.total === "number" ? json.total : null;
}

export async function recordCcvSample(viewers: number, now = Date.now()): Promise<CcvSample[]> {
  const samples = await readStore<CcvSample[]>(CCV_SAMPLE_KEY, []);
  const last = samples[samples.length - 1];
  if (last) {
    const lastAt = Date.parse(last.at);
    if (Number.isFinite(lastAt) && now - lastAt < CCV_DEDUPE_MS) return samples;
  }
  const next = [...samples, { at: new Date(now).toISOString(), viewers }].slice(-CCV_MAX_SAMPLES);
  await writeStore(CCV_SAMPLE_KEY, next);
  return next;
}

export async function getAverageCcv(): Promise<number | null> {
  const samples = await readStore<CcvSample[]>(CCV_SAMPLE_KEY, []);
  if (samples.length === 0) return null;
  const sum = samples.reduce((total, sample) => total + sample.viewers, 0);
  return Math.round(sum / samples.length);
}

export function parseIcalDateTime(raw: string): string {
  const compact = raw.replace(/[^0-9TZ]/g, "");
  const match = compact.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
  if (!match) return raw;
  const [, y, mo, d, h, mi, s] = match;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}Z`;
}

export function parseIcalSchedule(ical: string): ScheduleSegment[] {
  const events = ical.split("BEGIN:VEVENT").slice(1);
  const segments: ScheduleSegment[] = [];
  for (const chunk of events) {
    const event = chunk.split("END:VEVENT")[0] ?? "";
    const start = event.match(/DTSTART[^:]*:([^\r\n]+)/)?.[1]?.trim();
    const end = event.match(/DTEND[^:]*:([^\r\n]+)/)?.[1]?.trim();
    const summary = event.match(/SUMMARY[^:]*:([^\r\n]+)/)?.[1]?.trim() ?? TWITCH_LOGIN;
    const status = event.match(/STATUS[^:]*:([^\r\n]+)/)?.[1]?.trim().toUpperCase();
    if (!start) continue;
    segments.push({
      id: `ical-${start}`,
      startTime: parseIcalDateTime(start),
      endTime: end ? parseIcalDateTime(end) : parseIcalDateTime(start),
      title: summary.replace(/\\,/g, ","),
      canceled: status === "CANCELLED",
    });
  }
  return segments.slice(0, 12);
}

async function fetchIcalSchedule(userId: string): Promise<ScheduleSegment[]> {
  try {
    const res = await fetch(`https://api.twitch.tv/helix/schedule/icalendar?broadcaster_id=${userId}`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    return parseIcalSchedule(await res.text());
  } catch {
    return [];
  }
}
