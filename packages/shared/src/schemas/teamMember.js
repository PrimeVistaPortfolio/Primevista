const { z } = require("zod");
const { mediaSchema } = require("./project");

const socialLinksSchema = z.object({
  website: z.string().optional().default(""),
  linkedin: z.string().optional().default(""),
  twitter: z.string().optional().default(""),
  github: z.string().optional().default(""),
  instagram: z.string().optional().default(""),
  facebook: z.string().optional().default(""),
  dribbble: z.string().optional().default(""),
});

const teamMemberSchema = z.object({
  name: z.string().trim().min(2).max(150),
  role: z.string().max(150).optional().default(""),
  photo: mediaSchema.nullable().optional(),
  bio: z.string().max(2000).optional().default(""),
  socials: socialLinksSchema.optional().default({}),
  order: z.number().optional().default(0),
  visible: z.boolean().optional().default(true),
});

module.exports = { teamMemberSchema, socialLinksSchema };
