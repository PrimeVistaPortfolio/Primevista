import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // API routes handle their own auth (login is public; proxy checks the
  // cookie itself and returns 401 JSON) — never redirect a fetch call to
  // an HTML login page, the client's 401 handling takes care of it.
  if (pathname.startsWith("/api/") || PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("pv_admin_token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Exclude *all* of /_next, not just static and image. Dev requests like
  // /_next/webpack-hmr and RSC payload fetches would otherwise be redirected
  // to /login, breaking HMR and making the dev overlay reload in a loop.
  matcher: ["/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
