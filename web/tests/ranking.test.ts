import { describe, it, expect } from "vitest";
import { rankListings, type RankableItem } from "../src/lib/ranking";

function makeItem(overrides: Partial<RankableItem> & { id: number }): RankableItem {
  return {
    paidPlan: "none",
    planEndDate: null,
    isEmergencyCategory: false,
    openStatus: "open",
    isSubLocalityMatch: false,
    servesSubLocality: false,
    isVerified: true,
    textRank: 0.5,
    ...overrides,
  };
}

describe("rankListings", () => {
  it("ranks promoted slots above organic (T-12)", () => {
    const items = [
      makeItem({ id: 1, paidPlan: "none" }),
      makeItem({ id: 2, paidPlan: "promoted_slot", planEndDate: new Date("2027-01-01") }),
    ];
    const ranked = rankListings(items);
    expect(ranked[0].id).toBe(2);
    expect(ranked[0].isPromoted).toBe(true);
  });

  it("ranks paid boost above organic but below promoted (T-12)", () => {
    const items = [
      makeItem({ id: 1 }),
      makeItem({ id: 2, paidPlan: "ranking_boost", planEndDate: new Date("2027-01-01") }),
      makeItem({ id: 3, paidPlan: "promoted_slot", planEndDate: new Date("2027-01-01") }),
    ];
    const ranked = rankListings(items);
    expect(ranked[0].id).toBe(3); // promoted
    expect(ranked[1].id).toBe(2); // boost
    expect(ranked[2].id).toBe(1); // organic
  });

  it("never boosts Emergency & Utilities (T-09)", () => {
    const items = [
      makeItem({ id: 1, isEmergencyCategory: true, paidPlan: "promoted_slot", planEndDate: new Date("2027-01-01") }),
      makeItem({ id: 2, isEmergencyCategory: true }),
    ];
    const ranked = rankListings(items);
    // Neither should be promoted
    expect(ranked.every((r) => !r.isPromoted)).toBe(true);
  });

  it("open listings rank above closed listings (T-01)", () => {
    const items = [
      makeItem({ id: 1, openStatus: "closed" }),
      makeItem({ id: 2, openStatus: "open" }),
    ];
    const ranked = rankListings(items);
    expect(ranked[0].id).toBe(2);
  });

  it("closed paid listing doesn't rank above open unpaid in 'open now' query (T-01)", () => {
    const items = [
      makeItem({ id: 1, openStatus: "open", paidPlan: "none" }),
      makeItem({ id: 2, openStatus: "closed", paidPlan: "promoted_slot", planEndDate: new Date("2027-01-01") }),
    ];
    const ranked = rankListings(items, true);
    // Open unpaid should be before closed paid
    const openIdx = ranked.findIndex((r) => r.id === 1);
    const closedIdx = ranked.findIndex((r) => r.id === 2);
    expect(openIdx).toBeLessThan(closedIdx);
  });

  it("verified listings rank above community-submitted", () => {
    const items = [
      makeItem({ id: 1, isVerified: false }),
      makeItem({ id: 2, isVerified: true }),
    ];
    const ranked = rankListings(items);
    expect(ranked[0].id).toBe(2);
  });

  it("sub-locality match ranks higher", () => {
    const items = [
      makeItem({ id: 1, isSubLocalityMatch: false }),
      makeItem({ id: 2, isSubLocalityMatch: true }),
    ];
    const ranked = rankListings(items);
    expect(ranked[0].id).toBe(2);
  });
});
