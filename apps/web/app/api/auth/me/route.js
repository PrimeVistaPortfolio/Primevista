import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/apiAuth";

export const GET = requireAdmin(async (_request, _ctx, payload) => {
  return NextResponse.json({
    user: { id: payload.sub, name: payload.name, email: payload.email, role: payload.role },
  });
});
