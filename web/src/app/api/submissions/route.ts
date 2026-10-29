import { NextRequest, NextResponse } from "next/server";
import { createSubmission } from "@/lib/submissions";
import { formLimiter } from "@/lib/rate-limit";

const VALID_TYPES = ["provider", "suggestion"] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type, name, primaryService, phone, whatsapp,
      address, landmark, description, services,
      categorySlug, subLocalitySlug,
      submitterName, submitterRelation,
    } = body;

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (!name || typeof name !== "string" || name.length > 200) {
      return NextResponse.json({ error: "Business name is required (max 200 chars)" }, { status: 400 });
    }
    if (!primaryService || typeof primaryService !== "string" || primaryService.length > 200) {
      return NextResponse.json({ error: "Primary service is required (max 200 chars)" }, { status: 400 });
    }
    if (!phone || typeof phone !== "string" || phone.length > 20) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }
    if (!categorySlug || typeof categorySlug !== "string") {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }
    if (!subLocalitySlug || typeof subLocalitySlug !== "string") {
      return NextResponse.json({ error: "Area is required" }, { status: 400 });
    }
    if (description && typeof description === "string" && description.length > 2000) {
      return NextResponse.json({ error: "Description must be under 2000 characters" }, { status: 400 });
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

    if (formLimiter) {
      const { success } = await formLimiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many submissions. Please try again later." },
          { status: 429 }
        );
      }
    }

    const ipHash = await hashIp(ip);

    const id = await createSubmission({
      type,
      name: name.trim(),
      primaryService: primaryService.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp?.trim() || null,
      address: address?.trim() || null,
      landmark: landmark?.trim() || null,
      description: description?.trim() || null,
      services: Array.isArray(services) ? services.filter(Boolean).map((s: string) => s.trim()) : null,
      categorySlug,
      subLocalitySlug,
      submitterName: submitterName?.trim() || null,
      submitterRelation: submitterRelation?.trim() || null,
      ipHash,
    });

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (process.env.AUTH_SECRET ?? "dyp-salt"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
