const { z } = require("zod");
const { seoSchema } = require("./project");

const serviceSchema = z.object({
  title: z.string().trim().min(2).max(150),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, kebab-case"),
  category: z.string().trim().min(2).max(150),
  icon: z.string().optional().default(""),
  shortDescription: z.string().max(300).optional().default(""),
  longDescription: z.string().optional().default(""),
  keywordFocus: z.string().max(150).optional().default(""),
  relatedProjectTags: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
  order: z.number().optional().default(0),
  status: z.enum(["draft", "published"]).optional().default("published"),
  seo: seoSchema.optional().default({}),
});

module.exports = { serviceSchema };
