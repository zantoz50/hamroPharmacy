"use strict";

const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    sector: {
      type: String,
      enum: ["restaurant", "cafeteria", "mart"],
      required: true,
    },
    items: [
      {
        itemId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        priceOnOrder: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },
    customerName: { type: String, default: "Guest Customer" },
    deliveryType: {
      type: String,
      enum: ["dine-in", "takeaway", "delivery"],
      required: true,
    },
    tenantId: { type: Number, required: true, index: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", OrderSchema);
