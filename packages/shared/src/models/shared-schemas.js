const { Schema } = require("mongoose");

// Reusable image/video asset stored via Cloudinary.
const MediaSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "model3d"], default: "image" },
    alt: { type: String, default: "" },
    width: Number,
    height: Number,
  },
  { _id: false }
);

// Per-page/per-entity SEO overrides. All optional — frontend falls back to
// generated defaults (name + template) when these are blank.
const SeoSchema = new Schema(
  {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    ogImage: { type: MediaSchema, default: null },
    canonicalUrl: { type: String, default: "" },
    noIndex: { type: Boolean, default: false },
  },
  { _id: false }
);

const SocialLinksSchema = new Schema(
  {
    website: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },
    github: { type: String, default: "" },
    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    dribbble: { type: String, default: "" },
  },
  { _id: false }
);

module.exports = { MediaSchema, SeoSchema, SocialLinksSchema };
