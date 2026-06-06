"use strict";

const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    sector: {
      type: String,
      enum: ["restaurant", "cafeteria", "mart", "global"],
      required: true,
    },
    userId: { type: String, required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String, required: true },
    tenantId: { type: Number, required: true, index: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);
