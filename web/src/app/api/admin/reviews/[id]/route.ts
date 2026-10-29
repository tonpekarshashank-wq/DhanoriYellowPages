import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { approveReview, rejectReview } from "@/lib/reviews";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const reviewId = parseInt(id, 10);
  if (isNaN(reviewId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const { action } = await request.json();

    if (action === "approve") {
      const ok = await approveReview(reviewId);
      return NextResponse.json({ ok });
    } else if (action === "reject") {
      const ok = await rejectReview(reviewId);
      return NextResponse.json({ ok });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Review moderation error:", error);
    return NextResponse.json({ error: "Moderation failed" }, { status: 500 });
  }
}
