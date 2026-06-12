const mongoose = require("mongoose");
const Counter = require("./counter.model");
const InventoryItemSchema = new mongoose.Schema(
  {
    inventoryId: { type: Number, unique: true }, // custom ID
    tenantId: {
      type: Number,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sectorId: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    cost: { type: Number, required: true, min: 0 },
    stock: {
      type: Number,
      required: false,
      min: 0,
    },
    minStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
    },
    discountPct: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true },
);
// Pre-save hook to auto-increment inventoryId
InventoryItemSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "inventoryId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.inventoryId = counter.seq;
  }
  next();
});
module.exports = mongoose.model("InventoryItem", InventoryItemSchema);
