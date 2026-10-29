/**
 * Listing ranking logic — spec NFR-09
 *
 * Order:
 *  1. Promoted slots (paid_plan = promoted_slot, valid dates, matching category/locality)
 *  2. Paid-boost listings (paid_plan = ranking_boost, valid dates)
 *  3. Organic listings, sorted by:
 *     a. Text match relevance (from Postgres full-text rank)
 *     b. Open now (open > closing_soon > closed)
 *     c. Sub-locality match (exact > serves > other)
 *     d. Verified > Community-submitted
 *
 * Rules:
 *  - Emergency & Utilities results are never boosted (isEmergency on category).
 *  - A closed paid listing never ranks above an open unpaid one in an "open now" query.
 *  - Every paid result carries a "Promoted" label.
 */

export type ListingStatus = "open" | "closing_soon" | "closed";

export interface RankableItem {
  id: number;
  paidPlan: string;
  planEndDate: Date | null;
  isEmergencyCategory: boolean;
  openStatus: ListingStatus;
  isSubLocalityMatch: boolean;    // primary sub-locality matches query
  servesSubLocality: boolean;      // listed under "also serves"
  isVerified: boolean;
  textRank: number;                // 0–1 from Postgres
}

interface RankedItem extends RankableItem {
  isPromoted: boolean;
  sortScore: number;
}

function isPaidActive(item: RankableItem): boolean {
  if (item.paidPlan === "none") return false;
  if (item.isEmergencyCategory) return false;  // never boosted
  if (!item.planEndDate) return false;
  return item.planEndDate > new Date();
}

function openScore(status: ListingStatus): number {
  switch (status) {
    case "open": return 3;
    case "closing_soon": return 2;
    case "closed": return 1;
  }
}

export function rankListings(
  items: RankableItem[],
  isOpenNowQuery: boolean = false
): RankedItem[] {
  const ranked: RankedItem[] = items.map((item) => {
    const paidActive = isPaidActive(item);
    const isPromotedSlot = paidActive && item.paidPlan === "promoted_slot";
    const isPaidBoost = paidActive && item.paidPlan === "ranking_boost";

    // Base sort score (higher = ranks first)
    let score = 0;

    // Tier 1: Promoted slots get +10000
    if (isPromotedSlot) score += 10000;

    // Tier 2: Paid boost gets +5000
    if (isPaidBoost) score += 5000;

    // Open status: +300/200/100
    score += openScore(item.openStatus) * 100;

    // Sub-locality match: +50 (exact) or +25 (serves)
    if (item.isSubLocalityMatch) score += 50;
    else if (item.servesSubLocality) score += 25;

    // Verified: +10
    if (item.isVerified) score += 10;

    // Text relevance: +0 to +5
    score += item.textRank * 5;

    return {
      ...item,
      isPromoted: paidActive,
      sortScore: score,
    };
  });

  // Sort by score descending
  ranked.sort((a, b) => b.sortScore - a.sortScore);

  // Post-sort rule: if the query includes "open now", a closed paid listing
  // must not rank above an open unpaid one
  if (isOpenNowQuery) {
    const result: RankedItem[] = [];
    const openUnpaid: RankedItem[] = [];
    const closedPaid: RankedItem[] = [];

    for (const item of ranked) {
      if (item.isPromoted && item.openStatus === "closed") {
        closedPaid.push(item);
      } else if (!item.isPromoted && item.openStatus === "open") {
        openUnpaid.push(item);
      } else {
        result.push(item);
      }
    }

    // Insert closed paid items after the last open unpaid item
    const combined = [...result, ...openUnpaid, ...closedPaid];
    combined.sort((a, b) => {
      // Keep promoted-and-open at top, then open unpaid, then closed paid
      if (a.openStatus === "open" && b.openStatus === "closed" && b.isPromoted) return -1;
      if (b.openStatus === "open" && a.openStatus === "closed" && a.isPromoted) return 1;
      return b.sortScore - a.sortScore;
    });

    return combined;
  }

  return ranked;
}
