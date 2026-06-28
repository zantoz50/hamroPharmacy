// models/tenant.model.js
const mongoose = require("mongoose");
const Counter = require("./counter.model");
const tenantSchema = new mongoose.Schema(
  {
    tenantId: { type: Number, unique: true, index: true }, // auto-increment field
    companyName: { type: String, required: true, unique: true, trim: true },
    subscriptionPlan: { type: String, required: true }, // e.g. "restaurant", "cafeteria", "mart", "all"
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Pre-save hook to auto-increment tenantId
tenantSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "tenantId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.tenantId = counter.seq;
  }
  next();
});

module.exports = mongoose.model("Tenant", tenantSchema);
