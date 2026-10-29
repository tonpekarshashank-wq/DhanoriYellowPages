import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

function getSql(): NeonQueryFunction<false, false> {
  return neon(process.env.DATABASE_URL!);
}

interface SubmitReviewInput {
  listingId: number;
  rating: number;
  comment: string | null;
  displayName: string | null;
  ipHash: string;
}

export async function submitReview(input: SubmitReviewInput) {
  const sql = getSql();

  // Verify listing exists and is public
  const listing = await sql`
    SELECT id FROM listings
    WHERE id = ${input.listingId}
      AND status IN ('verified', 'community_submitted')
  `;
  if (listing.length === 0) {
    throw new Error("Listing not found");
  }

  // Check for duplicate review from same IP on same listing
  const existing = await sql`
    SELECT id FROM reviews
    WHERE listing_id = ${input.listingId}
      AND ip_hash = ${input.ipHash}
      AND created_at > NOW() - INTERVAL '30 days'
  `;
  if (existing.length > 0) {
    throw new Error("Duplicate review");
  }

  await sql`
    INSERT INTO reviews (listing_id, rating, comment, display_name, ip_hash, status)
    VALUES (${input.listingId}, ${input.rating}, ${input.comment}, ${input.displayName}, ${input.ipHash}, 'pending')
  `;
}

/**
 * Recalculate and update the denormalized rating fields on a listing.
 * Called after a review is approved or rejected by an admin.
 */
export async function recalculateRating(listingId: number) {
  const sql = getSql();

  const result = await sql`
    SELECT
      COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as avg,
      COUNT(*)::int as count
    FROM reviews
    WHERE listing_id = ${listingId}
      AND status = 'published'
  `;

  const avg = result[0]?.avg ?? 0;
  const count = result[0]?.count ?? 0;

  await sql`
    UPDATE listings
    SET rating_avg = ${avg},
        rating_count = ${count},
        updated_at = NOW()
    WHERE id = ${listingId}
  `;

  return { avg, count };
}

/**
 * Approve a pending review and recalculate the listing's rating.
 */
export async function approveReview(reviewId: number) {
  const sql = getSql();

  const rows = await sql`
    UPDATE reviews
    SET status = 'published', moderated_at = NOW()
    WHERE id = ${reviewId} AND status = 'pending'
    RETURNING listing_id as "listingId"
  `;

  if (rows.length > 0) {
    await recalculateRating(rows[0].listingId as number);
  }

  return rows.length > 0;
}

/**
 * Reject a pending review and keep rating unchanged.
 */
export async function rejectReview(reviewId: number) {
  const sql = getSql();

  const rows = await sql`
    UPDATE reviews
    SET status = 'rejected', moderated_at = NOW()
    WHERE id = ${reviewId} AND status = 'pending'
    RETURNING id
  `;

  return rows.length > 0;
}

/**
 * Fetch pending reviews for admin moderation.
 */
export async function getPendingReviews(limit = 50, offset = 0) {
  const sql = getSql();

  const reviews = await sql`
    SELECT
      r.id, r.rating, r.comment,
      r.display_name as "displayName",
      r.created_at as "createdAt",
      r.ip_hash as "ipHash",
      l.id as "listingId",
      l.name as "listingName",
      l.slug as "listingSlug"
    FROM reviews r
    JOIN listings l ON r.listing_id = l.id
    WHERE r.status = 'pending'
    ORDER BY r.created_at ASC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const countResult = await sql`
    SELECT COUNT(*)::int as total FROM reviews WHERE status = 'pending'
  `;

  return {
    reviews,
    total: (countResult[0]?.total as number) ?? 0,
  };
}
