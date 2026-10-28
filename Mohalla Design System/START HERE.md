# Mohalla Design System — team package

Design system for the Dhanori Yellow Pages app (working name "Mohalla"; colour Option A "Modern Civic Trust").

Live, interactive version (owner must share it from the page's Share menu before others can open it):
https://claude.ai/artifact/Jd4ZmiyZGV4Dhd2rYQWBjV

## What's in this folder

| File / folder | What it is |
|---|---|
| `README.md` | Brand book — personality, voice, colour, type scale, iconography, component list |
| `01-color-options.md` | The 3 palette options with hex codes, WCAG contrast ratios, and why A was chosen |
| `02-layout.md` | Spacing scale, page frame, responsive feed grid, card container rules |
| `03-ux-patterns.md` | Result cards, Call/WhatsApp CTAs, verification badges, empty & error states |
| `04-developer-handoff.md` | CSS custom properties, tailwind.config.js, sample Listing Card |
| `tokens.json` | Source of truth for all design tokens (light + dark) |
| `tokens.css` | Tokens as CSS custom properties (hex values) for plain CSS |
| `tailwind.config.js` | Tailwind extension (uses the RGB-channel variables in `04-developer-handoff.md`) |
| `listing-card-tailwind.html` | Open in a browser — the Tailwind Listing Card working standalone |
| `components/` | `bundle.css` + one folder per component with guidelines (`README.md`) and a live preview (`preview.html`, open in a browser) |
| `screenshots/` | Every component preview in light and dark |
