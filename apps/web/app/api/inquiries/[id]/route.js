import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect, Inquiry } from "@primevista/shared";
import { requireAdmin, jsonError } from "@/lib/apiAuth";

const updateSchema = z.object({
  status: z.enum(["new", "contacted", "in-progress", "closed"]).optional(),
  note: z.string().min(1).max(2000).optional(),
});

export const GET = requireAdmin(async (_request, { params }) => {
  await dbConnect();
  const inquiry = await Inquiry.findById(params.id).lean();
  if (!inquiry) return jsonError("Not found", 404);
  return NextResponse.json({ inquiry });
});

export const PUT = requireAdmin(async (request, { params }) => {
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  await dbConnect();
  const update = {};
  if (parsed.data.status) update.status = parsed.data.status;

  const ops = { $set: update };
  if (parsed.data.note) {
    ops.$push = { notes: { text: parsed.data.note, createdAt: new Date() } };
  }

  const inquiry = await Inquiry.findByIdAndUpdate(params.id, ops, { new: true });
  if (!inquiry) return jsonError("Not found", 404);
  return NextResponse.json({ inquiry });
});

export const DELETE = requireAdmin(async (_request, { params }) => {
  await dbConnect();
  const inquiry = await Inquiry.findByIdAndDelete(params.id);
  if (!inquiry) return jsonError("Not found", 404);
  return NextResponse.json({ success: true });
});
