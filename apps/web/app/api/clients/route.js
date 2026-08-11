import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { dbConnect, Client, clientSchema } from "@primevista/shared";
import { requireAdmin, jsonError } from "@/lib/apiAuth";

export async function GET(request) {
  await dbConnect();
  const includeAll = new URL(request.url).searchParams.get("all") === "true";
  const query = includeAll ? {} : { visible: true };
  const clients = await Client.find(query).sort({ order: 1, createdAt: 1 }).lean();
  return NextResponse.json({ clients });
}

export const POST = requireAdmin(async (request) => {
  const body = await request.json().catch(() => null);
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  await dbConnect();
  const client = await Client.create(parsed.data);
  revalidateTag("clients");
  return NextResponse.json({ client }, { status: 201 });
});
