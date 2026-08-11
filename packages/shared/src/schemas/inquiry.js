const { z } = require("zod");

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120),
  email: z.string().trim().email("Invalid email address").max(200),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  budgetRange: z.string().trim().max(100).optional().or(z.literal("")),
  serviceInterest: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please provide a few more details").max(5000),
  // Honeypot: must arrive empty. Bots that autofill every field will trip this.
  website: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

module.exports = { inquirySchema };
