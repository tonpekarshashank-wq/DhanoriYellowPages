# SearchHeader

The master search: one centred pill field with an inline category dropdown, and a scrollable row of sub-locality chips beneath.

- Field: `search-height` 52px, `radius-full`, `surface-card`, 1px inset `border-strong`; focus becomes 2px `focus-ring`. Placeholder names real examples ("Electrician, tutor, tiffin…"). Input text is 16px so iOS doesn't zoom.
- Category: a 44px pill inside the field on the right, `surface-sunken`, opens a bottom sheet on mobile and a listbox on desktop.
- Sub-locality chips: horizontal scroll, the detected locality first and pre-selected. Active chip = `accent-soft` fill + 2px `accent` ring + clear (×) icon; inactive = outlined `border-strong`. Chips are 36px visually with a 48px hit area. A quick "Open now" filter chip sits at the end.
- Result summary line ("18 results for plumbing in Baner") uses `meta`; the matched query is wrapped in `mh-mark` (`accent-soft` + accent underline).
- Scroll behaviour: the title scrolls away; the field and chips stick, gaining `surface-card` + `shadow-raised` (`mh-header--stuck`).
- Desktop ≥ 768px: the field is max 640px and centred; chips wrap to two rows instead of scrolling.
