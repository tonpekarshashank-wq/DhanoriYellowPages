import { describe, it, expect } from "vitest";
import { getOpenStatus, type HourEntry } from "../src/lib/status";

/**
 * IST is UTC+5:30. We create dates in UTC and let the function convert.
 * To test "9 pm IST", that's 15:30 UTC.
 */
function istToUtc(hours: number, minutes: number): Date {
  // IST = UTC + 5:30
  const utcH = hours - 5;
  const utcM = minutes - 30;
  const d = new Date("2026-10-28T00:00:00Z");
  d.setUTCHours(utcH, utcM, 0, 0);
  // 2026-10-28 is a Wednesday (weekday 3)
  return d;
}

const monToSat9to9: HourEntry[] = [1, 2, 3, 4, 5, 6].map((day) => ({
  weekday: day,
  opens: "09:00",
  closes: "21:00",
}));

const overnightHours: HourEntry[] = [
  { weekday: 3, opens: "22:00", closes: "02:00" }, // Wed 10pm – Thu 2am
];

describe("getOpenStatus", () => {
  it("returns open_24h for 24/7 listings", () => {
    expect(getOpenStatus([], true).state).toBe("open_24h");
  });

  it("returns closed when no hours are provided", () => {
    expect(getOpenStatus([], false).state).toBe("closed");
  });

  it("returns open during business hours (T-07 equivalent)", () => {
    // Wednesday 2 pm IST
    const now = istToUtc(14, 0);
    const result = getOpenStatus(monToSat9to9, false, now);
    expect(result.state).toBe("open");
    if (result.state === "open") {
      expect(result.closesAt).toBe("9 pm");
    }
  });

  it("returns closed before opening", () => {
    // Wednesday 7 am IST
    const now = istToUtc(7, 0);
    const result = getOpenStatus(monToSat9to9, false, now);
    expect(result.state).toBe("closed");
  });

  it("returns closing_soon within 30 minutes of close", () => {
    // Wednesday 8:45 pm IST (15 min before 9 pm close)
    const now = istToUtc(20, 45);
    const result = getOpenStatus(monToSat9to9, false, now);
    expect(result.state).toBe("closing_soon");
  });

  it("returns closed on Sunday for Mon–Sat schedule", () => {
    // Sunday 2 pm IST → weekday 0
    // 2026-11-01 is a Sunday
    const now = new Date("2026-11-01T08:30:00Z"); // 2 pm IST
    const result = getOpenStatus(monToSat9to9, false, now);
    expect(result.state).toBe("closed");
  });

  it("handles overnight hours — open at 11 pm (T-07)", () => {
    // Wednesday 11 pm IST
    const now = istToUtc(23, 0);
    const result = getOpenStatus(overnightHours, false, now);
    expect(result.state).toBe("open");
  });

  it("handles overnight hours — still open at 1 am next day (T-07)", () => {
    // Thursday 1 am IST → still within Wed's overnight window
    // But we need the UTC date to fall on Thursday.
    // 1:00 IST = 19:30 UTC previous day (Wed)
    const now = new Date("2026-10-28T19:30:00Z"); // Wed 19:30 UTC = Thu 1:00 IST
    const result = getOpenStatus(overnightHours, false, now);
    expect(result.state).toBe("open");
  });
});
