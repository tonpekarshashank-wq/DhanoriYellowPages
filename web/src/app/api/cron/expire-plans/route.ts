import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  const expired = await sql`
    UPDATE listings SET
      paid_plan = 'none',
      plan_start_date = NULL,
      plan_end_date = NULL,
      updated_at = NOW()
    WHERE paid_plan != 'none'
      AND plan_end_date IS NOT NULL
      AND plan_end_date < NOW()
    RETURNING id, name, paid_plan
  `;

  return NextResponse.json({
    ok: true,
    expired: expired.length,
    listings: expired.map((r) => ({ id: r.id, name: r.name })),
  });
}
