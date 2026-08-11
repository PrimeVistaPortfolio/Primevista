import { NextResponse } from "next/server";
import { z } from "zod";
import { uploadToCloudinary } from "@primevista/shared";
import { requireAdmin, jsonError } from "@/lib/apiAuth";

const uploadSchema = z.object({
  file: z.string().min(1), // base64 data URI from the admin's file input
  folder: z.string().optional(),
  resourceType: z.enum(["image", "video", "raw"]).optional(),
});

export const POST = requireAdmin(async (request) => {
  const body = await request.json().catch(() => null);
  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  try {
    const result = await uploadToCloudinary(parsed.data.file, {
      folder: parsed.data.folder || "primevista",
      resourceType: parsed.data.resourceType || "image",
    });
    return NextResponse.json({ media: result });
  } catch (err) {
    console.error("[media/upload]", err);
    return jsonError("Upload failed", 502);
  }
});
