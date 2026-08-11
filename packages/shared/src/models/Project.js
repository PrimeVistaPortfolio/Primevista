const { Schema, model, models } = require("mongoose");
const { MediaSchema, SeoSchema } = require("./shared-schemas");

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    coverImage: { type: MediaSchema, default: null },
    gallery: { type: [MediaSchema], default: [] },
    description: { type: String, default: "" },
    content: { type: String, default: "" }, // long-form rich text (case study body)
    tags: { type: [String], default: [], index: true },
    techStack: { type: [String], default: [] },
    client: { type: String, default: "" },
    liveUrl: { type: String, default: "" },
    model3dUrl: { type: String, default: "" }, // optional .glb/.gltf via Cloudinary
    featured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = models.Project || model("Project", ProjectSchema);
