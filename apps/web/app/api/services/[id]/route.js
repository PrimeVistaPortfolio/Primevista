import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { dbConnect, Service, serviceSchema } from "@primevista/shared";
import { requireAdmin, jsonError } from "@/lib/apiAuth";

export const GET = requireAdmin(async (_request, { params }) => {
  await dbConnect();
  const service = await Service.findById(params.id).lean();
  if (!service) return jsonError("Not found", 404);
  return NextResponse.json({ service });
});

export const PUT = requireAdmin(async (request, { params }) => {
  const body = await request.json().catch(() => null);
  const parsed = serviceSchema.partial().safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  await dbConnect();
  const service = await Service.findByIdAndUpdate(params.id, { $set: parsed.data }, { new: true });
  if (!service) return jsonError("Not found", 404);

  revalidateTag("services");
  return NextResponse.json({ service });
});

export const DELETE = requireAdmin(async (_request, { params }) => {
  await dbConnect();
  const service = await Service.findByIdAndDelete(params.id);
  if (!service) return jsonError("Not found", 404);

  revalidateTag("services");
  return NextResponse.json({ success: true });
});
