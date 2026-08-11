const { z } = require("zod");
const { mediaSchema } = require("./project");

const clientSchema = z.object({
  name: z.string().trim().min(1).max(150),
  logo: mediaSchema.nullable().optional(),
  url: z.string().url().optional().or(z.literal("")),
  order: z.number().optional().default(0),
  visible: z.boolean().optional().default(true),
});

module.exports = { clientSchema };
