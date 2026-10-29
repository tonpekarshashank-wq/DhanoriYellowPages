import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

function getSql(): NeonQueryFunction<false, false> {
  return neon(process.env.DATABASE_URL!);
}

interface SubmitBusinessInput {
  type: "provider" | "suggestion";
  name: string;
  primaryService: string;
  phone: string;
  whatsapp?: string | null;
  address?: string | null;
  landmark?: string | null;
  description?: string | null;
  services?: string[] | null;
  categorySlug: string;
  subLocalitySlug: string;
  submitterName?: string | null;
  submitterRelation?: string | null;
  ipHash: string;
}

export async function createSubmission(input: SubmitBusinessInput) {
  const sql = getSql();

  const rows = await sql`
    INSERT INTO submissions (
      type, name, primary_service, phone, whatsapp,
      address, landmark, description, services,
      category_slug, sub_locality_slug,
      submitter_name, submitter_relation, ip_hash, status
    ) VALUES (
      ${input.type}, ${input.name}, ${input.primaryService},
      ${input.phone}, ${input.whatsapp ?? null},
      ${input.address ?? null}, ${input.landmark ?? null},
      ${input.description ?? null}, ${input.services ? JSON.stringify(input.services) : null},
      ${input.categorySlug}, ${input.subLocalitySlug},
      ${input.submitterName ?? null}, ${input.submitterRelation ?? null},
      ${input.ipHash}, 'pending'
    ) RETURNING id
  `;

  return rows[0]?.id as number;
}

interface ReportInput {
  listingId: number;
  reason: string;
  details?: string | null;
  ipHash: string;
}

export async function createReport(input: ReportInput) {
  const sql = getSql();

  const listing = await sql`
    SELECT id FROM listings
    WHERE id = ${input.listingId}
      AND status IN ('verified', 'community_submitted')
  `;
  if (listing.length === 0) {
    throw new Error("Listing not found");
  }

  const existing = await sql`
    SELECT id FROM reports
    WHERE listing_id = ${input.listingId}
      AND ip_hash = ${input.ipHash}
      AND created_at > NOW() - INTERVAL '7 days'
  `;
  if (existing.length > 0) {
    throw new Error("Duplicate report");
  }

  await sql`
    INSERT INTO reports (listing_id, reason, details, ip_hash)
    VALUES (${input.listingId}, ${input.reason}, ${input.details ?? null}, ${input.ipHash})
  `;

  await sql`
    UPDATE listings SET
      open_report_count = open_report_count + 1
    WHERE id = ${input.listingId}
  `;
}
