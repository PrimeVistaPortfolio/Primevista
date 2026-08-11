const { Schema, model, models } = require("mongoose");
const { SeoSchema } = require("./shared-schemas");

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    icon: { type: String, default: "" }, // icon name/key rendered by frontend icon map
    shortDescription: { type: String, default: "" }, // used on listing cards
    longDescription: { type: String, default: "" }, // rich text body for the [slug] page
    keywordFocus: { type: String, default: "" }, // primary target keyword, shown as SEO hint in admin
    relatedProjectTags: { type: [String], default: [] }, // pulls matching Projects by tag
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = models.Service || model("Service", ServiceSchema);
