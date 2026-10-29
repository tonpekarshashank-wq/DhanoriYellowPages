import { NextRequest, NextResponse } from "next/server";
import { searchListings } from "@/lib/search";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? undefined;
  const subLocality = searchParams.get("area") ?? undefined;
  const openNow = searchParams.get("open") === "1";
  const verifiedOnly = searchParams.get("verified") === "1";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  try {
    const response = await searchListings({
      query,
      category,
      subLocality,
      openNow,
      verifiedOnly,
      page,
      limit: 20,
    });

    return NextResponse.json(response, {
      headers: {
        // Cache at the edge for 60 seconds
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
