import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { dbConnect, Service, SERVICE_CATALOG_SEED } from "@primevista/shared";
import { requireAdmin } from "@/lib/apiAuth";

// Admin "Seed default catalog" action — bulk-creates the starter service list.
// Skips any slug that already exists so it's safe to run more than once.
export const POST = requireAdmin(async () => {
  await dbConnect();
  const existingSlugs = new Set((await Service.find({}, "slug").lean()).map((s) => s.slug));
  const toInsert = SERVICE_CATALOG_SEED.filter((s) => !existingSlugs.has(s.slug));

  if (toInsert.length) {
    await Service.insertMany(toInsert);
    revalidateTag("services");
  }

  return NextResponse.json({ inserted: toInsert.length, skipped: SERVICE_CATALOG_SEED.length - toInsert.length });
});
