const { Schema, model, models } = require("mongoose");
const { MediaSchema, SocialLinksSchema } = require("./shared-schemas");

const TeamMemberSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "" },
    photo: { type: MediaSchema, default: null },
    bio: { type: String, default: "" },
    socials: { type: SocialLinksSchema, default: () => ({}) },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = models.TeamMember || model("TeamMember", TeamMemberSchema);
