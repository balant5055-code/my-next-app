import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  /* ---------- SUPER ADMIN ---------- */

  const isAdminRoute = path.startsWith("/admin");
  const isAdminLogin = path === "/admin/login";

  const adminCookie = request.cookies.get("admin-auth");

  if (isAdminRoute && !isAdminLogin && !adminCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  /* ---------- ORGANIZER ---------- */

  const isOrganizerRoute = path.startsWith("/organizer/admin");
  const isOrganizerLogin = path === "/organizer/login";

  const organizerCookie = request.cookies.get("organizer-auth");

  if (isOrganizerRoute && !isOrganizerLogin && !organizerCookie) {
    return NextResponse.redirect(new URL("/organizer/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/organizer/admin/:path*"],
};
