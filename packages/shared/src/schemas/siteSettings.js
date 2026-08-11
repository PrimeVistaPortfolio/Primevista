const { z } = require("zod");
const { mediaSchema, seoSchema } = require("./project");
const { socialLinksSchema } = require("./teamMember");
const { BASE_THEMES, THEME_MODES, THEME_REGION_KEYS } = require("../constants/themeRegions");

const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(150).optional(),
  tagline: z.string().max(300).optional(),
  logoLight: mediaSchema.nullable().optional(),
  logoDark: mediaSchema.nullable().optional(),
  favicon: mediaSchema.nullable().optional(),
  themeColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be a hex color")
    .optional(),
  fontChoice: z.string().max(80).optional(),
  baseTheme: z.enum(BASE_THEMES).optional(),
  // Unknown keys are dropped rather than rejected — a stale admin build should
  // not be able to fail the whole save.
  sectionThemes: z
    .record(z.string(), z.enum(THEME_MODES))
    .optional()
    .transform((themes) =>
      themes
        ? Object.fromEntries(Object.entries(themes).filter(([key]) => THEME_REGION_KEYS.includes(key)))
        : themes
    ),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(30).optional(),
  address: z.string().max(300).optional(),
  mapEmbedUrl: z.string().optional(),
  socialLinks: socialLinksSchema.optional(),
  defaultSeo: seoSchema.optional(),
  metaTitleTemplate: z.string().max(200).optional(),
  serviceInterestOptions: z.array(z.string()).optional(),
  budgetRangeOptions: z.array(z.string()).optional(),
});

module.exports = { siteSettingsSchema };
