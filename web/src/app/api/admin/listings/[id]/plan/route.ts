import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const VALID_PLANS = ["none", "promoted_slot", "ranking_boost"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const listingId = parseInt(id, 10);
  if (isNaN(listingId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();
  const { plan, durationDays } = body;

  if (!plan || !VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  if (plan === "none") {
    await sql`
      UPDATE listings SET
        paid_plan = 'none',
        plan_start_date = NULL,
        plan_end_date = NULL,
        updated_at = NOW()
      WHERE id = ${listingId}
    `;
  } else {
    const days = Math.max(1, Math.min(365, parseInt(durationDays, 10) || 30));
    await sql`
      UPDATE listings SET
        paid_plan = ${plan},
        plan_start_date = NOW(),
        plan_end_date = NOW() + ${days + " days"}::interval,
        updated_at = NOW()
      WHERE id = ${listingId}
    `;
  }

  const adminUserId = (session.user as unknown as Record<string, unknown>).dbId as number;
  await sql`
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, changes)
    VALUES (${adminUserId}, 'listing.plan', 'listing', ${listingId},
      ${JSON.stringify({ plan, durationDays })})
  `;

  return NextResponse.json({ ok: true });
}
