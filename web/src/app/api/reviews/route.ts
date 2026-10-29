import { NextRequest, NextResponse } from "next/server";
import { submitReview } from "@/lib/reviews";
import { reviewLimiter } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, rating, comment, displayName } = body;

    // Validate required fields
    if (!listingId || typeof listingId !== "number") {
      return NextResponse.json(
        { error: "Invalid listing ID" },
        { status: 400 }
      );
    }
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }
    if (comment && typeof comment !== "string") {
      return NextResponse.json(
        { error: "Invalid comment" },
        { status: 400 }
      );
    }
    if (comment && comment.length > 1000) {
      return NextResponse.json(
        { error: "Comment must be under 1000 characters" },
        { status: 400 }
      );
    }
    if (displayName && typeof displayName !== "string") {
      return NextResponse.json(
        { error: "Invalid display name" },
        { status: 400 }
      );
    }
    if (displayName && displayName.length > 50) {
      return NextResponse.json(
        { error: "Name must be under 50 characters" },
        { status: 400 }
      );
    }

    // Get IP for rate limiting and anti-abuse
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

    // Rate limit: 1 review per listing per IP per 30 days
    if (reviewLimiter) {
      const key = `${ip}:${listingId}`;
      const { success } = await reviewLimiter.limit(key);
      if (!success) {
        return NextResponse.json(
          { error: "You have already reviewed this listing recently. Please try again later." },
          { status: 429 }
        );
      }
    }

    // Hash IP for storage (don't store raw IPs)
    const ipHash = await hashIp(ip);

    await submitReview({
      listingId,
      rating: Math.round(rating),
      comment: comment?.trim() || null,
      displayName: displayName?.trim() || null,
      ipHash,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (process.env.AUTH_SECRET ?? "dyp-salt"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
