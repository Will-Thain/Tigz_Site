# Tigz hub

Next.js 15 (App Router) fan hub for a Twitch streamer. See `README.md` for the full feature and env-var reference.

## Cursor Cloud specific instructions

- Node 20+ is required (`.nvmrc` pins `20`; `engines` allows `>=20`). Standard commands live in `package.json` scripts and `README.md`; use those rather than duplicating them here.
- The app runs fully on seed data with **no secrets or database**. `DATABASE_URL` is optional — when unset, polls/applications/published kits persist to a JSON file store at `data/runtime.json` (gitignored). You do not need `.env.local` to run, lint, test, or exercise core flows.
- Twitch/YouTube/Turnstile/Resend integrations degrade gracefully when their env vars are absent: live status shows offline, embeds use `localhost` as the Twitch `parent`, Turnstile bot-checks are skipped, and the sponsor form falls back to `mailto:`. Missing these does not block development.
- The dev server is defined as the `dev` terminal in `.cursor/environment.json` (`npm run dev`, Turbopack, http://localhost:3000). If it is not already running, start it there; do not add a second instance on port 3000.
- Poll voting works anonymously (no Twitch OIDC and no Turnstile needed locally); "Sign in with Twitch" only appears when `AUTH_TWITCH_*` is configured. This makes `/polls` the easiest end-to-end smoke check.
- `/admin` is open in development without `ADMIN_PASSWORD`; in production it requires `ADMIN_PASSWORD` and/or `ADMIN_TWITCH_IDS`.
- `npm run lint` uses the deprecated `next lint`; a pre-existing unused-var warning in `src/lib/admin.test.ts` is expected and not a regression.
