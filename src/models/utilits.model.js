const mongoose = require("mongoose");
const Counter = require("./counter.model");
const sectorSchema = new mongoose.Schema(
  {
    sectorId: { type: Number, unique: true }, // custom ID
    name: {
      type: String,
      enum: ["Restaurant", "Cafeteria", "Mart"],
      required: true,
      unique: true,
    },
    description: { type: String },
    isActive: {
      type: Boolean,
      default: false,
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
// sectorSchema.index({ tenantId: 1, name: 1 }, { unique: true });
sectorSchema.statics.ensureDefaults = async function () {
  const count = await this.countDocuments();
  if (count === 0) {
    await this.insertMany([
      { sectorId: 1, name: "restaurant", description: "restaurant sector" },
      { sectorId: 2, name: "cafeteria", description: "cafeteria sector" },
      { sectorId: 3, name: "mart", description: "mart sector" },
    ]);
  }
};

const categorySchema = new mongoose.Schema(
  {
    categoryId: { type: Number, unique: true }, // custom ID
    name: { type: String, required: true, trim: true },
    sectorId: {
      type: Number,
      required: true,
    },
    tenantId: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
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

const Sector = mongoose.model("Sector", sectorSchema);
const Category = mongoose.model("Category", categorySchema);
module.exports = { Sector, Category };
