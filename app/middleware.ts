import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  // 🔐 Firebase auth cookie (you must set this on login)
  const authCookie = request.cookies.get("admin-auth");

  // If accessing admin without login → redirect
  if (isAdminRoute && !isLoginPage && !authCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
