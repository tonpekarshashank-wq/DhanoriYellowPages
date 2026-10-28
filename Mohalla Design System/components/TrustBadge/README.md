# TrustBadge

Micro-badges that say what the platform has checked about a provider; always icon + words, never colour alone.

| Tier | Class | Look | Means |
|---|---|---|---|
| 1 · Police Checked | `mh-badge--police` | solid `trust`, `ink-inverse` text, shield-check icon | Background verification certificate on file, re-checked yearly |
| 2 · Verified | `mh-badge--verified` | `trust-soft` fill, `on-trust-soft` text, circle-check | Government ID + phone + address verified by the platform |
| 3 · Community Approved | `mh-badge--community` | `primary-soft` fill, `primary` text, people icon | 10+ reviews from verified neighbours, ≥ 4.0 average |

Rules

- Green is spent ONLY on platform verification (and Open-now / WhatsApp). Community Approved is social proof, not a check, so it is blue.
- Show the two highest tiers on a card, then `+N more`. On the profile, tapping any badge opens a sheet explaining the check and the date it was done.
- Style `badge` (12/16, 600, +0.02em), sentence case, 24px tall, `radius-sm`, 14px icon. The badge row has a 48px tap target when it opens a sheet.
- Utility tags share the shape: `--emergency` (`danger-soft`), `--neutral` for category / locality, `--more` outlined in `border-strong`.
- Never award a badge visually that the data doesn't back; never fake "Verified" for paid listings — paid placement gets a separate neutral "Sponsored" tag.
