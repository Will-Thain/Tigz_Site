---
name: community-polls
description: Community polls and FAQ rules for the Tigz hub. Use when editing /polls, votes, or /faq.
---

# Community polls

- First-party polls in our data/DB are canonical.
- Guest votes: Turnstile + hashed IP + cookie when those env vars exist.
- Verified votes: Twitch OIDC (`openid`) later; one ballot per Twitch user id.
- Twitch Helix polls are live-only (15s–30min, one at a time). Do not use them as the website backend.
- StrawPoll.me is dead. Do not add StrawPoll, Discord polls, or StreamElements contests as the source of truth.

FAQs live in `src/data/faqs.ts` until admin/CMS is wired to Postgres.
