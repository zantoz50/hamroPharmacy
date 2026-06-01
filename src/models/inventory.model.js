const mongoose = require("mongoose");

const InventoryItemSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
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
    vendorCost: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    skuIdentifier: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("InventoryItem", InventoryItemSchema);
