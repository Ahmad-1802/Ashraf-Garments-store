import { NextRequest } from "next/server";

export function isAdminRequest(request: NextRequest): boolean {
  const session = request.cookies.get("admin_session")?.value;
  const expected = process.env.ADMIN_SESSION_SECRET;
  return Boolean(session && expected && session === expected);
}
