import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "@/src/backend/modules/auth/lib/session-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;

  if (pathname === "/admin/login") {
    if (user) {
      const url = new URL("/admin", request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!user) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/admin", "/admin/:path*"],
};
