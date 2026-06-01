// models/tenant.model.js
const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, unique: true, trim: true },
    subscriptionPlan: { type: String, required: true }, // e.g. "restaurant", "cafeteria", "mart", "all"
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Tenant", tenantSchema);
