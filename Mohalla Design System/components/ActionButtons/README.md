# ActionButtons

Side-by-side Direct Call and WhatsApp quick actions — the primary conversion point on every card and profile.

- Two equal columns (`grid 1fr 1fr`), gap `space-2`, height `tap-min` (48px), `radius-md`, label `button` style (16px/600) with a 20px icon on the left.
- **Call** = `primary` fill, `ink-inverse` label. Rendered as `<a href="tel:…">`. Always the LEFT button (the thumb-reach default, and it works without any app).
- **WhatsApp** = `trust` fill, `ink-inverse` label. A deep link (`https://wa.me/<number>?text=…` pre-filled with "Hi, I found you on Mohalla — "). We use our own trust green, not the messenger's brand green, which fails 4.5:1 with white text. Use a generic chat-bubble icon, not the messenger's logo, unless your brand licence allows it.
- If a provider has no WhatsApp, the right slot becomes a `mh-btn--secondary` "Message" (in-app) — never leave a single half-width button.
- On a profile page use a single full-width Call button that shows the masked number.
- Pressed states: `primary-hover`, `trust-hover`. Focus: 2px `focus-ring` + 2px offset.
