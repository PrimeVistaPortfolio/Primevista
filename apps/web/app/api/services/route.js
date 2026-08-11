import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { dbConnect, Service, serviceSchema } from "@primevista/shared";
import { requireAdmin, jsonError } from "@/lib/apiAuth";

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const includeAll = searchParams.get("all") === "true";

  const query = includeAll ? {} : { status: "published" };
  if (category) query.category = category;

  const services = await Service.find(query).sort({ category: 1, order: 1 }).lean();
  return NextResponse.json({ services });
}

export const POST = requireAdmin(async (request) => {
  const body = await request.json().catch(() => null);
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  await dbConnect();
  const existing = await Service.findOne({ slug: parsed.data.slug });
  if (existing) return jsonError("A service with this slug already exists", 409);

  const service = await Service.create(parsed.data);
  revalidateTag("services");
  return NextResponse.json({ service }, { status: 201 });
});
