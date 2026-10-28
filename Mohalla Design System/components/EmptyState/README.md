# EmptyState

What a person sees when a locality has no matching providers, or the feed can't load — always with a next step.

**No results in this locality** — circle icon on `primary-soft`, title `title-section`, one sentence of body in `ink-muted`, then *nearby localities that do have results* as chips with counts, then actions: primary "Search within 5 km" and ghost "Recommend someone" (turns the dead-end into a community contribution).

**Error / offline** — same layout, icon on `danger-soft`, `role="alert"`, one recovery action ("Try again").

Micro-copy rules

- Name the thing and the place: "No tutors in Baner yet" — not "No results found".
- "Yet" keeps it hopeful; never blame the user ("Your search returned nothing").
- One sentence of help, ≤ 90 characters. Then actions.
- Offline: say what still works ("Saved providers still work").
- Filters caused it? Offer "Clear 2 filters" as the primary action instead of widening the radius.
