import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";

// Courier integration is intentionally disabled for the COD-only launch.
// Orders can be shipped manually and tracking can be entered from the admin
// order screen. The real courier API can be connected later without changing
// the storefront checkout flow.
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(
    { error: "Courier API is not enabled yet. Add your courier integration before using automatic booking." },
    { status: 501 }
  );
}
