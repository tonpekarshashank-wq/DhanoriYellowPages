# Color options

Three directions were explored. All ratios are WCAG 2.2 relative-luminance contrast, measured against the surface named. AA needs 4.5:1 for text, 3:1 for large text (24px+ / 18.7px bold), control boundaries, focus indicators and icons.

## Option A — Modern Civic Trust ★ Recommended (live in tokens)

Navy authority, a saffron accent, and a green that only ever means "checked".

| Role | Token | Hex | Contrast |
|---|---|---|---|
| Primary brand | `primary` | `#0B3D66` | white on it **11.2:1** · as text on white 11.2:1 |
| Secondary / accent | `accent` | `#C2410C` | on white **5.2:1** · on page 4.8:1 |
| Accent soft (active filter) | `accent-soft` / `on-accent-soft` | `#FFEDD5` / `#9A3412` | **6.4:1** |
| Semantic trust green | `trust` | `#15803D` | white on it **5.0:1** |
| Trust soft (Verified badge) | `trust-soft` / `on-trust-soft` | `#DCFCE7` / `#166534` | **6.5:1** |
| Emergency | `danger` | `#B91C1C` | white on it **6.5:1** |
| Emergency soft | `danger-soft` / `on-danger-soft` | `#FEE2E2` / `#991B1B` | **6.8:1** |
| Warning | `warning-soft` / `on-warning-soft` | `#FEF3C7` / `#854D0E` | **6.2:1** |
| Muted badge | `neutral-badge` / `on-neutral-badge` | `#EEF2F6` / `#334155` | **9.2:1** |
| Page background | `surface-page` | `#F5F7FA` | — |
| Card surface | `surface-card` | `#FFFFFF` | — |
| Border (decorative) | `border` | `#D5DCE4` | 1.4:1 — never the only edge of a control |
| Border (controls) | `border-strong` | `#7A8599` | **3.7:1** on card · 3.5:1 on page |
| Primary text | `ink` | `#0F172A` | **17.9:1** on card · 16.6:1 on page |
| Secondary meta text | `ink-muted` | `#475569` | **7.6:1** on card · 7.1:1 on page |

Dark theme values are in the Colors view; every text pair there is ≥ 6.4:1.

## Option B — Vibrant Neighborhood

Warm, bazaar-like: terracotta, teal and a cream ground.

| Role | Hex | Contrast |
|---|---|---|
| Primary brand (terracotta) | `#A33A1C` | white on it 6.6:1 |
| Secondary / accent (teal) | `#0E7A83` | on white 5.1:1 |
| Trust green | `#2E7D32` | white on it 5.1:1 |
| Trust soft / text | `#E3F2E4` / `#1B5E20` | 6.8:1 |
| Emergency | `#B42318` | white on it 6.6:1 |
| Warning soft / text | `#FFF4D6` / `#8A5A00` | 5.4:1 |
| Muted badge / text | `#F3ECE2` / `#44403C` | 8.8:1 |
| Page / card | `#FFFAF3` / `#FFFFFF` | — |
| Border / control border | `#E7DCCD` / `#8A7F74` | control 3.8:1 on page |
| Primary / meta text | `#1C1917` / `#57534E` | 17.5:1 / 7.6:1 on card |

## Option C — Clean Minimalist Tech

Monochrome ink with one electric blue; quiet and app-store-native.

| Role | Hex | Contrast |
|---|---|---|
| Primary brand (ink) | `#111827` | white on it 17.7:1 |
| Secondary / accent (blue) | `#2563EB` | on white 5.2:1 |
| Accent soft / text | `#DBEAFE` / `#1D4ED8` | 5.5:1 |
| Trust green | `#047857` | white on it 5.5:1 |
| Trust soft / text | `#D1FAE5` / `#065F46` | 6.8:1 |
| Emergency | `#DC2626` | white on it 4.8:1 |
| Warning soft / text | `#FEF3C7` / `#92400E` | 6.4:1 |
| Muted badge / text | `#F3F4F6` / `#374151` | 9.4:1 |
| Page / card | `#FFFFFF` / `#F9FAFB` | — |
| Border / control border | `#E5E7EB` / `#858C97` | control 3.4:1 |
| Primary / meta text | `#111827` / `#4B5563` | 17.0:1 / 7.6:1 |

## Why A

1. **Trust is the product.** Navy is the colour people already read as institutional — banks, government services, utilities. That borrowed credibility matters most when someone is letting a stranger into their home.
2. **Semantics stay clean.** In A the brand (navy), the accent (saffron), trust (green) and emergency (red) are four clearly separate meanings. In **B** the terracotta brand and emergency red have identical lightness (1.0:1 between them) — every primary button would look like an alarm. In **C** the blue accent is the colour people read as a link, and the near-black brand gives the product nothing to be remembered by.
3. **Sunlight.** A has the highest-contrast primary fill (11.2:1) and keeps meta text above 7:1, which is what survives glare.
4. **Colour-blind safe.** Navy vs saffron is a blue/orange pair, the most reliably distinguished contrast for red-green colour blindness. Green and saffron are close in lightness, so badges and chips always carry an icon and a label.
5. **Local fit.** Saffron and green read as warm and familiar in an Indian neighbourhood context while staying calm at accent scale.
