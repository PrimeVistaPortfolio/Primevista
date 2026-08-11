import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { dbConnect, Project, projectSchema } from "@primevista/shared";
import { requireAdmin, jsonError } from "@/lib/apiAuth";

export const GET = requireAdmin(async (_request, { params }) => {
  await dbConnect();
  const project = await Project.findById(params.id).lean();
  if (!project) return jsonError("Not found", 404);
  return NextResponse.json({ project });
});

export const PUT = requireAdmin(async (request, { params }) => {
  const body = await request.json().catch(() => null);
  const parsed = projectSchema.partial().safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  await dbConnect();
  const project = await Project.findByIdAndUpdate(params.id, { $set: parsed.data }, { new: true });
  if (!project) return jsonError("Not found", 404);

  revalidateTag("projects");
  return NextResponse.json({ project });
});

export const DELETE = requireAdmin(async (_request, { params }) => {
  await dbConnect();
  const project = await Project.findByIdAndDelete(params.id);
  if (!project) return jsonError("Not found", 404);

  revalidateTag("projects");
  return NextResponse.json({ success: true });
});
