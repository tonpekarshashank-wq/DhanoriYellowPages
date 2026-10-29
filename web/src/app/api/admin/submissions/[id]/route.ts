import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { approveSubmission, rejectSubmission } from "@/lib/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const submissionId = parseInt(id, 10);
  if (isNaN(submissionId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const adminUserId = (session.user as unknown as Record<string, unknown>).dbId as number;

  try {
    const { action, notes } = await request.json();

    if (action === "approve") {
      const listingId = await approveSubmission(submissionId, adminUserId);
      return NextResponse.json({ ok: true, listingId });
    } else if (action === "reject") {
      await rejectSubmission(submissionId, adminUserId, notes);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Submission action error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
