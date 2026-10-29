import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateListing } from "@/lib/admin";

export async function PUT(
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

  try {
    const data = await request.json();
    const adminUserId = (session.user as Record<string, unknown>).dbId as number;

    const result = await updateListing(listingId, data, adminUserId);

    return NextResponse.json({ ok: true, changed: result.changed });
  } catch (error) {
    console.error("Listing update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
