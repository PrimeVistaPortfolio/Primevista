import { NextResponse } from "next/server";
import { verifyAdminToken } from "@primevista/shared";

export function getBearerToken(request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
}

export function requireAdmin(handler) {
  return async (request, ctx) => {
    const token = getBearerToken(request);
    const payload = token ? verifyAdminToken(token) : null;
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Next.js 15+ resolves route params asynchronously — await once here so
    // every handler below can keep destructuring `{ params }` synchronously.
    const params = ctx?.params ? await ctx.params : undefined;
    return handler(request, { ...ctx, params }, payload);
  };
}

export function jsonError(message, status = 400, details) {
  return NextResponse.json({ error: message, details }, { status });
}
