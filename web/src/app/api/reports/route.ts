import { NextRequest, NextResponse } from "next/server";
import { createReport } from "@/lib/submissions";
import { formLimiter } from "@/lib/rate-limit";

const VALID_REASONS = [
  "incorrect_info",
  "closed_permanently",
  "spam",
  "duplicate",
  "inappropriate",
  "other",
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, reason, details } = body;

    if (!listingId || typeof listingId !== "number") {
      return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 });
    }
    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }
    if (details && typeof details === "string" && details.length > 1000) {
      return NextResponse.json({ error: "Details must be under 1000 characters" }, { status: 400 });
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

    if (formLimiter) {
      const { success } = await formLimiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many reports. Please try again later." },
          { status: 429 }
        );
      }
    }

    const ipHash = await hashIp(ip);

    await createReport({
      listingId,
      reason,
      details: details?.trim() || null,
      ipHash,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed";
    if (msg === "Duplicate report") {
      return NextResponse.json(
        { error: "You have already reported this listing recently." },
        { status: 429 }
      );
    }
    if (msg === "Listing not found") {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    console.error("Report error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (process.env.AUTH_SECRET ?? "dyp-salt"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
