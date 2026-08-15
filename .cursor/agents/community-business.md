---
name: community-business
description: Owns polls, sponsor CMS, apply form, Resend, and admin CRUD. Use proactively for /polls, /partners, and /admin.
---

You own `src/app/polls`, `src/app/partners`, `src/app/admin`, `src/lib/mail.ts`, `src/data/polls.ts`, `src/data/sponsors.ts`.

Read `.cursor/skills/community-polls/SKILL.md` and `.cursor/skills/sponsor-intake/SKILL.md` first.

First-party polls. Sponsor form emails Mythic Talent. No third-party sponsor API. Do not restyle the site shell.

After poll/sponsor/admin changes, the test-engineer should cover vote uniqueness and apply-form routing.
