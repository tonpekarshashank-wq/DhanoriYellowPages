/**
 * Listing data queries for the detail page and related components.
 */
import { neon } from "@neondatabase/serverless";

function getSql() {
  return neon(process.env.DATABASE_URL!);
}

export interface ListingDetail {
  id: number;
  name: string;
  slug: string;
  primaryService: string;
  description: string | null;
  phone: string;
  whatsapp: string | null;
  address: string | null;
  landmark: string | null;
  lat: string | null;
  lng: string | null;
  services: string[] | null;
  languages: string[] | null;
  emergencyAvailable: boolean;
  is24x7: boolean;
  status: string;
  verifiedOn: string | null;
  verificationMethod: string | null;
  ratingAvg: string | null;
  ratingCount: number;
  paidPlan: string;
  subLocalityName: string;
  subLocalitySlug: string;
  categoryName: string;
  categorySlug: string;
  isEmergencyCategory: boolean;
  servesSubLocalities: string[];
  hours: { weekday: number; opens: string; closes: string }[];
}

export interface ListingReview {
  id: number;
  rating: number;
  comment: string | null;
  displayName: string | null;
  createdAt: string;
}

/**
 * Fetch a single listing by slug with all detail-page fields.
 */
export async function getListingBySlug(
  slug: string
): Promise<ListingDetail | null> {
  const sql = getSql();

  const rows = await sql`
    SELECT
      l.id, l.name, l.slug,
      l.primary_service as "primaryService",
      l.description, l.phone, l.whatsapp,
      l.address, l.landmark, l.lat, l.lng,
      l.services, l.languages,
      l.emergency_available as "emergencyAvailable",
      l.is_24x7 as "is24x7",
      l.status,
      l.verified_on as "verifiedOn",
      l.verification_method as "verificationMethod",
      l.rating_avg as "ratingAvg",
      l.rating_count as "ratingCount",
      l.paid_plan as "paidPlan",
      sl.name as "subLocalityName",
      sl.slug as "subLocalitySlug",
      c.name as "categoryName",
      c.slug as "categorySlug",
      c.is_emergency as "isEmergencyCategory"
    FROM listings l
    JOIN sub_localities sl ON l.sub_locality_id = sl.id
    JOIN categories c ON l.category_id = c.id
    WHERE l.slug = ${slug}
      AND l.status IN ('verified', 'community_submitted')
  `;

  if (rows.length === 0) return null;

  const listing = rows[0] as unknown as ListingDetail;

  // Fetch hours
  const hours = await sql`
    SELECT weekday, opens, closes
    FROM listing_hours
    WHERE listing_id = ${listing.id}
    ORDER BY weekday
  `;
  listing.hours = hours as { weekday: number; opens: string; closes: string }[];

  // Fetch "also serves" sub-locality names
  const servesRows = await sql`
    SELECT sl.name FROM sub_localities sl
    WHERE sl.id = ANY(
      SELECT unnest(serves_sub_localities) FROM listings WHERE id = ${listing.id}
    )
  `;
  listing.servesSubLocalities = servesRows.map(
    (r) => r.name as string
  );

  return listing;
}

/**
 * Fetch minimal listing info by ID (for report page, etc.)
 */
export async function getListingById(
  id: number
): Promise<{ id: number; name: string; slug: string } | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, slug FROM listings
    WHERE id = ${id}
      AND status IN ('verified', 'community_submitted')
  `;
  if (rows.length === 0) return null;
  return rows[0] as unknown as { id: number; name: string; slug: string };
}

/**
 * Fetch published reviews for a listing.
 */
export async function getListingReviews(
  listingId: number,
  limit = 10,
  offset = 0
): Promise<{ reviews: ListingReview[]; total: number }> {
  const sql = getSql();

  const reviews = await sql`
    SELECT id, rating, comment, display_name as "displayName",
           created_at as "createdAt"
    FROM reviews
    WHERE listing_id = ${listingId}
      AND status = 'published'
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const countResult = await sql`
    SELECT COUNT(*)::int as total FROM reviews
    WHERE listing_id = ${listingId} AND status = 'published'
  `;

  return {
    reviews: reviews as unknown as ListingReview[],
    total: countResult[0]?.total ?? 0,
  };
}
