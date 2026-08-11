const { Schema, model, models } = require("mongoose");

const InquirySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    company: { type: String, default: "" },
    budgetRange: { type: String, default: "" },
    serviceInterest: { type: String, default: "" },
    message: { type: String, required: true },

    status: {
      type: String,
      enum: ["new", "contacted", "in-progress", "closed"],
      default: "new",
      index: true,
    },
    notes: [
      {
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Anti-abuse metadata (not shown in admin UI)
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = models.Inquiry || model("Inquiry", InquirySchema);
