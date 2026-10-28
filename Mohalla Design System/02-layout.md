# Layout & spacing

## Spacing scale (4px base, 8px rhythm)

| Token | px | rem | Typical use |
|---|---|---|---|
| `space-1` | 4 | 0.25 | icon ↔ label in badges |
| `space-2` | 8 | 0.5 | between badges; between Call and WhatsApp |
| `space-3` | 12 | 0.75 | card row gap; feed gap (mobile); chip padding-x |
| `space-4` | 16 | 1 | card padding; page gutter (mobile) |
| `space-5` | 20 | 1.25 | search padding-x; sheet padding |
| `space-6` | 24 | 1.5 | feed gap + gutter ≥ 768px |
| `space-8` | 32 | 2 | above section titles; gutter ≥ 1200px |
| `space-10` | 40 | 2.5 | empty-state padding |
| `space-12` | 48 | 3 | minimum touch target |
| `space-16` | 64 | 4 | sticky header height; empty-state icon |

## Page frame (mobile-first)

```
┌──────────────────────────────┐
│ App bar 56  (logo · locality ▾ · profile)   ← primary fill
├──────────────────────────────┤
│ H1  "Find help near you"      ← scrolls away
│ ( [search]  Electrician, tutor…  [All ▾] )  52px pill  ← sticks
│ [Baner x] [Balewadi] [Aundh] [Open now]  ← sticks, scrolls sideways
├──────────────────────────────┤
│ meta: 18 results in Baner · Sort: Nearest ▾
│ ┌ card ┐  gap 12
│ ┌ card ┐
│ …
└──────────────────────────────┘
```

- **Header & master search**: Google-style — one centred pill field (max 640px on desktop), the category dropdown inline inside the field on the right, sub-locality chips directly below. The current locality is detected and pre-selected but always visible and removable. Once the page scrolls, the field + chips stick with `surface-card` and `shadow-raised`.
- **Listing feed**: a CSS grid.

| Viewport | Columns | Gap | Side gutter |
|---|---|---|---|
| < 768px | 1 | `space-3` 12 | `space-4` 16 |
| 768–1199px (`bp-md`) | 2 | `space-6` 24 | `space-6` 24 |
| ≥ 1200px (`bp-lg`) | 3 | `space-6` 24 | `space-8` 32, max width `content-max` 1200 |

- Cards in one row share height (grid stretch); the action row is pinned to the card bottom (`margin-top:auto`) so buttons align across columns.
- Keep a `env(safe-area-inset-bottom)` pad under the last card; nothing floats over the CTAs on mobile (no FAB over results).

## Card container rules

| Property | Value |
|---|---|
| Surface | `surface-card` on `surface-page` |
| Edge | 1px `border` |
| Radius | `radius-lg` 16px (buttons inside: `radius-md` 10px; badges `radius-sm` 6px) |
| Padding | `space-4` 16px all sides |
| Internal rhythm | `space-3` 12px between rows; `space-1` between eyebrow and name |
| Elevation | **Flat** in the feed (`shadow-none`). `shadow-card` on hover/press or for a single featured card. `shadow-raised` is for floating layers only (sticky header, sheets, menus). |
| Dark theme | Shadows nearly vanish; the `border` token carries the edge. |
