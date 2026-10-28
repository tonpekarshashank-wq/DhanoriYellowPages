# UX patterns

## Result cards — scan in under two seconds

Hierarchy, in the order the eye should travel:

1. **Business name** — `title-card`, the heaviest thing on the card.
2. **Category + sub-locality** — neutral tags directly above the name ("Electrician · Baner"), so the name and its context read as one unit.
3. **Live status** — Open now / Closes soon / Closed, top-right.
4. **Verification badges** — max two, highest tier first.
5. **Rating · hours · distance** — one `meta` row; the rating number is `ink`, everything else `ink-muted`.
6. **Description** — 2 lines max.
7. **Call · WhatsApp** — always visible, always last.

Sort by *nearest verified, open now* by default. Never interleave ads; sponsored cards carry a neutral "Sponsored" tag and are capped at one per screen.

## Primary CTAs — Direct Call & WhatsApp

- Side by side, equal width, 8px apart, **48px minimum height**, 16px/600 labels with a 20px leading icon.
- Call (left) = `primary` navy; WhatsApp (right) = `trust` green. Both white labels (11.2:1 and 5.0:1).
- Call is a `tel:` link — no confirmation dialog. WhatsApp opens a pre-filled message that names the platform and the service.
- Log the tap (for "Replies in ~10 min" stats) but never gate it behind sign-in.
- Missing channel → swap to an outlined "Message" button; never a lone half-width button.

## Verification badges

- Three tiers: **Police Checked** (solid green, shield) › **Verified** (soft green, check) › **Community Approved** (soft navy, people).
- Each badge = icon + words. Tapping opens a sheet: what was checked, by whom, when, and how to report a problem.
- Green is reserved for platform-performed checks; social proof is navy. Badges are never sold.
- Expired checks drop the badge entirely rather than greying it out.

## Empty & error states

| Situation | Title | Body | Actions |
|---|---|---|---|
| No results in locality | "No tutors in Baner yet" | "We couldn't find a verified tutor here. These nearby areas have some:" + chips with counts | **Search within 5 km** · Recommend someone |
| Filters too narrow | "Nothing matches all 3 filters" | "Try removing 'Open now' — 6 tutors open later today." | **Clear filters** |
| Offline | "You're offline" | "Results will load when you're back online. Saved providers still work." | **Try again** |
| Server error | "Something went wrong on our side" | "It's not you. Give it a moment and try again." | **Try again** |

Copy rules: name the service and the place, say "yet", one sentence, never blame the user, always offer a next step.

## Focus, motion and input

- Focus: 2px `focus-ring` (saffron) outline with 2px offset on every focusable element; never removed.
- Motion: 150ms ease-out for press/hover, 200ms for sheets; respect `prefers-reduced-motion`.
- Inputs 16px+ so mobile browsers don't zoom; numeric keyboards for phone and PIN fields.
