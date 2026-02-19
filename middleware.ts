import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Protect only /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // ✅ Allow login page
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // ✅ Check session cookie exists
  const token = req.cookies.get("admin_token")?.value;

  if (!token) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ If cookie exists → allow request
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
