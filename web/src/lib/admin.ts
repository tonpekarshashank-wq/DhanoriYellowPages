import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

function getSql(): NeonQueryFunction<false, false> {
  return neon(process.env.DATABASE_URL!);
}

/** Dashboard stats */
export async function getDashboardStats() {
  const sql = getSql();

  const [listings, reviews, submissions, reports] = await Promise.all([
    sql`SELECT
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE status = 'verified')::int as verified,
      COUNT(*) FILTER (WHERE status = 'community_submitted')::int as community,
      COUNT(*) FILTER (WHERE status = 'draft')::int as draft
    FROM listings`,
    sql`SELECT
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
      COUNT(*) FILTER (WHERE status = 'published')::int as published
    FROM reviews`,
    sql`SELECT
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE status = 'pending')::int as pending
    FROM submissions`,
    sql`SELECT
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE resolved = false)::int as open
    FROM reports`,
  ]);

  return {
    listings: listings[0],
    reviews: reviews[0],
    submissions: submissions[0],
    reports: reports[0],
  };
}

/** Paginated listings for admin table */
export async function getAdminListings(opts: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  const sql = getSql();
  const { page = 1, limit = 25, status, search } = opts;
  const offset = (page - 1) * limit;

  const rows = await sql`
    SELECT
      l.id, l.name, l.slug, l.primary_service as "primaryService",
      l.phone, l.status, l.paid_plan as "paidPlan",
      l.rating_avg as "ratingAvg", l.rating_count as "ratingCount",
      l.open_report_count as "openReportCount",
      l.created_at as "createdAt", l.updated_at as "updatedAt",
      sl.name as "subLocalityName",
      c.name as "categoryName"
    FROM listings l
    JOIN sub_localities sl ON l.sub_locality_id = sl.id
    JOIN categories c ON l.category_id = c.id
    WHERE 1=1
      ${status ? sql`AND l.status = ${status}` : sql``}
      ${search ? sql`AND (l.name ILIKE ${"%" + search + "%"} OR l.phone ILIKE ${"%" + search + "%"})` : sql``}
    ORDER BY l.updated_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const countResult = await sql`
    SELECT COUNT(*)::int as total FROM listings l
    WHERE 1=1
      ${status ? sql`AND l.status = ${status}` : sql``}
      ${search ? sql`AND (l.name ILIKE ${"%" + search + "%"} OR l.phone ILIKE ${"%" + search + "%"})` : sql``}
  `;

  return {
    listings: rows,
    total: (countResult[0]?.total as number) ?? 0,
    page,
    totalPages: Math.ceil(((countResult[0]?.total as number) ?? 0) / limit),
  };
}

/** Fetch a single listing for the editor */
export async function getAdminListingById(id: number) {
  const sql = getSql();

  const rows = await sql`
    SELECT
      l.*,
      sl.slug as "subLocalitySlug",
      c.slug as "categorySlug"
    FROM listings l
    JOIN sub_localities sl ON l.sub_locality_id = sl.id
    JOIN categories c ON l.category_id = c.id
    WHERE l.id = ${id}
  `;
  if (rows.length === 0) return null;

  const listing = rows[0];

  const hours = await sql`
    SELECT weekday, opens, closes FROM listing_hours
    WHERE listing_id = ${id} ORDER BY weekday
  `;

  return { ...listing, hours };
}

/** Update a listing */
export async function updateListing(
  id: number,
  data: Record<string, unknown>,
  adminUserId: number
) {
  const sql = getSql();

  // Fetch old values for audit
  const oldRows = await sql`SELECT * FROM listings WHERE id = ${id}`;
  if (oldRows.length === 0) throw new Error("Listing not found");

  const old = oldRows[0];
  const changes: Record<string, { from: unknown; to: unknown }> = {};

  const fields: [string, string][] = [
    ["name", "name"],
    ["primary_service", "primaryService"],
    ["phone", "phone"],
    ["whatsapp", "whatsapp"],
    ["address", "address"],
    ["landmark", "landmark"],
    ["description", "description"],
    ["status", "status"],
    ["is_24x7", "is24x7"],
    ["emergency_available", "emergencyAvailable"],
  ];

  for (const [dbCol, inputKey] of fields) {
    if (inputKey in data && data[inputKey] !== old[dbCol]) {
      changes[dbCol] = { from: old[dbCol], to: data[inputKey] };
    }
  }

  if (Object.keys(changes).length === 0 && !data.hours) {
    return { changed: false };
  }

  // Build SET clauses for changed fields
  if (Object.keys(changes).length > 0) {
    await sql`
      UPDATE listings SET
        name = COALESCE(${(data.name as string) ?? null}, name),
        primary_service = COALESCE(${(data.primaryService as string) ?? null}, primary_service),
        phone = COALESCE(${(data.phone as string) ?? null}, phone),
        whatsapp = ${(data.whatsapp as string) ?? null},
        address = ${(data.address as string) ?? null},
        landmark = ${(data.landmark as string) ?? null},
        description = ${(data.description as string) ?? null},
        status = COALESCE(${(data.status as string) ?? null}, status),
        is_24x7 = COALESCE(${(data.is24x7 as boolean) ?? null}, is_24x7),
        emergency_available = COALESCE(${(data.emergencyAvailable as boolean) ?? null}, emergency_available),
        verified_on = ${data.status === "verified" ? sql`NOW()` : sql`verified_on`},
        verification_method = ${data.status === "verified" ? (data.verificationMethod as string) ?? "call" : sql`verification_method`},
        updated_at = NOW()
      WHERE id = ${id}
    `;
  }

  // Update hours if provided
  if (data.hours && Array.isArray(data.hours)) {
    await sql`DELETE FROM listing_hours WHERE listing_id = ${id}`;
    for (const h of data.hours as { weekday: number; opens: string; closes: string }[]) {
      await sql`
        INSERT INTO listing_hours (listing_id, weekday, opens, closes)
        VALUES (${id}, ${h.weekday}, ${h.opens}, ${h.closes})
      `;
    }
    changes["hours"] = { from: "updated", to: "updated" };
  }

  // Write audit log
  await sql`
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, changes)
    VALUES (${adminUserId}, 'listing.update', 'listing', ${id}, ${JSON.stringify(changes)})
  `;

  return { changed: true, changes };
}

/** Verify a listing */
export async function verifyListing(
  id: number,
  method: string,
  adminUserId: number
) {
  const sql = getSql();

  await sql`
    UPDATE listings SET
      status = 'verified',
      verified_on = NOW(),
      verification_method = ${method},
      updated_at = NOW()
    WHERE id = ${id}
  `;

  await sql`
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, changes)
    VALUES (${adminUserId}, 'listing.verify', 'listing', ${id}, ${JSON.stringify({ status: { from: "community_submitted", to: "verified" }, method })})
  `;
}

/** Fetch recent audit log entries */
export async function getAuditLog(limit = 50, offset = 0) {
  const sql = getSql();

  const rows = await sql`
    SELECT
      a.id, a.action, a.entity_type as "entityType",
      a.entity_id as "entityId", a.changes,
      a.created_at as "createdAt",
      u.name as "userName", u.email as "userEmail"
    FROM audit_log a
    LEFT JOIN admin_users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return rows;
}
