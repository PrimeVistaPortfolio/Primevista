import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { dbConnect, Page } from "@primevista/shared";
import { requireAdmin, jsonError } from "@/lib/apiAuth";

const blockSchema = z.object({
  _id: z.string().optional(),
  type: z.string(),
  order: z.number().optional().default(0),
  visible: z.boolean().optional().default(true),
  data: z.record(z.any()).optional().default({}),
});

const pageUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  blocks: z.array(blockSchema).optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      canonicalUrl: z.string().optional(),
      noIndex: z.boolean().optional(),
    })
    .optional(),
});

export async function GET(_request, { params }) {
  const { slug } = await params;
  await dbConnect();
  const page = await Page.findOne({ slug }).lean();
  if (!page) return jsonError("Not found", 404);
  return NextResponse.json({ page });
}

export const PUT = requireAdmin(async (request, { params }) => {
  const body = await request.json().catch(() => null);
  const parsed = pageUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  await dbConnect();
  const page = await Page.findOneAndUpdate(
    { slug: params.slug },
    { $set: parsed.data, $setOnInsert: { slug: params.slug } },
    { new: true, upsert: true }
  );

  revalidateTag("pages");
  return NextResponse.json({ page });
});
