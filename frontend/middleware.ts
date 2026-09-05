import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = process.env.COOKIE_NAME || "linkapp_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasSession = req.cookies.has(COOKIE_NAME);
    if (!hasSession) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
