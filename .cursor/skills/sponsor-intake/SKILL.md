---
name: sponsor-intake
description: Sponsorship page, media kit stats, and inbound application form. Use when editing /partners or apply form.
---

# Sponsor intake

There is no sponsor API. Partners are CMS/seed rows plus an inbound form.

- Public logos: `status = current` only.
- Form POST is server-side. Email `To: Tigz@mythictalent.com` via Resend, or `mailto:` fallback.
- Subject: `[Sponsor] {Company} — {campaign type} — {dates}`
- `Reply-To` is the submitter work email.
- Turnstile + honeypot. Never put Resend keys in the client.
- Media kit: Helix follower **total** + YouTube `statistics`. Do not display `view_count`. Average CCV is sampled while live or entered by hand.
- HubSpot only if Mythic Talent asks later.
