const { z } = require("zod");

const mediaSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  type: z.enum(["image", "video", "model3d"]).default("image"),
  alt: z.string().optional().default(""),
  width: z.number().optional(),
  height: z.number().optional(),
});

const seoSchema = z.object({
  metaTitle: z.string().max(70).optional().default(""),
  metaDescription: z.string().max(200).optional().default(""),
  ogImage: mediaSchema.nullable().optional(),
  canonicalUrl: z.string().optional().default(""),
  noIndex: z.boolean().optional().default(false),
});

const projectSchema = z.object({
  title: z.string().trim().min(2).max(150),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, kebab-case"),
  coverImage: mediaSchema.nullable().optional(),
  gallery: z.array(mediaSchema).optional().default([]),
  description: z.string().max(500).optional().default(""),
  content: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  techStack: z.array(z.string()).optional().default([]),
  client: z.string().optional().default(""),
  liveUrl: z.string().url().optional().or(z.literal("")),
  model3dUrl: z.string().optional().default(""),
  featured: z.boolean().optional().default(false),
  order: z.number().optional().default(0),
  status: z.enum(["draft", "published"]).optional().default("published"),
  seo: seoSchema.optional().default({}),
});

module.exports = { projectSchema, mediaSchema, seoSchema };
