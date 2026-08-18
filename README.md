# Tigz hub

Fan hub for [twitch.tv/tigz](https://www.twitch.tv/tigz). Sends viewers to the live stream, then answers FAQs, kit, quest notes, polls, and inbound sponsorships.

## Zero ban-risk

This site never talks to Battlestate backends, never reads the game client, and never uses unofficial EFT profile APIs. Kit and stats are published here. Quests may later read a TarkovTracker.org **read-only** token.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

```bash
npm test
```

## Env

Copy `.env.example`. Nothing secret belongs in `NEXT_PUBLIC_*`.

| Variable | Needed for |
|---|---|
| `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` | Live status, schedule, VODs, clips, follower count |
| `NEXT_PUBLIC_SITE_HOST` | Twitch embed `parent` (hostname only, no `https://`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, EventSub callback |
| `TWITCH_EVENTSUB_SECRET` | Instant live/offline webhook (10–100 chars) |
| `AUTH_SECRET` | Twitch OIDC sessions for verified poll votes and admin allowlist |
| `ADMIN_PASSWORD` or `ADMIN_TWITCH_IDS` | Production `/admin` (dev without a password stays open) |
| `TURNSTILE_*` | Optional poll and sponsor-form bot check. Both keys or neither |
| `TARKOVTRACKER_TOKEN` | Optional GP **read** token (`PVP_` / `PVE_` / `SZN_`) |
| `DATABASE_URL` | Optional Postgres. File store at `data/runtime.json` otherwise |
| `RESEND_API_KEY` | Optional. Apply form still `mailto:`s Mythic Talent without it |

Twitch app redirect: `https://<host>/api/auth/callback/twitch`.

EventSub webhook: `https://<host>/api/twitch/eventsub`. After deploy, open `/admin` and **Subscribe webhooks**, or:

```bash
curl -X POST https://<host>/api/admin/eventsub
```

(while logged into admin), or `GET /api/twitch/eventsub?setup=1` with `Authorization: Bearer $ADMIN_PASSWORD`.

YouTube RSS works without `YOUTUBE_API_KEY`.

## Postgres

```bash
npm run db:generate
npm run db:migrate
```

The site still runs on seed data plus `data/runtime.json` when `DATABASE_URL` is empty.

## Deploy (Vercel)

Import [Will-Thain/Tigz_Site](https://github.com/Will-Thain/Tigz_Site). Framework is Next.js (`vercel.json`).

Set at least:

- `NEXT_PUBLIC_SITE_HOST` — production hostname, no `https://` (Twitch embed `parent`)
- `NEXT_PUBLIC_SITE_URL` — `https://<that-host>`
- `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET`
- `TWITCH_EVENTSUB_SECRET`
- `AUTH_SECRET`
- `ADMIN_PASSWORD` and/or `ADMIN_TWITCH_IDS`

In the Twitch developer console, add OAuth redirect `https://<host>/api/auth/callback/twitch`. After the first deploy, open `/admin` and subscribe EventSub.

Optional: `DATABASE_URL` then `npm run db:migrate`, Turnstile pair, `TARKOVTRACKER_TOKEN`, `RESEND_API_KEY`.

The seed `/kit` card is a catalog example for the character plate. It is not a Tigz loadout. Publish at `/admin/kit` to replace it.

