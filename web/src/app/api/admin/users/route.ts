import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addAdminUser } from "@/lib/admin";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const email = (body.email as string)?.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  try {
    const user = await addAdminUser(email);
    if (!user) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("Add admin user error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
