const mongoose = require("mongoose");

const InventoryItemSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sector: {
      type: String,
      enum: ["restaurant", "cafeteria", "mart"],
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
    stock: {
      type: Number,
      required: false,
      min: 0,
    },
    skuIdentifier: {
      type: String,
      default: null,
      trim: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    productImageUrl: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("InventoryItem", InventoryItemSchema);
