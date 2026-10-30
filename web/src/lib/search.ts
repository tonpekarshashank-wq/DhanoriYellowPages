/**
 * Server-side search logic.
 * Uses Postgres full-text search + pg_trgm for typo tolerance,
 * with synonym expansion from the synonyms table.
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

function getSql(): NeonQueryFunction<false, false> {
  return neon(process.env.DATABASE_URL!);
}

export interface SearchFilters {
  query: string;
  category?: string;        // category slug
  subLocality?: string;     // sub-locality slug
  openNow?: boolean;
  verifiedOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: number;
  name: string;
  slug: string;
  primaryService: string;
  description: string | null;
  phone: string;
  whatsapp: string | null;
  status: string;
  ratingAvg: string | null;
  ratingCount: number;
  is24x7: boolean;
  emergencyAvailable: boolean;
  paidPlan: string;
  planEndDate: string | null;
  subLocalityName: string;
  subLocalitySlug: string;
  categorySlug: string;
  categoryName: string;
  isEmergencyCategory: boolean;
  weekday: number | null;
  opens: string | null;
  closes: string | null;
  textRank: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  filters: Omit<SearchFilters, "query">;
  synonymsUsed: string[];
}

/**
 * Expand a query using the synonyms table.
 * Returns the original terms plus any synonyms found.
 */
async function expandSynonyms(
  sql: NeonQueryFunction<false, false>,
  query: string
): Promise<{ expanded: string[]; synonymsUsed: string[] }> {
  const terms = query.toLowerCase().trim().split(/\s+/);
  const synonymsUsed: string[] = [];
  const expanded = new Set(terms);

  // Look up each term and the full query in the synonyms table
  const lookups = [...terms, query.toLowerCase().trim()];

  for (const lookup of lookups) {
    const rows = await sql`
      SELECT term, synonyms FROM synonyms
      WHERE term = ${lookup}
         OR ${lookup} = ANY(synonyms)
    `;
    for (const row of rows) {
      expanded.add(row.term as string);
      const syns = row.synonyms as string[];
      for (const syn of syns) {
        expanded.add(syn);
      }
      synonymsUsed.push(row.term as string);
    }
  }

  return { expanded: Array.from(expanded), synonymsUsed };
}

/**
 * Build and execute the search query.
 */
