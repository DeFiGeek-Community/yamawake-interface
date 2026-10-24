import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/:path*"],
};

export function middleware(req: NextRequest) {
  if (!process.env.BASIC_AUTH_USER && !process.env.BASIC_AUTH_PASS) {
    return NextResponse.next();
  }
  const basicAuth = req.headers.get("authorization");
  const url = req.nextUrl.clone();

  if (basicAuth && /^Basic [A-Za-z0-9+/]+={0,2}$/i.test(basicAuth)) {
    try {
      const credentials = atob(basicAuth.slice(6));
      const separator = credentials.indexOf(":");
      if (
        separator >= 0 &&
        credentials.slice(0, separator) === process.env.BASIC_AUTH_USER &&
        credentials.slice(separator + 1) === process.env.BASIC_AUTH_PASS
      )
        return NextResponse.next();
    } catch {
      // Invalid credentials must challenge the client instead of throwing a 500.
    }
  }
  url.pathname = "/api/auth";

  return NextResponse.rewrite(url);
}
