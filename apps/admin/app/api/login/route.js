import { NextResponse } from "next/server";

const WEB_API_URL = process.env.WEB_API_URL || "http://localhost:3000";

// Unauthenticated: forwards credentials to web's /api/auth/login, then stores
// the returned JWT in an httpOnly cookie scoped to this admin app. The token
// never touches client-side JS — the browser only ever talks to same-origin
// /api/* routes here, which read the cookie and proxy to web server-to-server.
export async function POST(request) {
  const body = await request.json().catch(() => null);

  const res = await fetch(`${WEB_API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json({ error: data.error || "Login failed" }, { status: res.status });
  }

  const response = NextResponse.json({ user: data.user });
  response.cookies.set("pv_admin_token", data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("pv_admin_token");
  return response;
}
