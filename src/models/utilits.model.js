// models/sector.model.js
const mongoose = require("mongoose");

const sectorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["restaurant", "cafeteria", "mart"],
      required: true,
      unique: true,
    },
    description: { type: String },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Sector", sectorSchema);

// models/category.model.js

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sector",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Category", categorySchema);
