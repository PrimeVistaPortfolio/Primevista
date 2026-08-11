const { Schema, model, models } = require("mongoose");
const { MediaSchema } = require("./shared-schemas");

// Client/partner logos shown in the scrolling logo strip on the public site.
const ClientSchema = new Schema(
  {
    name: { type: String, required: true },
    logo: { type: MediaSchema, default: null },
    url: { type: String, default: "" },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = models.Client || model("Client", ClientSchema);
