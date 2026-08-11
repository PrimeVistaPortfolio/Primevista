import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { dbConnect, TeamMember, teamMemberSchema } from "@primevista/shared";
import { requireAdmin, jsonError } from "@/lib/apiAuth";

export const GET = requireAdmin(async (_request, { params }) => {
  await dbConnect();
  const member = await TeamMember.findById(params.id).lean();
  if (!member) return jsonError("Not found", 404);
  return NextResponse.json({ member });
});

export const PUT = requireAdmin(async (request, { params }) => {
  const body = await request.json().catch(() => null);
  const parsed = teamMemberSchema.partial().safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  await dbConnect();
  const member = await TeamMember.findByIdAndUpdate(params.id, { $set: parsed.data }, { new: true });
  if (!member) return jsonError("Not found", 404);

  revalidateTag("team");
  return NextResponse.json({ member });
});

export const DELETE = requireAdmin(async (_request, { params }) => {
  await dbConnect();
  const member = await TeamMember.findByIdAndDelete(params.id);
  if (!member) return jsonError("Not found", 404);

  revalidateTag("team");
  return NextResponse.json({ success: true });
});
