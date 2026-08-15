---
name: tarkov-data
description: Tarkov kit, quest, and catalog rules for the Tigz hub. Use when touching /kit, /progress, json.tarkov.dev, or TarkovTracker.
---

# Tarkov data

## Allowed

- Item/quest **catalog** from `json.tarkov.dev` (no player identity).
- Current kit: admin-published slots + item IDs in our DB/seed. Hydrate names/icons from the catalog.
- Historic kits: snapshot our publishes only.
- Quests/hideout: optional TarkovTracker.org **GP read** token (`PVP_`/`PVE_`/`SZN_`) or public share. `User-Agent` required. Never a write token.
- Stats: admin-entered fields, or a link out to tarkov.dev/players.

## Forbidden (never as a fallback)

- `prod.escapefromtarkov.com` / launcher credentials
- `eft-api.tech` and unofficial profile proxies
- Ingesting `players.tarkov.dev` profile JSON
- Automating `player.tarkov.dev` (Turnstile)
- TarkovMonitor, log readers, DMA, overlays, anything on the game PC

Catalog fetch lives in `src/lib/tarkov.ts`. Keep comments that restate this blocklist.
