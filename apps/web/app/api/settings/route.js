import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  dbConnect,
  SiteSettings,
  siteSettingsSchema,
  THEME_REGIONS,
  THEME_MODES,
  BASE_THEMES,
  DEFAULT_SECTION_THEMES,
} from "@primevista/shared";
import { requireAdmin, jsonError } from "@/lib/apiAuth";

export async function GET() {
  await dbConnect();
  let settings = await SiteSettings.findOne({ singletonKey: "site-settings" }).lean();
  if (!settings) settings = (await SiteSettings.create({})).toObject();

  // The themeable-region registry rides along with the settings so the admin
  // can render the Appearance controls without duplicating the list (it can't
  // import the shared package directly — that would pull mongoose into the
  // browser bundle).
  return NextResponse.json({
    settings,
    theme: {
      regions: THEME_REGIONS,
      modes: THEME_MODES,
      baseThemes: BASE_THEMES,
      defaults: DEFAULT_SECTION_THEMES,
    },
  });
}

export const PUT = requireAdmin(async (request) => {
  const body = await request.json().catch(() => null);
  const parsed = siteSettingsSchema.partial().safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

  await dbConnect();
  const settings = await SiteSettings.findOneAndUpdate(
    { singletonKey: "site-settings" },
    { $set: parsed.data },
    { new: true, upsert: true }
  );

  revalidateTag("site-settings");
  return NextResponse.json({ settings });
});
