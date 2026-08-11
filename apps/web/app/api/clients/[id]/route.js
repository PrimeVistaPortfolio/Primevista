import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { dbConnect, Client, clientSchema } from "@primevista/shared";
import { requireAdmin, jsonError } from "@/lib/apiAuth";

export const GET = requireAdmin(async (_request, { params }) => {
  await dbConnect();
  const client = await Client.findById(params.id).lean();
  if (!client) return jsonError("Not found", 404);
  return NextResponse.json({ client });
});

export const PUT = requireAdmin(async (request, { params }) => {
  const body = await request.json().catch(() => null);
  const parsed = clientSchema.partial().safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  await dbConnect();
  const client = await Client.findByIdAndUpdate(params.id, { $set: parsed.data }, { new: true });
  if (!client) return jsonError("Not found", 404);

  revalidateTag("clients");
  return NextResponse.json({ client });
});

export const DELETE = requireAdmin(async (_request, { params }) => {
  await dbConnect();
  const client = await Client.findByIdAndDelete(params.id);
  if (!client) return jsonError("Not found", 404);

  revalidateTag("clients");
  return NextResponse.json({ success: true });
});
