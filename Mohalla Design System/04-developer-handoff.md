# Developer handoff

Three pieces: the CSS custom properties (source of theming), the `tailwind.config.js` extension that maps Tailwind utilities onto them, and a copy-paste Listing Card.

## 1 · CSS custom properties

Colours are stored as space-separated RGB channels so Tailwind's opacity modifiers (`bg-primary/10`) work. Dark mode switches on `.dark` or `[data-theme="dark"]` on `<html>`.

```css
/* tokens.css — Mohalla, Option A "Modern Civic Trust" */
:root {
  --surface-page: 245 247 250;   /* #F5F7FA */
  --surface-card: 255 255 255;   /* #FFFFFF */
  --surface-sunken: 238 242 246; /* #EEF2F6 */
  --border: 213 220 228;         /* #D5DCE4 */
  --border-strong: 122 133 153;  /* #7A8599 */
  --ink: 15 23 42;               /* #0F172A */
  --ink-muted: 71 85 105;        /* #475569 */
  --ink-inverse: 255 255 255;    /* #FFFFFF */
  --primary: 11 61 102;          /* #0B3D66 */
  --primary-hover: 8 47 79;      /* #082F4F */
  --primary-soft: 232 240 248;   /* #E8F0F8 */
  --accent: 194 65 12;           /* #C2410C */
  --accent-soft: 255 237 213;    /* #FFEDD5 */
  --on-accent-soft: 154 52 18;   /* #9A3412 */
  --trust: 21 128 61;            /* #15803D */
  --trust-hover: 22 101 52;      /* #166534 */
  --trust-soft: 220 252 231;     /* #DCFCE7 */
  --on-trust-soft: 22 101 52;    /* #166534 */
  --danger: 185 28 28;           /* #B91C1C */
  --danger-soft: 254 226 226;    /* #FEE2E2 */
  --on-danger-soft: 153 27 27;   /* #991B1B */
  --warning-soft: 254 243 199;   /* #FEF3C7 */
  --on-warning-soft: 133 77 14;  /* #854D0E */
  --neutral-badge: 238 242 246;  /* #EEF2F6 */
  --on-neutral-badge: 51 65 85;  /* #334155 */
  --rating-star: 180 83 9;       /* #B45309 */
}
.dark, [data-theme="dark"] {
  --surface-page: 13 21 32;      --surface-card: 21 33 49;     --surface-sunken: 10 17 26;
  --border: 36 52 74;            --border-strong: 102 120 143;
  --ink: 230 237 245;            --ink-muted: 159 176 195;     --ink-inverse: 13 21 32;
  --primary: 124 184 238;        --primary-hover: 163 205 243; --primary-soft: 18 48 77;
  --accent: 251 146 60;          --accent-soft: 58 29 12;      --on-accent-soft: 253 186 116;
  --trust: 74 222 128;           --trust-hover: 134 239 172;   --trust-soft: 16 41 27;   --on-trust-soft: 134 239 172;
  --danger: 248 113 113;         --danger-soft: 59 20 20;      --on-danger-soft: 252 165 165;
  --warning-soft: 51 40 11;      --on-warning-soft: 253 230 138;
  --neutral-badge: 30 44 63;     --on-neutral-badge: 197 209 222;
  --rating-star: 251 191 36;
}
```

