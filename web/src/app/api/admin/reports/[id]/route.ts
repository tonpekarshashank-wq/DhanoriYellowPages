import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resolveReport } from "@/lib/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const reportId = parseInt(id, 10);
  if (isNaN(reportId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const adminUserId = (session.user as unknown as Record<string, unknown>).dbId as number;

  try {
    const ok = await resolveReport(reportId, adminUserId);
    return NextResponse.json({ ok });
  } catch (error) {
    console.error("Report resolve error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
