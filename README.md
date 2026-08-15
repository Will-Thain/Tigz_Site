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

Add `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` from [dev.twitch.tv](https://dev.twitch.tv) for live status, schedule, VODs, and clips. YouTube RSS works without a key.

Set `NEXT_PUBLIC_SITE_HOST` to your real hostname (no `https://`) before embedding the Twitch player in production.
