"use strict";

const mongoose = require("mongoose");
const Counter = require("./counter.model");

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, unique: true }, // custom auto-increment ID
    sectorId: {
      type: Number,
      required: true,
    },
    items: [
      {
        inventoryId: { type: String, required: true },
        sectorId: { type: Number, required: true },
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
    tenantId: {
      type: Number,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Pre-save hook to auto-increment orderId
OrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "orderId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    this.orderId = counter.seq;
  }
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
