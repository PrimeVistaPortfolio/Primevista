import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteFromCloudinary } from "@primevista/shared";
import { requireAdmin, jsonError } from "@/lib/apiAuth";

const deleteSchema = z.object({
  publicId: z.string().min(1),
  resourceType: z.enum(["image", "video", "raw"]).optional(),
});

export const POST = requireAdmin(async (request) => {
  const body = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    await deleteFromCloudinary(parsed.data.publicId, parsed.data.resourceType || "image");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[media/delete]", err);
    return jsonError("Delete failed", 502);
  }
});
