import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { dbConnect, Project, projectSchema } from "@primevista/shared";
import { requireAdmin, jsonError } from "@/lib/apiAuth";

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get("featured");
  const tag = searchParams.get("tag");
  const includeAll = searchParams.get("all") === "true"; // admin listing includes drafts

  const query = includeAll ? {} : { status: "published" };
  if (featured === "true") query.featured = true;
  if (tag) query.tags = tag;

  const projects = await Project.find(query).sort({ order: 1, createdAt: -1 }).lean();
  return NextResponse.json({ projects });
}

export const POST = requireAdmin(async (request) => {
  const body = await request.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  await dbConnect();
  const existing = await Project.findOne({ slug: parsed.data.slug });
  if (existing) return jsonError("A project with this slug already exists", 409);

  const project = await Project.create(parsed.data);
  revalidateTag("projects");
  return NextResponse.json({ project }, { status: 201 });
});
