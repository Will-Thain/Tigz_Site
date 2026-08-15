---
name: broadcast-hub
description: Twitch and YouTube integrations for the Tigz hub. Use when editing live status, schedule, VODs, clips, embeds, or /watch.
---

# Broadcast hub

## Twitch (server only)

- App access token from `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET`. Never `NEXT_PUBLIC_` for secrets.
- Live: `GET helix/streams?user_id=438062587`. EventSub `stream.online`/`offline` later (no Tigz OAuth required).
- Schedule: `GET helix/schedule` and/or iCal (iCal needs no auth).
- VODs: `GET helix/videos?type=archive`. Clips: `GET helix/clips` (sorted by views; filter with `started_at`).
- Ignore `Get Users.view_count` (invalid). Sample `viewer_count` while live for CCV.
- Embed: `https://player.twitch.tv/?channel=tigz&parent={NEXT_PUBLIC_SITE_HOST}`. Hostname only. Min 400×300. Do not cover the iframe. Also pass `www` and preview hosts if needed.

If credentials are missing, render offline UI and still link to https://www.twitch.tv/tigz.

## YouTube

- RSS first: `https://www.youtube.com/feeds/videos.xml?channel_id=UCKvHlvMpX7HMZ70w5Nyyz_w`
- Data API key optional for subscriber count. Do not use `search.list`.
- Never `Referrer-Policy: no-referrer` (YouTube error 153).