Fonts (in `<head>`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=Noto+Sans+Devanagari:wght@400;600&display=swap" rel="stylesheet">
```

## 2 · tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1200px' },
    extend: {
      colors: {
        surface: { page: c('surface-page'), card: c('surface-card'), sunken: c('surface-sunken') },
        line: { DEFAULT: c('border'), strong: c('border-strong') },
        ink: { DEFAULT: c('ink'), muted: c('ink-muted'), inverse: c('ink-inverse') },
        primary: { DEFAULT: c('primary'), hover: c('primary-hover'), soft: c('primary-soft') },
        accent: { DEFAULT: c('accent'), soft: c('accent-soft'), 'on-soft': c('on-accent-soft') },
        trust: { DEFAULT: c('trust'), hover: c('trust-hover'), soft: c('trust-soft'), 'on-soft': c('on-trust-soft') },
        danger: { DEFAULT: c('danger'), soft: c('danger-soft'), 'on-soft': c('on-danger-soft') },
        warning: { soft: c('warning-soft'), 'on-soft': c('on-warning-soft') },
        neutral: { badge: c('neutral-badge'), 'on-badge': c('on-neutral-badge') },
        star: c('rating-star'),
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        sans: ['Inter', '"Noto Sans Devanagari"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // [size, { lineHeight, letterSpacing, fontWeight }]
        'title-page':    ['1.75rem',  { lineHeight: '2.125rem', letterSpacing: '-0.02em',  fontWeight: '800' }], // 28/34
        'title-page-lg': ['2rem',     { lineHeight: '2.5rem',   letterSpacing: '-0.02em',  fontWeight: '800' }], // 32/40
        'title-section': ['1.25rem',  { lineHeight: '1.75rem',  letterSpacing: '-0.01em',  fontWeight: '700' }], // 20/28
        'title-section-lg': ['1.5rem', { lineHeight: '2rem',    letterSpacing: '-0.01em',  fontWeight: '700' }], // 24/32
        'title-card':    ['1.125rem', { lineHeight: '1.5rem',   letterSpacing: '-0.005em', fontWeight: '700' }], // 18/24
        body:            ['1rem',     { lineHeight: '1.5rem',   fontWeight: '400' }],                            // 16/24
        meta:            ['0.875rem', { lineHeight: '1.25rem',  fontWeight: '500' }],                            // 14/20
        badge:           ['0.75rem',  { lineHeight: '1rem',     letterSpacing: '0.02em',   fontWeight: '600' }], // 12/16
      },
      spacing: {
        // Tailwind's default scale is already 4px-based (1 = 4px). These add semantic aliases.
        'tap': '48px',          // min touch target
        'search': '52px',       // master search height
        'card': '16px',         // card padding
        'feed': '12px',         // feed gap, mobile
        'feed-lg': '24px',      // feed gap, ≥ md
      },
      minHeight: { tap: '48px' },
      minWidth: { tap: '48px' },
      maxWidth: { content: '1200px', search: '640px' },
      borderRadius: { badge: '6px', control: '10px', card: '16px' },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.06), 0 1px 3px rgb(15 23 42 / 0.10)',
        raised: '0 4px 12px rgb(15 23 42 / 0.12), 0 1px 3px rgb(15 23 42 / 0.08)',
      },
      ringColor: { DEFAULT: c('accent') },
    },
  },
  plugins: [],
};
```

## 3 · Listing Card (HTML + Tailwind)

```html
<article class="flex flex-col gap-3 rounded-card border border-line bg-surface-card p-card font-sans text-ink hover:shadow-card"
         aria-labelledby="p-123-name">
  <!-- Top: tags + name | live status -->
  <div class="flex items-start justify-between gap-3">
    <div class="min-w-0">
      <div class="mb-1 flex flex-wrap gap-2">
        <span class="inline-flex min-h-6 items-center rounded-badge bg-neutral-badge px-2 text-badge font-medium tracking-normal text-neutral-on-badge">Electrician</span>
        <span class="inline-flex min-h-6 items-center gap-1 rounded-badge bg-neutral-badge px-2 text-badge font-medium tracking-normal text-neutral-on-badge">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          Baner
        </span>
      </div>
      <h3 id="p-123-name" class="line-clamp-2 font-display text-title-card">Sai Krupa Electricals</h3>
    </div>
    <span class="inline-flex min-h-6 shrink-0 items-center gap-1.5 rounded-full bg-trust-soft px-2 text-badge text-trust-on-soft">
      <span class="h-2 w-2 rounded-full bg-current" aria-hidden="true"></span>Open now
    </span>
  </div>

  <!-- Verification badges (max 2) -->
  <div class="flex flex-wrap gap-2">
    <span class="inline-flex min-h-6 items-center gap-1 rounded-badge bg-trust px-2 text-badge text-ink-inverse">
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
      Police Checked
    </span>
    <span class="inline-flex min-h-6 items-center gap-1 rounded-badge bg-trust-soft px-2 text-badge text-trust-on-soft">
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
      Verified
    </span>
  </div>

  <!-- Meta: rating · hours · distance -->
  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-ink-muted">
    <span class="inline-flex items-center gap-1 font-semibold text-ink">
      <svg class="h-4 w-4 fill-star" viewBox="0 0 24 24" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      4.8 <span class="font-medium text-ink-muted">(126 reviews)</span>
    </span>
    <span class="inline-flex items-center gap-1">
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      Until 9 pm
    </span>
    <span>1.2 km</span>
  </div>

  <p class="line-clamp-2 text-body">Wiring, inverter installation and MCB repairs. Same-day visits across Baner and Balewadi.</p>

  <!-- Quick actions: 48px, equal halves -->
  <div class="mt-auto grid grid-cols-2 gap-2">
    <a href="tel:+91XXXXXXXXXX"
       class="inline-flex min-h-tap items-center justify-center gap-2 rounded-control bg-primary px-4 text-body font-semibold text-ink-inverse hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      Call
    </a>
    <a href="https://wa.me/91XXXXXXXXXX?text=Hi%2C%20I%20found%20you%20on%20Mohalla"
       class="inline-flex min-h-tap items-center justify-center gap-2 rounded-control bg-trust px-4 text-body font-semibold text-ink-inverse hover:bg-trust-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
      WhatsApp
    </a>
  </div>
</article>
```

Feed wrapper: `<div class="mx-auto grid max-w-content grid-cols-1 gap-feed p-4 md:grid-cols-2 md:gap-feed-lg md:p-6 lg:grid-cols-3 lg:p-8">…cards…</div>`

Notes: `line-clamp-*` is built into Tailwind ≥ 3.3. The same classes appear without Tailwind as `mh-*` in `components/bundle.css`.
