# Mohalla

*Trusted help, two lanes away.* A mobile-first design system for a hyper-local service directory and neighbourhood community: find a verified electrician, tutor or tiffin service in your sub-locality and call or WhatsApp them in one tap.

> "Mohalla" is a working name for the product. Rename it in the index and here; the tokens and components don't depend on it.

## Brand personality

| Attribute | What it means in the UI | What we avoid |
|---|---|---|
| **Absolute trust** | Verification is visible, specific and explainable ("Police Checked · Mar 2026"). One colour — trust green — is spent only on checks the platform actually performed. | Vague "Top pick" labels, paid placement that looks like verification, stock-photo smiles. |
| **Hyper-local utility** | The sub-locality is always on screen: in the search chips, on every card, in empty-state copy. Search → call in two taps. | Clutter, carousels, ads between results, city-level vagueness. |
| **Accessible & high contrast** | Body text ≥ 7:1, meta text ≥ 7:1, 48px targets, 16px body minimum. Designed for a phone held outdoors at noon. | Light-grey text, thin weights, colour-only status. |

**Voice**: a helpful neighbour, not a marketplace. Plain, short, warm. Use the person's locality ("in Baner"), the provider's own trade words ("MCB repair", "tiffin"), and numbers over adjectives ("Replies in ~10 min", not "Super responsive"). Sentence case everywhere. English UI with Marathi/Hindi provider content rendered in Noto Sans Devanagari via the fallback stack.

## Visual foundations

**Colour — Option A "Modern Civic Trust" (adopted).** Civic navy `primary` carries the brand and every primary action; saffron `accent` marks focus and active filters; `trust` green is reserved for verification, Open-now and WhatsApp; `danger` for emergency only. Neutral surfaces are cool and quiet so the three signals stand out. Full token list with contrast ratios is in the Colors view; the comparison with Options B and C is in **Color options**.

- Text on `surface-card`: `ink` 17.9:1, `ink-muted` 7.6:1 (light) — AAA, chosen for sunlight.
- Fills with text: `primary` 11.2:1, `trust` 5.0:1, `danger` 6.5:1, `accent` 5.2:1 against white.
- Control boundaries use `border-strong` (3.7:1); `border` is decorative only.
- Trust green and saffron are close in lightness, so badges and chips always carry an icon or label — never colour alone.

**Typography.** *Plus Jakarta Sans* (display: H1–H3, 700–800) gives a friendly, open civic voice; *Inter* (UI and body, 400–600) has a tall x-height and clear numerals for phone numbers, ratings and hours. Both are open source (SIL OFL) on Google Fonts; *Noto Sans Devanagari* is the fallback for Marathi/Hindi. Scale (mobile → ≥768px):

| Role | Style token | Mobile | Desktop | Weight | Tracking |
|---|---|---|---|---|---|
| Page title / search header (H1) | `title-page` | 28 / 34 | 32 / 40 | 800 | −0.02em |
| Section title (H2) | `title-section` | 20 / 28 | 24 / 32 | 700 | −0.01em |
| Card title / provider name (H3) | `title-card` | 18 / 24 | 18 / 24 | 700 | −0.005em |
| Body & description | `body` | 16 / 24 | 16 / 24 | 400 | 0 |
| Caption / meta (address, hours, phone) | `meta` | 14 / 20 | 14 / 20 | 500 | 0 |
| Micro-badge & status tag | `badge` | 12 / 16 | 12 / 16 | 600 | +0.02em |
| Button label | `button` | 16 / 24 | 16 / 24 | 600 | 0 |

In rem (16px root): 1.75 / 1.25 / 1.125 / 1 / 0.875 / 0.75. Nothing smaller than 12px ships.

**Spacing & shape.** 4px base, 8px rhythm (`space-1` … `space-16`). Card padding `space-4`, feed gap `space-3` → `space-6`. Radii: `radius-sm` 6 (badges), `radius-md` 10 (buttons, inputs), `radius-lg` 16 (cards), `radius-full` (search pill, chips). **Flat first**: cards are a 1px `border` on `surface-card`; `shadow-card` only on hover/press, `shadow-raised` only for the stuck search header, sheets and menus.

## Iconography

Outline icons on a 24px grid, 2px stroke, round caps and joins (the Lucide set, ISC licence, matches this exactly). 20px (`icon-md`) in buttons and search, 16px (`icon-sm`) in meta rows, 14px inside badges. Icons inherit `currentColor` from their text token; the rating star is the one filled icon (`rating-star`). Core set: phone, chat bubble (WhatsApp action — generic bubble, not the messenger's logo), circle-check (Verified), shield-check (Police Checked), users (Community Approved), map-pin (locality), clock (hours), alert-triangle (emergency), search, chevron-down, x. No emoji in UI.

## Components

| Component | Group | Summary |
|---|---|---|
| ListingCard | Listings | Name → trust → meta → actions; flat card |
| ActionButtons | Actions | Call + WhatsApp, equal halves, 48px |
| TrustBadge | Trust & status | Police Checked › Verified › Community Approved, plus utility tags |
| StatusTag | Trust & status | Open now / Closes soon / Closed |
| SearchHeader | Search | Centred pill search, inline category, locality chips |
| EmptyState | Feedback | No results in this locality, offline/error |

Previews are plain HTML + `components/bundle.css` (classes prefixed `mh-`); they work with any framework. The Tailwind mapping and a copy-paste card are in **Developer handoff**.
