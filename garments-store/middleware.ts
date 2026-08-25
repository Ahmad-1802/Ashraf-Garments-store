import { NextRequest, NextResponse } from "next/server";

// Protects everything under /admin except the login page itself.
// The session cookie is set by /api/admin/login after checking the
// ADMIN_USERNAME / ADMIN_PASSWORD env vars, and simply holds the value of
// ADMIN_SESSION_SECRET. This is intentionally simple for a small single-admin
// shop. If you add staff accounts later, replace this with NextAuth or Clerk.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const session = request.cookies.get("admin_session")?.value;
  const expected = process.env.ADMIN_SESSION_SECRET;

  if (!session || !expected || session !== expected) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
