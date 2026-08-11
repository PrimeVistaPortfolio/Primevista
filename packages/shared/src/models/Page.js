const { Schema, model, models } = require("mongoose");
const { SeoSchema } = require("./shared-schemas");

// A flexible content block. `type` determines how the frontend renders `data`
// (e.g. "hero", "aboutStrip", "servicesGrid", "processTimeline", "cta").
const ContentBlockSchema = new Schema(
  {
    type: { type: String, required: true },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: true }
);

const PageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true }, // "home", "about", "contact"
    title: { type: String, required: true },
    blocks: { type: [ContentBlockSchema], default: [] },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = models.Page || model("Page", PageSchema);
