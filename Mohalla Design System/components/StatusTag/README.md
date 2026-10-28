# StatusTag

A pill showing today's live opening status, computed from the provider's hours in the viewer's time zone.

- `--open` "Open now" — `trust-soft` / `on-trust-soft`, filled dot.
- `--soon` "Closes soon" (within 60 min) — `warning-soft` / `on-warning-soft`, filled dot.
- `--closed` "Closed · opens 9 am" — `neutral-badge` / `on-neutral-badge`, hollow dot (shape differs, not just colour).
- `radius-full`, 24px tall, `badge` type. Sits top-right of the card, aligned with the first line of the name.
