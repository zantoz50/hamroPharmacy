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
      type: Number,
      ref: "Tenant",
      required: false,
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
    this.sectorId = counter.seq;
  }
  next();
});

const categorySchema = new mongoose.Schema(
  {
    categoryId: { type: Number, unique: true }, // custom ID
    name: { type: String, required: true, trim: true },
    sectorId: {
      type: Number,
      ref: "Sector",
      required: true,
    },
    tenantId: {
      type: Number,
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
    this.categoryId = counter.seq;
  }
  next();
});

const Sector = (module.exports = mongoose.model("Sector", sectorSchema));
const Category = (module.exports = mongoose.model("Category", categorySchema));
module.exports = { Sector, Category };
