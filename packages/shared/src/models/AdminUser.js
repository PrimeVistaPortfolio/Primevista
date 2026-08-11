const { Schema, model, models } = require("mongoose");

const AdminUserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["owner", "admin"], default: "admin" },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = models.AdminUser || model("AdminUser", AdminUserSchema);
