import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { dbConnect, TeamMember, teamMemberSchema } from "@primevista/shared";
import { requireAdmin, jsonError } from "@/lib/apiAuth";

export async function GET(request) {
  await dbConnect();
  const includeAll = new URL(request.url).searchParams.get("all") === "true";
  const query = includeAll ? {} : { visible: true };
  const members = await TeamMember.find(query).sort({ order: 1 }).lean();
  return NextResponse.json({ members });
}

export const POST = requireAdmin(async (request) => {
  const body = await request.json().catch(() => null);
  const parsed = teamMemberSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  await dbConnect();
  const member = await TeamMember.create(parsed.data);
  revalidateTag("team");
  return NextResponse.json({ member }, { status: 201 });
});
