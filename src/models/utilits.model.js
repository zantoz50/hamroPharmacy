// models/sector.model.js
const mongoose = require("mongoose");
const Counter = require("./counter.model");
const sectorSchema = new mongoose.Schema(
  {
    sectorId: { type: Number, unique: true }, // custom ID
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
// Pre-save hook to auto-increment inventoryId
sectorSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "sectorId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.inventoryId = counter.seq;
  }
  next();
});
module.exports = mongoose.model("Sector", sectorSchema);

// models/category.model.js

const categorySchema = new mongoose.Schema(
  {
    categoryId: { type: Number, unique: true }, // custom ID
    name: { type: String, required: true, trim: true },
    sectorId: {
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

// Pre-save hook to auto-increment inventoryId
categorySchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "categoryId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.inventoryId = counter.seq;
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
