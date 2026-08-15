---
name: tigz-testing
description: Vitest conventions for the Tigz hub. Use when adding tests, configuring Vitest, or after a feature agent finishes.
---

# Testing

Stack: **Vitest** (node). Colocate tests as `src/**/*.test.ts`. Run `npm test` (`vitest run`).

## When to add tests

After any change to `src/lib`, `src/app/api`, kit/poll/sponsor stores, or EventSub. Do not wait to be asked.

## Rules

- Mock `fetch`. Never hit Twitch, YouTube, json.tarkov.dev, or Tracker from CI.
- Never import unofficial Tarkov player APIs.
- Prefer testing exported functions over rendering full pages.
- One describe per module. Names say the rule, not the method.

## Do not add

Playwright, Cypress, or extra assertion libraries unless the user asks. No snapshot tests of whole pages.