export async function searchListings(
  filters: SearchFilters
): Promise<SearchResponse> {
  const sql = getSql();

  const {
    query,
    category,
    subLocality,
    openNow,
    verifiedOnly,
    page = 1,
    limit = 20,
  } = filters;

  const offset = (page - 1) * limit;
  const cleanQuery = query.trim();

  // Resolve sub-locality ID if filtering by area
  let subLocalityId: number | null = null;
  if (subLocality) {
    const slRow = await sql`SELECT id FROM sub_localities WHERE slug = ${subLocality}`;
    subLocalityId = (slRow[0]?.id as number) ?? null;
  }

  // Expand synonyms
  const { expanded, synonymsUsed } = cleanQuery
    ? await expandSynonyms(sql, cleanQuery)
    : { expanded: [], synonymsUsed: [] };

  // Build the search — combine full-text and trigram matching
  // For each expanded term, we do an OR across full-text and ILIKE
  let results: SearchResult[];
  let total: number;

  if (cleanQuery) {
    // Build tsquery from expanded terms (OR them together)
    const tsTerms = expanded
      .filter((t) => /^[a-zA-Z0-9ऀ-ॿ]+$/.test(t)) // skip special chars
      .map((t) => t.replace(/'/g, ""))
      .filter(Boolean);

    const tsQueryStr = tsTerms.length > 0
      ? tsTerms.map((t) => `'${t}':*`).join(" | ")
      : `'${cleanQuery.replace(/'/g, "")}':*`;

    // Build ILIKE patterns for trigram matching
    const likePattern = `%${cleanQuery}%`;

    const searchRows = await sql`
      SELECT
        l.id, l.name, l.slug, l.primary_service as "primaryService",
        l.description, l.phone, l.whatsapp, l.status,
        l.rating_avg as "ratingAvg", l.rating_count as "ratingCount",
        l.is_24x7 as "is24x7", l.emergency_available as "emergencyAvailable",
        l.paid_plan as "paidPlan",
        l.plan_end_date as "planEndDate",
        sl.name as "subLocalityName", sl.slug as "subLocalitySlug",
        c.slug as "categorySlug", c.name as "categoryName",
        c.is_emergency as "isEmergencyCategory",
        lh.weekday, lh.opens, lh.closes,
        COALESCE(
          ts_rank(l.search_vector, to_tsquery('english', ${tsQueryStr})),
          0
        ) + COALESCE(
          similarity(l.name, ${cleanQuery}),
          0
        ) * 0.5 + COALESCE(
          similarity(l.primary_service, ${cleanQuery}),
          0
        ) * 0.3 as "textRank"
      FROM listings l
      JOIN sub_localities sl ON l.sub_locality_id = sl.id
      JOIN categories c ON l.category_id = c.id
      LEFT JOIN listing_hours lh ON l.id = lh.listing_id
        AND lh.weekday = EXTRACT(DOW FROM NOW() AT TIME ZONE 'Asia/Kolkata')::int
      WHERE l.status IN ('verified', 'community_submitted')
        AND (
          l.search_vector @@ to_tsquery('english', ${tsQueryStr})
          OR l.name ILIKE ${likePattern}
          OR l.primary_service ILIKE ${likePattern}
          OR l.description ILIKE ${likePattern}
          OR sl.name ILIKE ${likePattern}
          OR EXISTS (
            SELECT 1 FROM unnest(sl.aliases) alias
            WHERE alias ILIKE ${likePattern}
          )
        )
        ${category ? sql`AND c.slug = ${category}` : sql``}
        ${subLocalityId ? sql`AND (sl.id = ${subLocalityId} OR ${subLocalityId} = ANY(l.serves_sub_localities))` : sql``}
        ${verifiedOnly ? sql`AND l.status = 'verified'` : sql``}
      ORDER BY l.paid_plan != 'none' AND l.plan_end_date > NOW() DESC, "textRank" DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    results = searchRows as SearchResult[];

    // Get total count
    const countResult = await sql`
      SELECT COUNT(DISTINCT l.id)::int as total
      FROM listings l
      JOIN sub_localities sl ON l.sub_locality_id = sl.id
      JOIN categories c ON l.category_id = c.id
      WHERE l.status IN ('verified', 'community_submitted')
        AND (
          l.search_vector @@ to_tsquery('english', ${tsQueryStr})
          OR l.name ILIKE ${likePattern}
          OR l.primary_service ILIKE ${likePattern}
          OR l.description ILIKE ${likePattern}
          OR sl.name ILIKE ${likePattern}
          OR EXISTS (
            SELECT 1 FROM unnest(sl.aliases) alias
            WHERE alias ILIKE ${likePattern}
          )
        )
        ${category ? sql`AND c.slug = ${category}` : sql``}
        ${subLocalityId ? sql`AND (sl.id = ${subLocalityId} OR ${subLocalityId} = ANY(l.serves_sub_localities))` : sql``}
        ${verifiedOnly ? sql`AND l.status = 'verified'` : sql``}
    `;
    total = countResult[0]?.total ?? 0;
  } else {
    // No query — return all, filtered
    results = await sql`
      SELECT
        l.id, l.name, l.slug, l.primary_service as "primaryService",
        l.description, l.phone, l.whatsapp, l.status,
        l.rating_avg as "ratingAvg", l.rating_count as "ratingCount",
        l.is_24x7 as "is24x7", l.emergency_available as "emergencyAvailable",
        l.paid_plan as "paidPlan",
        l.plan_end_date as "planEndDate",
        sl.name as "subLocalityName", sl.slug as "subLocalitySlug",
        c.slug as "categorySlug", c.name as "categoryName",
        c.is_emergency as "isEmergencyCategory",
        lh.weekday, lh.opens, lh.closes,
        0 as "textRank"
      FROM listings l
      JOIN sub_localities sl ON l.sub_locality_id = sl.id
      JOIN categories c ON l.category_id = c.id
      LEFT JOIN listing_hours lh ON l.id = lh.listing_id
        AND lh.weekday = EXTRACT(DOW FROM NOW() AT TIME ZONE 'Asia/Kolkata')::int
      WHERE l.status IN ('verified', 'community_submitted')
        ${category ? sql`AND c.slug = ${category}` : sql``}
        ${subLocalityId ? sql`AND (sl.id = ${subLocalityId} OR ${subLocalityId} = ANY(l.serves_sub_localities))` : sql``}
        ${verifiedOnly ? sql`AND l.status = 'verified'` : sql``}
      ORDER BY l.paid_plan != 'none' DESC, l.status = 'verified' DESC, l.rating_count DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as SearchResult[];

    const countResult = await sql`
      SELECT COUNT(*)::int as total FROM listings l
      JOIN categories c ON l.category_id = c.id
      JOIN sub_localities sl ON l.sub_locality_id = sl.id
      WHERE l.status IN ('verified', 'community_submitted')
        ${category ? sql`AND c.slug = ${category}` : sql``}
        ${subLocalityId ? sql`AND (sl.id = ${subLocalityId} OR ${subLocalityId} = ANY(l.serves_sub_localities))` : sql``}
        ${verifiedOnly ? sql`AND l.status = 'verified'` : sql``}
    `;
    total = countResult[0]?.total ?? 0;
  }

  return {
    results,
    total,
    query: cleanQuery,
    filters: { category, subLocality, openNow, verifiedOnly, page, limit },
    synonymsUsed,
  };
}

/**
 * Fetch all categories (for filter chips).
 */
export async function getCategories() {
  const sql = getSql();
  return sql`SELECT id, name, slug, is_emergency as "isEmergency" FROM categories ORDER BY sort_order`;
}

/**
 * Fetch all sub-localities (for filter chips).
 */
export async function getSubLocalities() {
  const sql = getSql();
  return sql`SELECT id, name, slug FROM sub_localities ORDER BY sort_order`;
}

/**
 * Fetch a single category by slug.
 */
export async function getCategoryBySlug(slug: string) {
  const sql = getSql();
  const rows = await sql`SELECT id, name, slug, name_mr as "nameMarathi", name_hi as "nameHindi", is_emergency as "isEmergency" FROM categories WHERE slug = ${slug}`;
  return rows[0] ?? null;
}

/**
 * Fetch a single sub-locality by slug.
 */
export async function getSubLocalityBySlug(slug: string) {
  const sql = getSql();
  const rows = await sql`SELECT id, name, slug, name_mr as "nameMarathi", name_hi as "nameHindi", aliases FROM sub_localities WHERE slug = ${slug}`;
  return rows[0] ?? null;
}

/**
 * Fetch sub-categories for a category.
 */
export async function getSubCategoriesByCategoryId(categoryId: number) {
  const sql = getSql();
  return sql`SELECT id, name, slug FROM sub_categories WHERE category_id = ${categoryId} ORDER BY sort_order`;
}

/**
 * Fetch listings for the emergency page — emergency category + emergency-available from other categories.
 */
export async function getEmergencyListings() {
  const sql = getSql();
  const rows = await sql`
    SELECT
      l.id, l.name, l.slug, l.primary_service as "primaryService",
      l.description, l.phone, l.whatsapp, l.status,
      l.rating_avg as "ratingAvg", l.rating_count as "ratingCount",
      l.is_24x7 as "is24x7", l.emergency_available as "emergencyAvailable",
      l.paid_plan as "paidPlan", l.plan_end_date as "planEndDate",
      sl.name as "subLocalityName", sl.slug as "subLocalitySlug",
      c.slug as "categorySlug", c.name as "categoryName",
      c.is_emergency as "isEmergencyCategory",
      lh.weekday, lh.opens, lh.closes,
      0 as "textRank"
    FROM listings l
    JOIN sub_localities sl ON l.sub_locality_id = sl.id
    JOIN categories c ON l.category_id = c.id
    LEFT JOIN listing_hours lh ON l.id = lh.listing_id
      AND lh.weekday = EXTRACT(DOW FROM NOW() AT TIME ZONE 'Asia/Kolkata')::int
    WHERE l.status IN ('verified', 'community_submitted')
      AND (c.is_emergency = true OR l.emergency_available = true)
    ORDER BY c.is_emergency DESC, l.emergency_available DESC, l.name
  `;
  return rows as SearchResult[];
}

/**
 * Fetch all category slugs (for static generation).
 */
export async function getAllCategorySlugs() {
  const sql = getSql();
  const rows = await sql`SELECT slug FROM categories ORDER BY sort_order`;
  return rows as { slug: string }[];
}

/**
 * Fetch all sub-locality slugs (for static generation).
 */
export async function getAllSubLocalitySlugs() {
  const sql = getSql();
  const rows = await sql`SELECT slug FROM sub_localities ORDER BY sort_order`;
  return rows as { slug: string }[];
}

/**
 * Fetch all listing slugs (for sitemap).
 */
export async function getAllListingSlugs() {
  const sql = getSql();
  const rows = await sql`SELECT slug, updated_at as "updatedAt" FROM listings WHERE status IN ('verified', 'community_submitted') ORDER BY updated_at DESC`;
  return rows as { slug: string; updatedAt: string }[];
}
