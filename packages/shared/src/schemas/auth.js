const { z } = require("zod");

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
});

const inviteAdminSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
  role: z.enum(["owner", "admin"]).optional().default("admin"),
});

module.exports = { loginSchema, inviteAdminSchema };
