# ListingCard

The result card for one local provider: name first, trust signals second, the two quick actions last.

**Reading order (fixed, top to bottom)**

1. Eyebrow row — category tag + sub-locality tag (`mh-badge--neutral`, pin icon on the locality). Optional `24×7 Emergency` tag (`danger-soft`) goes last in this row.
2. Business name — `title-card` (18/24, 700, display face), max 2 lines. Live status pill (`StatusTag`) top-right, never wraps under the name.
3. Trust badges — at most 2 shown, highest tier first; overflow collapses to `+N more`.
4. Meta row — ★ rating (number in `ink`, count in `ink-muted`) · hours · distance, `meta` style (14/20, 500).
5. Description — `body`, clamped to 2 lines.
6. Actions — `ActionButtons`, always the last row, always visible without expanding.

**Container rules**: `surface-card`, 1px `border`, `radius-lg`, padding `space-4`, row gap `space-3`, `shadow-none` in the feed (flat), `shadow-card` on hover/press only. The whole card opens the profile, except the two buttons which have their own targets.

**The consumer provides** name, category, sub-locality, badge tiers, rating + count, today's hours state, distance, a one-line description and a `tel:` / WhatsApp deep link.

Don't: put a photo above the name on mobile (it pushes CTAs below the fold), use colour alone for status, or show more than one emergency tag.
