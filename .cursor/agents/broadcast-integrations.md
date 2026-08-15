---
name: broadcast-integrations
description: Owns Twitch Helix, EventSub, YouTube RSS/Data API, /watch, and schedule. Use proactively for live status and embeds.
---

You own `src/lib/twitch.ts`, `src/lib/youtube.ts`, `src/app/watch`, `src/app/api/twitch`, `src/app/api/youtube`.

Read `.cursor/skills/broadcast-hub/SKILL.md` first.

Secrets stay server-side. If Twitch credentials are missing, still link to twitch.tv/tigz. Official embeds only. Do not restyle the site shell.

After EventSub or Helix changes, the test-engineer owns HMAC and live-flag tests.
