const { Schema, model, models } = require("mongoose");
const { MediaSchema, SeoSchema, SocialLinksSchema } = require("./shared-schemas");
const { BASE_THEMES, THEME_MODES } = require("../constants/themeRegions");

// Singleton document (single row identified by singletonKey) holding
// site-wide config editable from Admin > Site Settings.
const SiteSettingsSchema = new Schema(
  {
    singletonKey: { type: String, default: "site-settings", unique: true },

    siteName: { type: String, default: "PrimeVista Technologies" },
    tagline: { type: String, default: "" },

    logoLight: { type: MediaSchema, default: null },
    logoDark: { type: MediaSchema, default: null },
    favicon: { type: MediaSchema, default: null },

    themeColor: { type: String, default: "#3B82F6" },
    fontChoice: { type: String, default: "Inter" },

    // Light/dark control. `baseTheme` is the site-wide ground; `sectionThemes`
    // maps a region key from THEME_REGIONS to "inherit" | "dark" | "light", so
    // an admin can flip individual bands without touching code.
    baseTheme: { type: String, enum: BASE_THEMES, default: "dark" },
    sectionThemes: {
      type: Map,
      of: { type: String, enum: THEME_MODES },
      default: () => ({}),
    },

    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    address: { type: String, default: "" },
    mapEmbedUrl: { type: String, default: "" },

    socialLinks: { type: SocialLinksSchema, default: () => ({}) },

    defaultSeo: { type: SeoSchema, default: () => ({}) },
    metaTitleTemplate: { type: String, default: "{name} | PrimeVista Technologies" },

    serviceInterestOptions: { type: [String], default: [] },
    budgetRangeOptions: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = models.SiteSettings || model("SiteSettings", SiteSettingsSchema);
