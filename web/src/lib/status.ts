/**
 * Compute the live open/closed status of a listing from its weekly hours.
 * All times are IST (UTC+5:30). Handles overnight hours (e.g. 22:00–02:00).
 */

export type OpenStatus =
  | { state: "open"; closesAt: string }          // "Open now, closes 9 pm"
  | { state: "open_24h" }                         // "Open 24 hours"
  | { state: "closing_soon"; closesAt: string }   // "Closes soon, closes 10 pm"
  | { state: "closed"; opensAt: string | null };   // "Closed, opens 9 am" or "Closed"

export interface HourEntry {
  weekday: number;  // 0 = Sunday, 6 = Saturday
  opens: string;    // "HH:MM"
  closes: string;   // "HH:MM"
}

/** Parse "HH:MM" to total minutes from midnight */
function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Format minutes to "9 am" / "10 pm" style */
function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const period = h >= 12 ? "pm" : "am";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${hour12} ${period}` : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/** 30 minutes threshold for "closing soon" */
const CLOSING_SOON_MINUTES = 30;

export function getOpenStatus(
  hours: HourEntry[],
  is24x7: boolean,
  now?: Date
): OpenStatus {
  if (is24x7) {
    return { state: "open_24h" };
  }

  if (!hours || hours.length === 0) {
    return { state: "closed", opensAt: null };
  }

  // Get current IST time
  const date = now ?? new Date();
  const istOffset = 5.5 * 60; // IST is UTC+5:30
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  const istMinutes = (utcMinutes + istOffset) % (24 * 60);

  // IST weekday: adjust from UTC
  const utcDay = date.getUTCDay();
  const istDay = (utcMinutes + istOffset) >= 24 * 60
    ? (utcDay + 1) % 7
    : utcDay;

  // Check today's hours
  const todayHours = hours.filter((h) => h.weekday === istDay);
  for (const entry of todayHours) {
    const opens = parseTime(entry.opens);
    const closes = parseTime(entry.closes);

    if (closes > opens) {
      // Normal: opens 9:00, closes 21:00
      if (istMinutes >= opens && istMinutes < closes) {
        const remaining = closes - istMinutes;
        if (remaining <= CLOSING_SOON_MINUTES) {
          return { state: "closing_soon", closesAt: formatTime(closes) };
        }
        return { state: "open", closesAt: formatTime(closes) };
      }
    } else {
      // Overnight: opens 22:00, closes 02:00
      if (istMinutes >= opens) {
        // Still open from today's opening, will close tomorrow
        return { state: "open", closesAt: formatTime(closes) };
      }
    }
  }

  // Check if open from yesterday's overnight hours
  const yesterdayDay = (istDay + 6) % 7;
  const yesterdayHours = hours.filter((h) => h.weekday === yesterdayDay);
  for (const entry of yesterdayHours) {
    const opens = parseTime(entry.opens);
    const closes = parseTime(entry.closes);

    if (closes <= opens && istMinutes < closes) {
      // We're in the overnight window
      const remaining = closes - istMinutes;
      if (remaining <= CLOSING_SOON_MINUTES) {
        return { state: "closing_soon", closesAt: formatTime(closes) };
      }
      return { state: "open", closesAt: formatTime(closes) };
    }
  }

  // Closed — find next opening
  for (let offset = 0; offset < 7; offset++) {
    const checkDay = (istDay + offset) % 7;
    const dayHours = hours.filter((h) => h.weekday === checkDay);
    for (const entry of dayHours) {
      const opens = parseTime(entry.opens);
      if (offset === 0 && opens > istMinutes) {
        return { state: "closed", opensAt: formatTime(opens) };
      }
      if (offset > 0) {
        return { state: "closed", opensAt: formatTime(opens) };
      }
    }
  }

  return { state: "closed", opensAt: null };
}

/** Human-readable status label */
export function getStatusLabel(status: OpenStatus): string {
  switch (status.state) {
    case "open_24h":
      return "Open 24 hours";
    case "open":
      return `Open now`;
    case "closing_soon":
      return `Closes soon`;
    case "closed":
      return status.opensAt ? `Closed` : "Closed";
  }
}

/** Secondary text (hours detail) */
export function getStatusDetail(status: OpenStatus): string | null {
  switch (status.state) {
    case "open_24h":
      return null;
    case "open":
      return `Until ${status.closesAt}`;
    case "closing_soon":
      return `Closes at ${status.closesAt}`;
    case "closed":
      return status.opensAt ? `Opens at ${status.opensAt}` : null;
  }
}
